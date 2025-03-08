
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadershipProfile, LeadershipDomain, LeadershipTier } from "@/types/leadership";
import { LeadershipProfileData } from "@/types/api";  
import { LeadershipApi } from "@/api/gateway";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type LeadershipFormValues = {
  mentorshipPreferences: {
    availableAsMentor: boolean;
    seekingMentor: boolean;
    preferredMentorshipAreas: string[];
  };
  displaySettings: {
    showAchievements: boolean;
    showMetrics: boolean;
  };
  specializations: LeadershipDomain[];
};

const domainOptions: { value: LeadershipDomain; label: string }[] = [
  { value: "strategy", label: "Strategy" },
  { value: "product-design", label: "Product Design" },
  { value: "data-engineering", label: "Data Engineering" },
  { value: "software-development", label: "Software Development" },
  { value: "engagement", label: "Engagement" },
];

export function LeadershipSettings() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<LeadershipProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form with default values
  const form = useForm<LeadershipFormValues>({
    defaultValues: {
      mentorshipPreferences: {
        availableAsMentor: false,
        seekingMentor: false,
        preferredMentorshipAreas: [],
      },
      displaySettings: {
        showAchievements: true,
        showMetrics: true,
      },
      specializations: [],
    },
  });

  useEffect(() => {
    const fetchLeadershipProfile = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setIsLoading(true);
        const profileData = await LeadershipApi.fetchProfile(currentUser.uid);
        
        // Convert API profile data to LeadershipProfile
        const convertedProfile: LeadershipProfile = {
          userId: profileData.userId,
          currentTier: profileData.currentTier as LeadershipTier,
          joinedAt: profileData.joinedAt,
          assessments: profileData.assessments || [],
          trainingCompleted: profileData.trainingCompleted || [],
          teamId: profileData.teamId,
          metrics: {
            overallScore: profileData.metrics.overallScore,
            leaderboardRank: profileData.metrics.leaderboardRank,
            teamSize: profileData.metrics.teamSize,
            projectsManaged: profileData.metrics.projectsManaged,
            avgTeamEfficiency: profileData.metrics.avgTeamEfficiency,
            taskCompletionRate: profileData.metrics.taskCompletionRate,
            teamSatisfactionScore: profileData.metrics.teamSatisfactionScore,
            mentorshipScore: profileData.metrics.mentorshipScore,
            innovationImpact: profileData.metrics.innovationImpact,
            communicationScore: profileData.metrics.communicationScore,
            projectDeliveryRate: profileData.metrics.projectDeliveryRate,
            teamGrowthRate: profileData.metrics.teamGrowthRate,
            teamEfficiency: profileData.metrics.teamEfficiency,
          },
          skills: profileData.skills || [],
          teams: profileData.teams || [],
          achievements: profileData.achievements || [],
          mentors: profileData.mentors || [],
          mentees: profileData.mentees || [],
          specializations: profileData.specializations || [],
          mentorshipPreferences: profileData.mentorshipPreferences || {
            availableAsMentor: false,
            seekingMentor: false,
            preferredMentorshipAreas: [],
          },
          displaySettings: profileData.displaySettings || {
            showAchievements: true,
            showMetrics: true,
          },
          promotionHistory: profileData.promotionHistory || [],
        };
        
        setProfile(convertedProfile);
        
        // Populate form with existing data if available
        if (convertedProfile) {
          form.reset({
            mentorshipPreferences: {
              availableAsMentor: convertedProfile.mentorshipPreferences?.availableAsMentor || false,
              seekingMentor: convertedProfile.mentorshipPreferences?.seekingMentor || false,
              preferredMentorshipAreas: convertedProfile.mentorshipPreferences?.preferredMentorshipAreas || [],
            },
            displaySettings: {
              showAchievements: convertedProfile.displaySettings?.showAchievements || true,
              showMetrics: convertedProfile.displaySettings?.showMetrics || true,
            },
            specializations: convertedProfile.specializations || [],
          });
        }
      } catch (error) {
        console.error("Error fetching leadership profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadershipProfile();
  }, [currentUser, form]);

  const onSubmit = async (data: LeadershipFormValues) => {
    if (!currentUser?.uid || !profile) return;
    
    try {
      // Create a valid LeadershipProfileData object
      const profileToUpdate: LeadershipProfileData = {
        userId: currentUser.uid,
        currentTier: profile.currentTier,
        joinedAt: profile.joinedAt,
        assessments: profile.assessments,
        trainingCompleted: profile.trainingCompleted,
        teamId: profile.teamId,
        metrics: {
          teamSize: profile.metrics.teamSize,
          projectsManaged: profile.metrics.projectsManaged,
          avgTeamEfficiency: profile.metrics.avgTeamEfficiency,
          taskCompletionRate: profile.metrics.taskCompletionRate,
          teamSatisfactionScore: profile.metrics.teamSatisfactionScore,
          overallScore: profile.metrics.overallScore,
          leaderboardRank: profile.metrics.leaderboardRank,
          mentorshipScore: profile.metrics.mentorshipScore,
          innovationImpact: profile.metrics.innovationImpact,
          communicationScore: profile.metrics.communicationScore,
          projectDeliveryRate: profile.metrics.projectDeliveryRate,
          teamGrowthRate: profile.metrics.teamGrowthRate,
          teamEfficiency: profile.metrics.teamEfficiency,
        },
        skills: profile.skills,
        teams: profile.teams,
        achievements: profile.achievements,
        mentors: profile.mentors || [],
        mentees: profile.mentees || [],
        specializations: data.specializations,
        mentorshipPreferences: data.mentorshipPreferences,
        displaySettings: data.displaySettings,
        promotionHistory: profile.promotionHistory,
      };
      
      await LeadershipApi.updateProfile(profileToUpdate);
      
      // Update local state
      setProfile({
        ...profile,
        mentorshipPreferences: data.mentorshipPreferences,
        displaySettings: data.displaySettings,
        specializations: data.specializations,
      });
      
      toast.success("Leadership settings saved successfully");
    } catch (error) {
      console.error("Error saving leadership settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">Leadership Settings</h3>
          <p className="text-muted-foreground">
            Configure your leadership preferences and visibility settings
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <p>Loading leadership settings...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="mentorship" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                  <TabsTrigger value="specializations">Specializations</TabsTrigger>
                  <TabsTrigger value="visibility">Visibility</TabsTrigger>
                </TabsList>
                
                <TabsContent value="mentorship" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.availableAsMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available as Mentor</FormLabel>
                            <FormDescription>
                              Make yourself available to mentor other team members
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.seekingMentor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Seeking Mentor</FormLabel>
                            <FormDescription>
                              Indicate that you're looking for a mentor
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mentorshipPreferences.preferredMentorshipAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Mentorship Areas</FormLabel>
                          <FormDescription>
                            Select the areas where you'd like to mentor others or receive mentorship
                          </FormDescription>
                          <div className="mt-2">
                            {domainOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="mentorshipPreferences.preferredMentorshipAreas"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, option.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="specializations" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="specializations"
                    render={() => (
                      <FormItem>
                        <FormLabel>Leadership Specializations</FormLabel>
                        <FormDescription>
                          Select your leadership domains of expertise
                        </FormDescription>
                        <div className="mt-2">
                          {domainOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="specializations"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.value
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="visibility" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="displaySettings.showAchievements"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show Achievements</FormLabel>
                          <FormDescription>
                            Display your leadership achievements on your profile
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="displaySettings.showMetrics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show Metrics</FormLabel>
                          <FormDescription>
                            Make your leadership metrics visible to team members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <Button type="submit" className="mt-6">
                Save Settings
              </Button>
            </form>
          </Form>
        )}
      </div>
    </Card>
  );
}
