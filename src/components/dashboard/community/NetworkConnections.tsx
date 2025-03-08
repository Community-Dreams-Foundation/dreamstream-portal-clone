
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { NetworkConnection } from "@/types/communication"
import { createConnection, updateConnectionStatus } from "@/services/messageService"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NetworkConnections() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', currentUser?.uid],
    queryFn: async () => {
      // Fetch connections implementation would go here
      // For now returning mock data
      return [] as NetworkConnection[]
    }
  })

  const handleConnect = async (userId: string) => {
    if (!currentUser) return

    try {
      await createConnection(currentUser.uid, userId)
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send connection request."
      })
    }
  }

  const handleUpdateStatus = async (connectionId: string, status: 'connected' | 'blocked') => {
    if (!currentUser) return

    try {
      await updateConnectionStatus(currentUser.uid, connectionId, status)
      toast({
        title: "Status updated",
        description: "Connection status has been updated successfully."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update connection status."
      })
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Network Connections</h3>
        </div>
        <Badge variant="secondary">
          {connections.length} Connections
        </Badge>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => (
          <div 
            key={connection.connectionId}
            className="flex items-center justify-between p-4 bg-muted rounded-lg"
          >
            <div>
              <p className="font-medium">{connection.userId}</p>
              <p className="text-sm text-muted-foreground">
                Connected since {new Date(connection.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {connection.status === 'pending' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => handleUpdateStatus(connection.connectionId, 'connected')}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(connection.connectionId, 'blocked')}
                  >
                    Decline
                  </Button>
                </>
              )}
              {connection.status === 'connected' && (
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUpdateStatus(connection.connectionId, 'blocked')}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
