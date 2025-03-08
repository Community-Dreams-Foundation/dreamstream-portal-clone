
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { WaiverRequest } from "@/types/waiver";

interface WaiversTableProps {
  waivers: WaiverRequest[];
  onReviewClick: (waiver: WaiverRequest) => void;
}

export function WaiversTable({ waivers, onReviewClick }: WaiversTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {waivers.map((waiver) => (
          <TableRow key={waiver.waiver_id}>
            <TableCell className="font-medium">{waiver.type}</TableCell>
            <TableCell>{waiver.status}</TableCell>
            <TableCell>{waiver.submitted_at}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReviewClick(waiver)}
              >
                Review
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

