
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ProfileSettings } from "./ProfileSettings"
import NotificationSettings from "../notifications/NotificationSettings"
import { SubscriptionManagement } from "../subscription/SubscriptionManagement"
import { LeadershipSettings } from "./LeadershipSettings" 

export function AccountSettings() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="leadership">Leadership</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="subscription">
        <SubscriptionManagement />
      </TabsContent>
      <TabsContent value="leadership">
        <LeadershipSettings />
      </TabsContent>
      <TabsContent value="security">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
          <p className="text-muted-foreground">
            Security settings coming soon. Here you'll be able to change your password,
            enable two-factor authentication, and manage your login sessions.
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
