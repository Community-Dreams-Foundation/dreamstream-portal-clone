
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Activity } from "@/types/task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  Clock, 
  ArrowRightCircle, 
  MessageSquare, 
  Tag, 
  AlertCircle,
  CheckCircle,
  Split,
  Layers
} from "lucide-react";

interface TaskHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: Activity[];
  taskTitle: string;
}

export const TaskHistoryDialog: React.FC<TaskHistoryDialogProps> = ({
  open,
  onOpenChange,
  activities,
  taskTitle,
}) => {
  // Helper to get icon based on activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "status_change":
        return <ArrowRightCircle className="h-4 w-4 text-blue-500" />;
      case "timer_update":
        return <Clock className="h-4 w-4 text-green-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "tag_update":
        return <Tag className="h-4 w-4 text-yellow-500" />;
      case "priority_change":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "completion":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "split":
        return <Split className="h-4 w-4 text-indigo-500" />;
      case "dependency_update":
        return <Layers className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Sort activities by timestamp in descending order (newest first)
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Task History</DialogTitle>
          <DialogDescription>
            Activity history for "{taskTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 py-2">
            {sortedActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity history available for this task
              </p>
            ) : (
              <div className="relative pl-6 border-l-2 border-muted">
                {sortedActivities.map((activity, index) => (
                  <div key={index} className="mb-6 relative">
                    <div className="absolute -left-[17px] bg-background p-1 rounded-full border border-muted">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="flex items-center text-sm font-medium mb-1">
                        <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
