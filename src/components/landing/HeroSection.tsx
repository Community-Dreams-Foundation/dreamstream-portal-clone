
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  handleSwitchToSignup: () => void;
}

export default function HeroSection({ handleSwitchToSignup }: HeroSectionProps) {
  return (
    <div className="py-20 text-center space-y-6 landing-hero my-8 rounded-lg">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" 
          alt="Technology Background" 
          className="w-full h-full object-cover opacity-10 rounded-lg"
        />
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Accelerate Innovation with{" "}
          <span className="text-primary landing-gradient-text">DreamStream</span>
        </h1>
        <p className="max-w-[42rem] mx-auto text-lg sm:text-xl text-muted-foreground">
          Revolutionize project execution and maximize your output with our decentralized,
          AI-driven task management platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 py-6 text-lg rounded-full shadow-lg"
            onClick={handleSwitchToSignup}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
