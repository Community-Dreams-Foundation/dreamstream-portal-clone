
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PerformanceMetrics } from "@/types/performance"

interface TeamPerformanceTableProps {
  data: PerformanceMetrics
}

export function TeamPerformanceTable({ data }: TeamPerformanceTableProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Task Completion Rate</TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Progress value={data.taskCompletionRate * 100} className="w-[60%]" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(data.taskCompletionRate * 100)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {data.taskCompletionRate >= 0.8 ? (
                <Badge>Excellent</Badge>
              ) : data.taskCompletionRate >= 0.6 ? (
                <Badge variant="secondary">Good</Badge>
              ) : (
                <Badge variant="destructive">Needs Improvement</Badge>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Time Efficiency</TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Progress value={data.delegationEfficiency * 100} className="w-[60%]" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(data.delegationEfficiency * 100)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {data.delegationEfficiency >= 0.8 ? (
                <Badge>Excellent</Badge>
              ) : data.delegationEfficiency >= 0.6 ? (
                <Badge variant="secondary">Good</Badge>
              ) : (
                <Badge variant="destructive">Needs Improvement</Badge>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">AI Integration Score</TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Progress value={(data.feedbackScore / 100) * 100} className="w-[60%]" />
                <span className="text-sm text-muted-foreground">
                  {data.feedbackScore}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              {data.feedbackScore >= 80 ? (
                <Badge>Excellent</Badge>
              ) : data.feedbackScore >= 60 ? (
                <Badge variant="secondary">Good</Badge>
              ) : (
                <Badge variant="destructive">Needs Improvement</Badge>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
