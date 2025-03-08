
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

type Payment = {
  id: string
  userId: string
  amount: number
  status: "pending" | "completed" | "failed"
  date: string
  type: "membership" | "waiver" | "other"
}

const mockPayments: Payment[] = [
  {
    id: "1",
    userId: "user1",
    amount: 99.99,
    status: "completed",
    date: new Date().toISOString(),
    type: "membership",
  },
  {
    id: "2",
    userId: "user2",
    amount: 49.99,
    status: "pending",
    date: new Date().toISOString(),
    type: "waiver",
  },
]

export function PaymentsTable() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      // Simulated API call
      return mockPayments
    },
  })

  if (isLoading) {
    return <div>Loading payments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <Button>Export CSV</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.id}</TableCell>
              <TableCell>{payment.userId}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell className="capitalize">{payment.type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.status === "completed"
                      ? "default"
                      : payment.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(payment.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
