
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Settings2, Clock, LogOut, Download, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export const SecurityTabContent: React.FC = () => {
  const { currentUser, setupMFA, completeMFASetup } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [mfaStep, setMfaStep] = useState<"phone" | "verify">("phone");
  const [isLoading, setIsLoading] = useState(false);

  // Mock sessions data
  useEffect(() => {
    // In a real app, you would fetch this from your backend
    setSessions([
      {
        id: "1",
        device: "Windows PC",
        browser: "Chrome 110",
        location: "San Francisco, USA",
        lastActive: "Just now",
        current: true
      },
      {
        id: "2",
        device: "iPhone 13",
        browser: "Safari Mobile",
        location: "New York, USA",
        lastActive: "2 days ago",
        current: false
      },
      {
        id: "3",
        device: "Macbook Pro",
        browser: "Firefox 98",
        location: "Austin, USA",
        lastActive: "5 days ago",
        current: false
      }
    ]);

    // Mock activity logs
    setActivityLogs([
      {
        id: "1",
        action: "Login successful",
        timestamp: "Just now",
        ipAddress: "192.168.1.1",
        device: "Windows PC"
      },
      {
        id: "2",
        action: "Password changed",
        timestamp: "2 days ago",
        ipAddress: "192.168.1.1",
        device: "iPhone 13"
      },
      {
        id: "3",
        action: "Login attempt failed",
        timestamp: "3 days ago",
        ipAddress: "45.23.11.5",
        device: "Unknown"
      },
      {
        id: "4",
        action: "Profile updated",
        timestamp: "5 days ago",
        ipAddress: "192.168.1.1",
        device: "Macbook Pro"
      }
    ]);
  }, []);

  const handleInitiateMFA = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid phone number"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
      const id = await setupMFA(formattedPhoneNumber);
      setVerificationId(id);
      setMfaStep("verify");
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "MFA setup failed",
        description: error.message || "Failed to send verification code"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid verification code",
        description: "Please enter the 6-digit verification code"
      });
      return;
    }

    setIsLoading(true);
    try {
      await completeMFASetup(verificationId, verificationCode);
      setShowMfaDialog(false);
      setMfaStep("phone");
      setPhoneNumber("");
      setVerificationCode("");
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Failed to verify code"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({
      title: "Session ended",
      description: "The session has been terminated successfully"
    });
  };

  const handleLogoutAllSessions = () => {
    const currentSession = sessions.find(s => s.current);
    setSessions(currentSession ? [currentSession] : []);
    toast({
      title: "All sessions ended",
      description: "All other sessions have been terminated"
    });
  };

  const handleExportData = () => {
    // In a real app, you would generate this data from your backend
    const userData = {
      profile: {
        name: currentUser?.displayName || "User",
        email: currentUser?.email || "user@example.com",
        photoURL: currentUser?.photoURL || "",
        created: currentUser?.metadata.creationTime || new Date().toISOString()
      },
      activityLog: activityLogs,
      preferences: {
        theme: "system",
        notifications: true
      }
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileName = `account_data_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
    
    toast({
      title: "Data exported",
      description: "Your account data has been exported successfully"
    });
  };

  // Element for recaptcha verification
  useEffect(() => {
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      const div = document.createElement("div");
      div.id = "recaptcha-container";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    return () => {
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.remove();
      }
    };
  }, []);

  return (
    <Card className="border shadow-md bg-card">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl font-bold text-primary">Account Security & Preferences</CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Manage your account security, authentication methods, and privacy preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-6">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="data">Data & Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 p-5 rounded-lg bg-card border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Settings2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set a strong password using a unique combination of letters, numbers, and symbols
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-2">Change Password</Button>
              </div>
              
              <div className="space-y-4 p-5 rounded-lg bg-card border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add an extra layer of security to protect your account from unauthorized access
                    </p>
                  </div>
                </div>
                <Dialog open={showMfaDialog} onOpenChange={setShowMfaDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-2">Enable 2FA</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                      <DialogDescription>
                        {mfaStep === "phone" 
                          ? "Enter your phone number to receive verification codes" 
                          : "Enter the 6-digit code sent to your phone"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {mfaStep === "phone" ? (
                      <>
                        <div className="space-y-4 py-4">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            placeholder="+1 (555) 123-4567" 
                            value={phoneNumber} 
                            onChange={e => setPhoneNumber(e.target.value)} 
                          />
                          <Alert>
                            <AlertDescription>
                              Make sure to use a phone number you have access to. You'll need this for login verification.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleInitiateMFA} 
                            disabled={isLoading}
                          >
                            {isLoading ? "Sending..." : "Send Verification Code"}
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4 py-4">
                          <Label htmlFor="code">Verification Code</Label>
                          <Input 
                            id="code" 
                            placeholder="123456" 
                            value={verificationCode} 
                            onChange={e => setVerificationCode(e.target.value)} 
                          />
                          <Alert>
                            <AlertDescription>
                              Enter the 6-digit code we just sent to your phone.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setMfaStep("phone")} 
                            disabled={isLoading}
                          >
                            Back
                          </Button>
                          <Button 
                            onClick={handleVerifyMFA} 
                            disabled={isLoading}
                          >
                            {isLoading ? "Verifying..." : "Verify Code"}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                    
                    <div id="recaptcha-container"></div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-600">Account Deletion</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <div className="mt-4">
                    <Button variant="destructive" className="gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogoutAllSessions}
                className="gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout All Other Devices
              </Button>
            </div>
            
            <div className="space-y-4">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className="p-4 border rounded-lg flex justify-between items-center relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {session.device.includes("Windows") ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                      ) : session.device.includes("iPhone") ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="12" x="3" y="4" rx="2" ry="2"></rect><line x1="2" x2="22" y1="20" y2="20"></line></svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.browser} • {session.location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last active: {session.lastActive}
                      </div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleLogoutSession(session.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">End Session</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Account Activity</h3>
            
            <div className="space-y-3">
              {activityLogs.map(log => (
                <div 
                  key={log.id} 
                  className="p-3 border rounded-lg flex items-start gap-3"
                >
                  <div className={`p-2 rounded-full ${
                    log.action.includes("failed") 
                      ? "bg-red-100" 
                      : log.action.includes("changed") || log.action.includes("updated")
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${
                      log.action.includes("failed") 
                        ? "text-red-500" 
                        : log.action.includes("changed") || log.action.includes("updated")
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.device} • IP: {log.ipAddress}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-4 p-5 rounded-lg bg-card border">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Export Your Data</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Download a copy of your personal data including account details, activity logs, and preferences
                  </p>
                  <Button 
                    onClick={handleExportData}
                    className="mt-4"
                  >
                    Export Data (JSON)
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 p-5 rounded-lg bg-card border">
              <h3 className="text-lg font-medium">Data Usage & Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We're committed to protecting your privacy and being transparent about how your data is used.
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Analytics cookies</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">Marketing preferences</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">Third-party integrations</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
