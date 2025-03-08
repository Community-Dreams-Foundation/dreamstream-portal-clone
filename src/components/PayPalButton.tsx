
import { useEffect, useState } from 'react';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const plans = {
  monthly: {
    planId: 'P-1C748246YG018921SM6DKRYI',
    price: 15,
    newMemberPrice: 15
  },
  quarterly: {
    planId: 'YOUR_QUARTERLY_PLAN_ID',
    price: 40
  },
  semiAnnual: {
    planId: 'YOUR_SEMI_ANNUAL_PLAN_ID',
    price: 75
  },
  annual: {
    planId: 'YOUR_ANNUAL_PLAN_ID',
    price: 140
  }
};

const PayPalButton = () => {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const db = getFirestore();
  const isNewMember = true; // This should be determined based on user's history

  const saveSubscriptionToFirebase = async (subscriptionID: string, status: string, planType: string) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to subscribe"
      });
      return;
    }

    try {
      const subscriptionRef = doc(db, 'subscriptions', currentUser.uid);
      const dueDate = new Date();
      dueDate.setDate(5);
      if (dueDate.getDate() > 5) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      await setDoc(subscriptionRef, {
        subscriptionID,
        status,
        planType,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: dueDate.toISOString(),
        userID: currentUser.uid,
        email: currentUser.email,
        lateFee: 0,
        isNewMember,
        price: isNewMember && planType === 'monthly' ? plans.monthly.newMemberPrice : plans[planType as keyof typeof plans].price
      });

      toast({
        title: "Subscription successful",
        description: `Your ${planType} subscription has been activated`
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save subscription details"
      });
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AWuQ6kU30i41JYzn1XDBZ8ui59Lf2cxKkgkmxA98uAvcT-tUcP3VkHdNZABQyoLAJC3TgP2REv_aT7Y_&vault=true&intent=subscription";
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: plans[selectedPlan as keyof typeof plans].planId
            });
          },
          onApprove: async function(data: any) {
            await saveSubscriptionToFirebase(
              data.subscriptionID,
              'ACTIVE',
              selectedPlan
            );
            console.log('Subscription successful:', data.subscriptionID);
          },
          onError: function(err: any) {
            console.error('PayPal Error:', err);
            toast({
              variant: "destructive",
              title: "PayPal Error",
              description: "There was an error processing your subscription"
            });
          }
        }).render('#paypal-button-container');
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [currentUser, selectedPlan]);

  return (
    <div className="space-y-4">
      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="monthly">
            Monthly ({isNewMember ? `$${plans.monthly.newMemberPrice}` : `$${plans.monthly.price}`})
          </SelectItem>
          <SelectItem value="quarterly">
            Quarterly (${plans.quarterly.price})
          </SelectItem>
          <SelectItem value="semiAnnual">
            Semi-Annual (${plans.semiAnnual.price})
          </SelectItem>
          <SelectItem value="annual">
            Annual (${plans.annual.price})
          </SelectItem>
        </SelectContent>
      </Select>
      <div id="paypal-button-container" className="w-full max-w-xs mx-auto"></div>
    </div>
  );
};

export default PayPalButton;
