
import React, { useEffect, useState } from "react";
import { WaiverService } from "@/services/WaiverService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { WaiverTemplateDialog } from "./WaiverTemplateDialog";

interface WaiverTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  created_at: string;
}

export function WaiverList() {
  const [waivers, setWaivers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<WaiverTemplate[]>([]);

  useEffect(() => {
    const unsubscribeWaivers = WaiverService.subscribeToWaivers(setWaivers);
    const unsubscribeTemplates = WaiverService.subscribeToWaiverTemplates(setTemplates);

    return () => {
      unsubscribeWaivers();
      unsubscribeTemplates();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Waivers</h2>
        <WaiverTemplateDialog />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Templates</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.category}
                        </p>
                      </div>
                      <Badge>{formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Waivers</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {waivers.map((waiver) => (
                  <div
                    key={waiver.waiver_id}
                    className="p-4 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{waiver.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {waiver.description}
                        </p>
                      </div>
                      <Badge className={getStatusColor(waiver.status)}>
                        {waiver.status}
                      </Badge>
                    </div>
                    {waiver.review_comments && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Comments: {waiver.review_comments}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(waiver.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
