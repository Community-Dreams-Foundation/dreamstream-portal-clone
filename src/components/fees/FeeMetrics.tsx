
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";

export function FeeMetrics() {
  const [metrics, setMetrics] = useState({
    totalFees: 0,
    averageFee: 0,
    totalTransactions: 0
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    const calculateMetrics = async () => {
      if (!currentUser) return;

      const feeQuery = query(
        collection(db, 'feeHistory'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(feeQuery);
      const fees = snapshot.docs.map(doc => doc.data());
      
      const totalFees = fees.reduce((sum, fee) => sum + fee.calculatedFee, 0);
      const totalTransactions = fees.length;
      const averageFee = totalTransactions > 0 ? totalFees / totalTransactions : 0;

      setMetrics({
        totalFees,
        averageFee,
        totalTransactions
      });
    };

    calculateMetrics();
  }, [currentUser]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 flex items-center space-x-4">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Fees</p>
          <h3 className="text-2xl font-bold">${metrics.totalFees.toFixed(2)}</h3>
        </div>
      </Card>

      <Card className="p-6 flex items-center space-x-4">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Average Fee</p>
          <h3 className="text-2xl font-bold">${metrics.averageFee.toFixed(2)}</h3>
        </div>
      </Card>

      <Card className="p-6 flex items-center space-x-4">
        <Receipt className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
          <h3 className="text-2xl font-bold">{metrics.totalTransactions}</h3>
        </div>
      </Card>
    </div>
  );
}
