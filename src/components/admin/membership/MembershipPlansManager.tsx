
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MembershipPlan } from '@/types/membership';
import { getDatabase, ref, push, update } from 'firebase/database';

export function MembershipPlansManager() {
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const { toast } = useToast();

  const handleSavePlan = async (plan: Partial<MembershipPlan>) => {
    try {
      const db = getDatabase();
      const plansRef = ref(db, 'membershipPlans');
      
      if (editingPlan?.id) {
        await update(ref(db, `membershipPlans/${editingPlan.id}`), plan);
      } else {
        await push(plansRef, plan);
      }

      toast({
        title: "Success",
        description: "Membership plan saved successfully.",
      });
      setEditingPlan(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save membership plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSavePlan({
              name: formData.get('name') as string,
              tier: formData.get('tier') as 'basic' | 'premium' | 'enterprise',
              price: Number(formData.get('price')),
              billingCycle: formData.get('billingCycle') as 'monthly' | 'yearly',
              features: (formData.get('features') as string).split(',').map(f => f.trim()),
            });
          }}>
            <Input
              name="name"
              placeholder="Plan Name"
              defaultValue={editingPlan?.name}
              required
            />
            <Input
              name="price"
              type="number"
              placeholder="Price"
              defaultValue={editingPlan?.price}
              required
            />
            <Input
              name="features"
              placeholder="Features (comma-separated)"
              defaultValue={editingPlan?.features.join(', ')}
              required
            />
            <Button type="submit">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
