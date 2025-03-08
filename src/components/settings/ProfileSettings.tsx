
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, update } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileSettings() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "")
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return
    
    setIsLoading(true)
    
    try {
      const db = getDatabase()
      const userRef = ref(db, `users/${currentUser.uid}/profile`)
      
      await update(userRef, {
        displayName,
        bio
      })
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Profile Update Failed",
        description: "There was a problem updating your profile. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and how others see you in the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.photoURL || ""} alt={currentUser?.displayName || "User"} />
              <AvatarFallback>
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" type="button">
              Change Avatar
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={currentUser?.email || ""}
              disabled
              readOnly
            />
            <p className="text-sm text-muted-foreground">
              Your email address is used for login and notifications.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about yourself"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
