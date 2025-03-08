
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface Waiver {
  id: string;
  userId: string;
  type: "leadership" | "sweat-equity" | "competition" | "hardship" | "referral";
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewComments?: string;
}

export function WaiverList() {
  const { data: waivers, isLoading } = useQuery<Waiver[]>({
    queryKey: ["waivers"],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return [
        {
          id: "WVR001",
          userId: "USR12345",
          type: "referral",
          status: "pending",
          submittedAt: new Date().toISOString(),
        },
        {
          id: "WVR002",
          userId: "USR12346",
          type: "hardship",
          status: "approved",
          submittedAt: new Date().toISOString(),
          reviewComments: "Documentation verified",
        },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waivers?.map((waiver) => (
            <TableRow key={waiver.id}>
              <TableCell>{waiver.id}</TableCell>
              <TableCell className="capitalize">{waiver.type.replace("-", " ")}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    waiver.status === "approved"
                      ? "default"
                      : waiver.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {waiver.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(waiver.submittedAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    // Handle review action
                    console.log("Review waiver:", waiver.id);
                  }}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
