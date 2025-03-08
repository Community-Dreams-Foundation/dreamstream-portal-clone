
import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchProfile, updateProfile } from "@/services/messageService"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { MessageSquare } from "lucide-react"

export function CommunityMemberProfile() {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.uid],
    queryFn: () => currentUser ? fetchProfile(currentUser.uid) : null,
    enabled: !!currentUser
  })

  const handleProfileUpdate = async () => {
    if (!currentUser) return

    try {
      await updateProfile(currentUser.uid, {
        // Update profile implementation would go here
      })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile."
      })
    }
  }

  if (!profile) return null

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold">
            {profile.name[0]}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
          </div>
        </div>
        <Button onClick={handleProfileUpdate}>
          Edit Profile
        </Button>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Expertise */}
      {profile.expertise && profile.expertise.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {profile.expertise.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">About</h4>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      {/* Activity Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
        </div>
        <div>Last active {new Date(profile.lastActive).toLocaleDateString()}</div>
      </div>
    </Card>
  )
}
