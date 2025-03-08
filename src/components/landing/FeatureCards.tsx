
import { Card } from "@/components/ui/card"
import { Users, Zap, Brain } from "lucide-react"

export default function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 py-12">
      <Card className="p-8 space-y-4 feature-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80" 
            alt="Technology" 
            className="w-full h-full object-cover"
          />
        </div>
        <Users className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold">Community-Driven</h3>
        <p className="text-muted-foreground">
          Join a network of innovators and leaders shaping the future of work.
        </p>
      </Card>
      <Card className="p-8 space-y-4 feature-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80" 
            alt="Productivity" 
            className="w-full h-full object-cover"
          />
        </div>
        <Zap className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold">Energy Development</h3>
        <p className="text-muted-foreground">
          Enhance your capabilities through our dynamic training program and skill development.
        </p>
      </Card>
      <Card className="p-8 space-y-4 feature-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=400&q=80" 
            alt="AI" 
            className="w-full h-full object-cover"
          />
        </div>
        <Brain className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold">AI-Powered Efficiency</h3>
        <p className="text-muted-foreground">
          Leverage cutting-edge AI to optimize your workflow and boost productivity.
        </p>
      </Card>
    </div>
  )
}
