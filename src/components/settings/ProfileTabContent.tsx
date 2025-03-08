import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Save,
  Camera,
  Building,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  Edit,
  Link as LinkIcon,
  AtSign,
  Calendar,
  BadgeCheck,
  Moon,
  Sun,
  Globe,
  Clock
} from "lucide-react";
import { User } from "firebase/auth";
import { SettingsCard } from "./SettingsCard";
import { SettingsSection } from "./SettingsSection";
import { SettingsForm } from "./SettingsForm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskReminderSettings from "@/components/tasks/reminders/TaskReminderSettings";

interface ProfileData {
  displayName: string;
  bio: string;
  company: string;
  jobTitle: string;
  location: string;
  website: string;
  skills: string[];
  interests: string[];
  profileVisibility: 'public' | 'private';
  language: string;
  timezone: string;
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'default' | 'large' | 'x-large';
}

interface ProfileTabContentProps {
  currentUser: User | null;
  accountCreationDate: string;
  lastSignInDate: string;
  mockGamificationProfile: any;
  isLoading?: boolean;
}

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  language: z.string(),
  timezone: z.string(),
});

const languages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
];

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
];

const calculateProfileCompletion = (profileData: ProfileData): number => {
  let completedFields = 0;
  let totalFields = 0;

  if (profileData.displayName) completedFields++;
  totalFields++;

  if (profileData.bio) completedFields++;
  if (profileData.company) completedFields++;
  if (profileData.jobTitle) completedFields++;
  if (profileData.location) completedFields++;
  if (profileData.website) completedFields++;
  if (profileData.skills.length > 0) completedFields++;
  if (profileData.interests.length > 0) completedFields++;
  if (profileData.language) completedFields++;
  if (profileData.timezone) completedFields++;
  
  totalFields += 9;

  return Math.round((completedFields / totalFields) * 100);
};

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  currentUser,
  accountCreationDate,
  lastSignInDate,
  mockGamificationProfile,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: currentUser?.displayName || '',
    bio: 'Innovator and problem solver passionate about technology and AI solutions.',
    company: 'DreamTech Solutions',
    jobTitle: 'Senior Innovation Engineer',
    location: 'San Francisco, CA',
    website: 'https://example.com/profile',
    skills: ['Artificial Intelligence', 'Project Management', 'Innovation Leadership', 'UX Design'],
    interests: ['Emerging Tech', 'Team Collaboration', 'Sustainable Innovation'],
    profileVisibility: 'public',
    language: 'en-US',
    timezone: 'America/Los_Angeles',
    darkMode: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'default'
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  useEffect(() => {
    setCompletionPercentage(calculateProfileCompletion(profileData));
  }, [profileData]);

  const handleSaveProfile = async (values: any) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setProfileData({
          ...profileData,
          ...values
        });
        setIsEditing(false);
        resolve();
      }, 1000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: "Profile image selected",
      description: "Your new profile image has been selected. Save changes to update.",
      variant: "info"
    });
  };

  const toggleDarkMode = () => {
    setProfileData({
      ...profileData,
      darkMode: !profileData.darkMode
    });
    toast({
      title: `${profileData.darkMode ? 'Light' : 'Dark'} mode activated`,
      description: `Theme has been switched to ${profileData.darkMode ? 'light' : 'dark'} mode.`,
      variant: "success"
    });
  };

  const toggleHighContrast = () => {
    setProfileData({
      ...profileData,
      highContrast: !profileData.highContrast
    });
    toast({
      title: `High contrast ${profileData.highContrast ? 'disabled' : 'enabled'}`,
      description: `High contrast mode has been ${profileData.highContrast ? 'disabled' : 'enabled'}.`,
      variant: "success"
    });
  };

  const toggleReducedMotion = () => {
    setProfileData({
      ...profileData,
      reducedMotion: !profileData.reducedMotion
    });
    toast({
      title: `Reduced motion ${profileData.reducedMotion ? 'disabled' : 'enabled'}`,
      description: `Reduced motion has been ${profileData.reducedMotion ? 'disabled' : 'enabled'}.`,
      variant: "success"
    });
  };

  const changeFontSize = (size: 'default' | 'large' | 'x-large') => {
    setProfileData({
      ...profileData,
      fontSize: size
    });
    toast({
      title: "Font size updated",
      description: `Font size has been changed to ${size}.`,
      variant: "success"
    });
  };

  return (
    <div className="space-y-8">
      <SettingsCard 
        title="Account Information"
        description="Basic information about your account and membership"
        isLoading={isLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SettingsSection title="Contact Information">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm">
                <AtSign className="h-4 w-4 text-primary/70" /> 
                {currentUser?.email}
              </p>
              <p className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4 text-primary/70" />
                Member since {accountCreationDate}
              </p>
              <p className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4 text-primary/70" />
                Last sign in: {lastSignInDate}
              </p>
            </div>
          </SettingsSection>
          
          <SettingsSection title="Membership">
            <div className="space-y-1">
              <p className="text-sm">Current plan:</p>
              <Badge className="bg-green-100 text-green-800">
                Monthly Plan
              </Badge>
            </div>
          </SettingsSection>
          
          <SettingsSection title="Gamification Level">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Level {mockGamificationProfile.level}
                </Badge>
                <span className="text-sm">{mockGamificationProfile.points} points</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current streak: {mockGamificationProfile.currentStreak} days
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {mockGamificationProfile.badges.slice(0, 2).map((badge: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
                {mockGamificationProfile.badges.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{mockGamificationProfile.badges.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Profile Completion"
        description="Complete your profile to get the most out of your experience"
        isLoading={isLoading}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{completionPercentage}% complete</span>
            <span className="text-sm text-muted-foreground">
              {completionPercentage === 100 
                ? "All set! Your profile is complete" 
                : "Complete your profile to unlock all features"}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          {completionPercentage < 100 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-md border">
              <h4 className="text-sm font-medium mb-2">Suggested next steps:</h4>
              <ul className="text-sm space-y-1">
                {!profileData.bio && <li>• Add a professional bio</li>}
                {!profileData.company && <li>• Add your company</li>}
                {!profileData.jobTitle && <li>• Add your job title</li>}
                {!profileData.location && <li>• Add your location</li>}
                {!profileData.website && <li>• Add your website</li>}
                {profileData.skills.length === 0 && <li>• Add your skills</li>}
                {profileData.interests.length === 0 && <li>• Add your interests</li>}
                {!profileData.language && <li>• Set your preferred language</li>}
                {!profileData.timezone && <li>• Set your timezone</li>}
              </ul>
            </div>
          )}
        </div>
      </SettingsCard>
      
      <div className="grid gap-8 md:grid-cols-1">
        <SettingsCard 
          isLoading={isLoading}
          footer={isEditing ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" form="profile-form">
                Save Changes
              </Button>
            </div>
          ) : null}
        >
          <div className="flex justify-end p-4 border-b">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-xs"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Public View</span>
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                className="gap-1 text-xs"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isEditing ? "Cancel" : "Edit Profile"}</span>
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold">
              {showPreview ? "Public Profile Preview" : "Profile Information"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {showPreview 
                ? "This is how others will see your profile"
                : "Update your profile information visible to the community"}
            </p>
          </div>
          
          <div className="px-6 pb-6">
            {showPreview ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    {currentUser?.photoURL ? (
                      <AvatarImage src={currentUser.photoURL} alt={profileData.displayName || 'User'} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {profileData.displayName.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {profileData.displayName || 'DreamStream User'}
                      {currentUser?.emailVerified && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </h2>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> 
                      {profileData.jobTitle} at {profileData.company}
                    </p>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> 
                      {profileData.location}
                    </p>
                    {profileData.website && (
                      <p className="text-primary mt-1 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> 
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {profileData.website.replace(/(https?:\/\/)?(www\.)?/, '')}
                        </a>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {languages.find(lang => lang.value === profileData.language)?.label || profileData.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {timezones.find(tz => tz.value === profileData.timezone)?.label || profileData.timezone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">About</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{profileData.bio}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, i) => (
                        <Badge key={i} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">Badges & Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockGamificationProfile.badges.map((badge: string, i: number) => (
                      <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {isEditing ? (
                  <SettingsForm
                    schema={profileSchema}
                    defaultValues={{
                      displayName: profileData.displayName,
                      bio: profileData.bio,
                      company: profileData.company,
                      jobTitle: profileData.jobTitle,
                      location: profileData.location,
                      website: profileData.website,
                      language: profileData.language,
                      timezone: profileData.timezone,
                    }}
                    onSubmit={handleSaveProfile}
                    id="profile-form"
                  >
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-primary/10">
                          {currentUser?.photoURL ? (
                            <AvatarImage src={currentUser.photoURL} alt={profileData.displayName || 'User'} />
                          ) : (
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                              {profileData.displayName.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="absolute bottom-0 right-0">
                          <label htmlFor="profile-image" className="cursor-pointer">
                            <div className="rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90 transition-colors">
                              <Camera className="h-4 w-4" />
                            </div>
                            <input 
                              id="profile-image" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4 w-full">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input 
                            id="displayName" 
                            name="displayName"
                            defaultValue={profileData.displayName}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input 
                              id="jobTitle" 
                              name="jobTitle"
                              defaultValue={profileData.jobTitle}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="company">Company</Label>
                            <Input 
                              id="company" 
                              name="company"
                              defaultValue={profileData.company}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input 
                              id="location" 
                              name="location"
                              defaultValue={profileData.location}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input 
                              id="website" 
                              name="website"
                              defaultValue={profileData.website}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        name="bio"
                        defaultValue={profileData.bio}
                        className="mt-1 min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        A brief description about yourself, your experience and expertise.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <Label htmlFor="language">Preferred Language</Label>
                        <Select
                          name="language"
                          defaultValue={profileData.language}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select your preferred language for the application interface
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          name="timezone"
                          defaultValue={profileData.timezone}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          This helps us show times and dates in your local timezone
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <Label htmlFor="skills">Skills</Label>
                        <div className="mt-2 border rounded-md p-3 min-h-[100px]">
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                {skill}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => setProfileData({
                                    ...profileData, 
                                    skills: profileData.skills.filter((_, idx) => idx !== i)
                                  })}
                                >
                                  <span className="sr-only">Remove</span>
                                  <span aria-hidden="true">×</span>
                                </Button>
                              </Badge>
                            ))}
                            <Input 
                              placeholder="Add skill + Enter"
                              className="flex-1 min-w-[150px] border-dashed"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = e.currentTarget.value.trim();
                                  if (value && !profileData.skills.includes(value)) {
                                    setProfileData({
                                      ...profileData,
                                      skills: [...profileData.skills, value]
                                    });
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="interests">Interests</Label>
                        <div className="mt-2 border rounded-md p-3 min-h-[100px]">
                          <div className="flex flex-wrap gap-2">
                            {profileData.interests.map((interest, i) => (
                              <Badge key={i} variant="outline" className="flex items-center gap-1">
                                {interest}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => setProfileData({
                                    ...profileData, 
                                    interests: profileData.interests.filter((_, idx) => idx !== i)
                                  })}
                                >
                                  <span className="sr-only">Remove</span>
                                  <span aria-hidden="true">×</span>
                                </Button>
                              </Badge>
                            ))}
                            <Input 
                              placeholder="Add interest + Enter"
                              className="flex-1 min-w-[150px] border-dashed"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = e.currentTarget.value.trim();
                                  if (value && !profileData.interests.includes(value)) {
                                    setProfileData({
                                      ...profileData,
                                      interests: [...profileData.interests, value]
                                    });
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Label className="flex items-center gap-2">
                        <span>Profile Visibility</span>
                        {profileData.profileVisibility === 'public' ? (
                          <Badge variant="outline" className="text-green-600 bg-green-50">Public</Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 bg-gray-50">Private</Badge>
                        )}
                      </Label>
                      <div className="mt-2 flex items-center gap-4">
                        <Button 
                          type="button"
                          size="sm"
                          variant={profileData.profileVisibility === 'public' ? 'default' : 'outline'}
                          className="gap-2"
                          onClick={() => setProfileData({...profileData, profileVisibility: 'public'})}
                        >
                          <Eye className="h-4 w-4" />
                          Public
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          variant={profileData.profileVisibility === 'private' ? 'default' : 'outline'}
                          className="gap-2"
                          onClick={() => setProfileData({...profileData, profileVisibility: 'private'})}
                        >
                          <EyeOff className="h-4 w-4" />
                          Private
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {profileData.profileVisibility === 'public' 
                            ? 'Your profile is visible to all members' 
                            : 'Only you can see your profile'}
                        </p>
                      </div>
                    </div>
                  </SettingsForm>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <Avatar className="h-24 w-24 border-4 border-primary/10">
                        {currentUser?.photoURL ? (
                          <AvatarImage src={currentUser.photoURL} alt={profileData.displayName || 'User'} />
                        ) : (
                          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {profileData.displayName.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {profileData.displayName || 'DreamStream User'}
                          {currentUser?.emailVerified && (
                            <Badge className="ml-2 bg-green-100 text-green-800">
                              <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          )}
                        </h2>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> 
                          {profileData.jobTitle} at {profileData.company}
                        </p>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> 
                          {profileData.location}
                        </p>
                        {profileData.website && (
                          <p className="text-primary mt-1 flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> 
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {profileData.website.replace(/(https?:\/\/)?(www\.)?/, '')}
                            </a>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {languages.find(lang => lang.value === profileData.language)?.label || profileData.language}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {timezones.find(tz => tz.value === profileData.timezone)?.label || profileData.timezone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">About</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{profileData.bio}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-md font-medium mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests.map((interest, i) => (
                            <Badge key={i} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Profile Visibility</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={profileData.profileVisibility === 'public' 
                          ? "text-green-600 bg-green-50" 
                          : "text-gray-600 bg-gray-50"}>
                          {profileData.profileVisibility === 'public' ? 'Public' : 'Private'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {profileData.profileVisibility === 'public' 
                            ? 'Your profile is visible to all members' 
                            : 'Only you can see your profile'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Accessibility & Preferences"
          description="Customize your experience with these accessibility options"
          isLoading={isLoading}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-md font-medium">Display Options</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={profileData.darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast" className="text-base">High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better readability
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={profileData.highContrast}
                    onCheckedChange={toggleHighContrast}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-md font-medium">Motion & Animation</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion" className="text-base">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={profileData.reducedMotion}
                    onCheckedChange={toggleReducedMotion}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-md font-medium">Text Options</h3>
                
                <div className="space-y-2">
                  <Label className="text-base">Font Size</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={profileData.fontSize === 'default' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeFontSize('default')}
                    >
                      Default
                    </Button>
                    <Button
                      variant={profileData.fontSize === 'large' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeFontSize('large')}
                    >
                      Large
                    </Button>
                    <Button
                      variant={profileData.fontSize === 'x-large' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeFontSize('x-large')}
                    >
                      X-Large
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Adjust text size for better readability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default ProfileTabContent;
