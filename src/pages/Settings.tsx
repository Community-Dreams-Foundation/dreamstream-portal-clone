
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Shield, 
  Bell, 
  UserCircle, 
  CreditCard,
  Settings2, 
  Save,
  Menu
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RewardTier } from "@/types/gamification"
import { Button } from "@/components/ui/button"
import { ProfileTabContent } from "@/components/settings/ProfileTabContent"
import { BillingTabContent } from "@/components/settings/BillingTabContent"
import { SecurityTabContent } from "@/components/settings/SecurityTabContent"
import { LeadershipTabContent } from "@/components/settings/LeadershipTabContent"
import NotificationSettings from "@/components/notifications/NotificationSettings"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  const accountCreationDate = currentUser?.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
    : 'N/A'
  
  const lastSignInDate = currentUser?.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
    : 'N/A'

  const mockGamificationProfile = {
    userId: currentUser?.uid || "guest-user",
    level: 12,
    points: 8750,
    badges: ["Early Adopter", "Team Player", "Task Master", "Problem Solver"],
    challengesCompleted: 47,
    teamContributions: 23,
    currentStreak: 14,
    longestStreak: 21,
    rewards: [
      {
        tier: "gold" as RewardTier,
        unlockedAt: Date.parse("2023-05-15"),
        benefits: ["Priority Support", "Custom Portfolio Theme", "Premium Analytics"]
      },
      {
        tier: "silver" as RewardTier,
        unlockedAt: Date.parse("2023-03-01"),
        benefits: ["Increased Storage", "Access to Team Challenges"]
      }
    ]
  }

  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
        variant: "success"
      });
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, account preferences and subscription
            </p>
          </div>
          <div className="flex items-center">
            {isEditing ? (
              <Button 
                onClick={handleSaveProfile} 
                className="gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Save className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                Member since {accountCreationDate}
              </div>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative overflow-auto">
            <TabsList className={`w-full justify-start mb-6 md:mb-8 bg-card border ${isMobile ? 'overflow-x-auto pb-3' : ''}`}>
              <TabsTrigger value="profile" className="flex items-center whitespace-nowrap">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>{isMobile ? '' : 'Profile'}</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center whitespace-nowrap">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{isMobile ? '' : 'Billing'}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center whitespace-nowrap">
                <Bell className="mr-2 h-4 w-4" />
                <span>{isMobile ? '' : 'Notifications'}</span>
              </TabsTrigger>
              <TabsTrigger value="leadership" className="flex items-center whitespace-nowrap">
                <Shield className="mr-2 h-4 w-4" />
                <span>{isMobile ? '' : 'Leadership'}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center whitespace-nowrap">
                <Settings2 className="mr-2 h-4 w-4" />
                <span>{isMobile ? '' : 'Account'}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile">
            <ProfileTabContent 
              currentUser={currentUser} 
              accountCreationDate={accountCreationDate}
              lastSignInDate={lastSignInDate}
              mockGamificationProfile={mockGamificationProfile}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingTabContent />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="leadership">
            <LeadershipTabContent />
          </TabsContent>
          
          <TabsContent value="settings">
            <SecurityTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
