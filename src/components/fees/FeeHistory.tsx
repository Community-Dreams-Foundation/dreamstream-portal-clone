
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FeeRecord {
  id: string;
  baseAmount: number;
  feeType: string;
  calculatedFee: number;
  timestamp: Date;
  status: string;
}

export function FeeHistory() {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const feeQuery = query(
      collection(db, 'feeHistory'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(feeQuery, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as FeeRecord[];
      
      setFeeRecords(records);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Fee History</h3>
        <p className="text-sm text-muted-foreground">
          View your past fee calculations and their details.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Base Amount</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Calculated Fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {record.timestamp.toLocaleDateString()}
                </TableCell>
                <TableCell>${record.baseAmount.toFixed(2)}</TableCell>
                <TableCell className="capitalize">{record.feeType}</TableCell>
                <TableCell>${record.calculatedFee.toFixed(2)}</TableCell>
                <TableCell className="capitalize">{record.status}</TableCell>
              </TableRow>
            ))}
            {feeRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No fee records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
