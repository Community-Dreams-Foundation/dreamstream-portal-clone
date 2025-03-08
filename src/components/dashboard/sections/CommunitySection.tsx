
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NetworkConnections } from "@/components/dashboard/community/NetworkConnections"
import { CommunityMemberProfile } from "@/components/dashboard/community/CommunityMemberProfile"
import { Users } from "lucide-react"

export function CommunitySection() {
  return (
    <Card className="col-span-full lg:col-span-1 border-none shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Community
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with your dream team and leadership network
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <NetworkConnections />
        <CommunityMemberProfile />
      </CardContent>
    </Card>
  );
}
