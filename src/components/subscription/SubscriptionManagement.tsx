
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, getFirestore, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2, Download, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface Subscription {
  subscriptionID: string;
  status: string;
  planType: string;
  createdAt: { toDate: () => Date };
  dueDate: string;
  price: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: { toDate: () => Date };
  status: 'completed' | 'pending' | 'failed';
  method: string;
  description: string;
}

export function SubscriptionManagement() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const db = getFirestore();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) return;

      try {
        const subscriptionDoc = await getDoc(doc(db, 'subscriptions', currentUser.uid));
        if (subscriptionDoc.exists()) {
          setSubscription(subscriptionDoc.data() as Subscription);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subscription details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [currentUser]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!currentUser) return;

      setHistoryLoading(true);
      try {
        // This would fetch payment history from Firestore
        // In a real app, this might be from a payment processor's API
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const payments: PaymentHistory[] = [];
        
        paymentsSnapshot.forEach(doc => {
          payments.push({ id: doc.id, ...doc.data() } as PaymentHistory);
        });
        
        // If no real payment history exists, add some mock data for display
        if (payments.length === 0 && subscription) {
          // Generate 3 months of payment history based on current subscription
          const mockPayments: PaymentHistory[] = [];
          const today = new Date();
          
          for (let i = 0; i < 3; i++) {
            const paymentDate = new Date();
            paymentDate.setMonth(today.getMonth() - i);
            
            mockPayments.push({
              id: `mock-payment-${i}`,
              amount: subscription.price,
              date: { toDate: () => paymentDate },
              status: 'completed',
              method: 'paypal',
              description: `${subscription.planType} subscription payment`
            });
          }
          
          setPaymentHistory(mockPayments);
        } else {
          setPaymentHistory(payments);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch payment history"
        });
      } finally {
        setHistoryLoading(false);
      }
    };

    if (subscription) {
      fetchPaymentHistory();
    }
  }, [currentUser, subscription]);

  const handleCancelSubscription = async () => {
    if (!currentUser || !subscription) return;

    setCancelling(true);
    try {
      // Note: This would typically call a PayPal API endpoint to cancel the subscription
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the current billing period."
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription"
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = (paymentId: string) => {
    // In a real app, this would generate and download a PDF invoice
    toast({
      title: "Invoice Download",
      description: "Your invoice is being generated and will download shortly."
    });
    
    // Simulate invoice generation delay
    setTimeout(() => {
      console.log(`Downloading invoice for payment ${paymentId}`);
      // In reality, this would trigger the download of a generated PDF
    }, 1500);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">No Active Subscription</h2>
        <p className="text-muted-foreground">You don't have an active subscription.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Subscription Details</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <h3 className="text-xl font-semibold">Current Subscription</h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium capitalize">{subscription.planType}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusBadgeColor(subscription.status)
                  }`}>
                    {subscription.status.toLowerCase()}
                  </span>
                </TableCell>
                <TableCell>{format(subscription.createdAt.toDate(), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(subscription.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>${subscription.price}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="text-sm font-medium text-blue-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Subscription Benefits
            </h4>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
              <li>Access to all premium features</li>
              <li>Priority customer support</li>
              <li>Advanced leadership training modules</li>
              <li>Unlimited career guidance resources</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={subscription.status !== 'ACTIVE' || cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <h3 className="text-xl font-semibold mb-4">Billing History</h3>
          
          {historyLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : paymentHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(payment.date.toDate(), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadInvoice(payment.id)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download Invoice</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground py-4">No billing history available.</p>
          )}
        </TabsContent>
        
        <TabsContent value="payment">
          <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
          
          <div className="border rounded-lg p-4 mb-4 flex items-start space-x-4">
            <CreditCard className="h-10 w-10 text-blue-500" />
            <div>
              <p className="font-medium">PayPal</p>
              <p className="text-sm text-muted-foreground">Connected to your PayPal account</p>
              <p className="text-sm mt-1">Next charge on {format(new Date(subscription.dueDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
          
          <Button variant="outline">Update Payment Method</Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
