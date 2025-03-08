
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export function FeeCalculator() {
  const [amount, setAmount] = useState("");
  const [feeType, setFeeType] = useState("standard");
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const calculateFee = (baseAmount: number, type: string) => {
    switch (type) {
      case "standard":
        return baseAmount * 0.05; // 5% standard fee
      case "premium":
        return baseAmount * 0.08; // 8% premium fee
      case "enterprise":
        return baseAmount * 0.12; // 12% enterprise fee
      default:
        return baseAmount * 0.05;
    }
  };

  const handleCalculate = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to calculate fees"
      });
      return;
    }

    const baseAmount = parseFloat(amount);
    if (isNaN(baseAmount) || baseAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0"
      });
      return;
    }

    const calculatedFee = calculateFee(baseAmount, feeType);

    try {
      await addDoc(collection(db, 'feeHistory'), {
        userId: currentUser.uid,
        baseAmount,
        feeType,
        calculatedFee,
        timestamp: new Date(),
        status: 'calculated'
      });

      toast({
        title: "Fee Calculated",
        description: `The calculated fee is $${calculatedFee.toFixed(2)}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fee calculation"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Calculate Fee</h3>
        <p className="text-sm text-muted-foreground">
          Enter the base amount and select a fee type to calculate the applicable fee.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Base Amount ($)
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="feeType" className="text-sm font-medium">
            Fee Type
          </label>
          <Select value={feeType} onValueChange={setFeeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (5%)</SelectItem>
              <SelectItem value="premium">Premium (8%)</SelectItem>
              <SelectItem value="enterprise">Enterprise (12%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calculate Fee
        </Button>
      </div>
    </div>
  );
}
