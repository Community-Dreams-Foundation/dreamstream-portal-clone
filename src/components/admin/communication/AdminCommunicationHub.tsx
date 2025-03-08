
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Bell, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function AdminCommunicationHub() {
  const { data: communicationData, isLoading } = useQuery({
    queryKey: ["admin-communication"],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return {
        unreadMessages: 5,
        activeChannels: [
          { id: "1", name: "Strategy", unread: 2 },
          { id: "2", name: "Technical", unread: 1 },
          { id: "3", name: "Support", unread: 2 },
        ],
        recentAnnouncements: [
          {
            id: "1",
            title: "New Feature Release",
            content: "Launching improved task management system next week",
            timestamp: "2024-02-28T10:00:00",
          },
        ],
      }
    },
  })

  if (isLoading) return <div>Loading communication data...</div>

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Communication Hub</CardTitle>
            <CardDescription>
              Manage internal communications and announcements
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              <span>
                Notifications{" "}
                {communicationData?.unreadMessages > 0 && (
                  <span className="ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                    {communicationData.unreadMessages}
                  </span>
                )}
              </span>
            </Button>
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages and announcements..."
          className="flex-1"
        />
      </div>

      <Tabs defaultValue="channels" className="w-full">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4">
          <div className="space-y-4">
            {communicationData?.activeChannels.map((channel) => (
              <Card key={channel.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{channel.name}</span>
                    {channel.unread > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    View Channel
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="space-y-4">
            {communicationData?.recentAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{announcement.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {announcement.content}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(announcement.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
