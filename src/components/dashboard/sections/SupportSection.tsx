
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TieredSupport } from "@/components/support/TieredSupport"
import { CommunicationFeed } from "@/components/dashboard/CommunicationFeed"
import { LifeBuoy, MessageSquare } from "lucide-react"

export function SupportSection() {
  return (
    <Card className="col-span-full lg:col-span-1 border-none shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <LifeBuoy className="mr-2 h-5 w-5 text-primary" />
          Support
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <TieredSupport />
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <h3 className="font-medium">Recent Communication</h3>
          </div>
          <CommunicationFeed />
        </div>
      </CardContent>
    </Card>
  );
}
