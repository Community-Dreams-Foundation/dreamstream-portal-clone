
import { CalendarDays, Quote, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { Feedback } from "@/types/performance";

interface FeedbackListProps {
  feedback: Feedback[];
}

export function FeedbackList({ feedback }: FeedbackListProps) {
  if (!feedback.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Recent Feedback</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {feedback.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Quote className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{item.author}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{item.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <time dateTime={new Date(item.givenAt).toISOString()}>
                      {formatDistanceToNow(item.givenAt, { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
