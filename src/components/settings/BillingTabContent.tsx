
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PayPalButton from "@/components/PayPalButton";
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement";

export const BillingTabContent: React.FC = () => {
  const [showSubscription, setShowSubscription] = useState(false);

  return (
    <div className="grid gap-4">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Subscription Status</h2>
        <p className="text-muted-foreground mb-6">Manage your current subscription or sign up for premium features</p>
        <Separator className="mb-6" />
        
        <SubscriptionManagement />
        
        {!showSubscription ? (
          <div className="mt-6">
            <Button 
              onClick={() => setShowSubscription(true)}
              className="w-full"
            >
              Upgrade your subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground">
              Subscribe to unlock premium features at $15/month
            </p>
            <PayPalButton />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSubscription(false)} 
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Billing History</h2>
        
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  Apr 15, 2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  $15.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  Mar 15, 2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  $15.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  Feb 15, 2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  $15.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
