
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, onValue } from 'firebase/database';
import type { UserMembership, MembershipPlan } from '@/types/membership';
import { Button } from "@/components/ui/button";

export function MembershipDashboard() {
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const db = getDatabase();
    const membershipsRef = ref(db, 'memberships');
    const plansRef = ref(db, 'membershipPlans');

    const unsubMemberships = onValue(membershipsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membershipsArray = Object.values(data) as UserMembership[];
        setMemberships(membershipsArray);
      }
    });

    const unsubPlans = onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const plansArray = Object.values(data) as MembershipPlan[];
        setPlans(plansArray);
      }
    });

    return () => {
      unsubMemberships();
      unsubPlans();
    };
  }, [currentUser]);

  const handleSuspendMembership = async (userId: string) => {
    try {
      const db = getDatabase();
      await fetch(`https://your-cloud-function-url.com/suspendMembership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      toast({
        title: "Membership Suspended",
        description: "The user's membership has been suspended successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend membership. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Membership Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {memberships.filter(m => m.status === 'active').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${calculateTotalRevenue(memberships, plans).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {memberships.filter(m => isNearingExpiration(m)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Member List</h3>
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership) => (
                  <tr key={membership.userId} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{membership.userId}</td>
                    <td className="px-6 py-4">
                      {plans.find(p => p.id === membership.planId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        membership.status === 'active' ? 'bg-green-100 text-green-800' :
                        membership.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {membership.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(membership.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSuspendMembership(membership.userId)}
                        disabled={membership.status !== 'active'}
                      >
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateTotalRevenue(memberships: UserMembership[], plans: MembershipPlan[]): number {
  return memberships
    .filter(m => m.status === 'active')
    .reduce((total, membership) => {
      const plan = plans.find(p => p.id === membership.planId);
      return total + (plan?.price || 0);
    }, 0);
}

function isNearingExpiration(membership: UserMembership): boolean {
  const expiryDate = new Date(membership.endDate);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiryDate <= thirtyDaysFromNow && membership.status === 'active';
}
