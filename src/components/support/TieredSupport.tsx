
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Headphones, MessageSquare, Users, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ChatbotInterface } from "./ChatbotInterface"
import { LiveAgentSupport } from "./LiveAgentSupport"
import { MeetingScheduler } from "./MeetingScheduler"

interface SupportTier {
  level: 1 | 2 | 3;
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

export function TieredSupport() {
  const { toast } = useToast()
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  const supportTiers: SupportTier[] = [
    {
      level: 1,
      title: "CoS Agent Support",
      description: "Get instant help from your personal Chief of Staff AI Agent",
      icon: <MessageSquare className="h-5 w-5" />,
      available: true,
    },
    {
      level: 2,
      title: "Live Agent Support",
      description: "Connect with a live support agent for complex issues",
      icon: <Headphones className="h-5 w-5" />,
      available: true,
    },
    {
      level: 3,
      title: "Fellowship Counselor",
      description: "Schedule a one-on-one meeting with a Fellowship counselor",
      icon: <Users className="h-5 w-5" />,
      available: true,
    },
  ]

  const handleTierSelect = (level: number) => {
    setSelectedTier(level)
    
    // For now, just show a toast notification
    toast({
      title: `Support tier ${level} selected`,
      description: "This feature is being implemented",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Support System</h2>
        <Badge variant="secondary">Multi-tier Support</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {supportTiers.map((tier) => (
          <Card key={tier.level} className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="text-primary">{tier.icon}</div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant={tier.level === 1 ? "default" : "outline"}
                    className="w-full"
                    disabled={!tier.available}
                  >
                    Access Support
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{tier.title}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    {tier.level === 1 && <ChatbotInterface />}
                    {tier.level === 2 && <LiveAgentSupport />}
                    {tier.level === 3 && <MeetingScheduler />}
                  </div>
                </DialogContent>
              </Dialog>

              <Badge 
                variant={tier.available ? "outline" : "secondary"}
                className="w-fit"
              >
                {tier.available ? "Available" : "Coming Soon"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
