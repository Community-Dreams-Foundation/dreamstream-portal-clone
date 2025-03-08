
"use client";

import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock, Brain, Target } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleStartTutorial = () => {
    onOpenChange(false);
    navigate("/intake");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="animate-fade-in">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            One Team, One Dream!
          </DialogTitle>
          <DialogDescription className="text-lg mt-4 space-y-4">
            <p>
              Welcome to DreamStream! Join our innovative, AI-driven ecosystem where speed
              and efficiency meet collaborative excellence.
            </p>
            <p>
              Meet your personal Chief of Staff (CoS) Agent - an AI-powered assistant
              that will revolutionize how you manage tasks and lead teams.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div>
              <h3 className="text-xl font-semibold mb-4">Your AI-Powered Advantage:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Lightning Fast</h4>
                    <p className="text-sm text-muted-foreground">Optimize task completion with AI assistance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Time Management</h4>
                    <p className="text-sm text-muted-foreground">Smart scheduling and task prioritization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                  <Brain className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">AI Learning</h4>
                    <p className="text-sm text-muted-foreground">Adapts to your work style and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                  <Target className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">Goal Tracking</h4>
                    <p className="text-sm text-muted-foreground">Real-time progress monitoring and feedback</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                Complete a quick 5-10 minute setup to configure your personalized CoS
                Agent. We'll guide you through each step to ensure your AI assistant
                perfectly matches your needs and work style.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleStartTutorial} 
            className="w-full animate-fade-in hover:scale-105 transition-transform"
            size="lg"
            style={{ animationDelay: "400ms" }}
          >
            Start Quick Setup
            <ArrowRight className="ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
