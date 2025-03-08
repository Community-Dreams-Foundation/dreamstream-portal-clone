
import { Shield, Zap, Check } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function AboutSection() {
  return (
    <>
      <div className="my-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose DreamStream?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground">Your data is protected with industry-leading security measures.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">Optimize your productivity with our high-performance platform.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-muted/50">
            <Check className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
            <p className="text-muted-foreground">Our platform ensures the highest standards in project delivery.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start py-12 my-16">
        <div className="space-y-8">
          <Card className="p-8 gradient-border">
            <h2 className="text-2xl font-bold mb-6">Why Join DreamStream?</h2>
            <div className="space-y-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  Accelerate innovation by transforming ideas into actionable tasks—enabling rapid, 
                  high-quality project execution.
                </p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Fellowship Benefits</h3>
                <p className="text-muted-foreground">
                  Enjoy exclusive perks such as personalized coaching, competitive incentives, 
                  fee waivers, and access to cutting-edge technology that boosts your productivity 
                  and leadership potential.
                </p>
              </div>
              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold mb-2">Program Structure</h3>
                <p className="text-muted-foreground">
                  A clear, data-driven pathway that starts with a simple onboarding process 
                  (offer letter and agreement) and evolves into an advanced leadership development 
                  program, guiding you from individual excellence to strategic executive leadership.
                </p>
              </div>
            </div>
          </Card>
        </div>
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=600&q=80" 
            alt="Productivity" 
            className="rounded-lg shadow-xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-lg shadow-lg border">
            <p className="font-medium text-primary">Join 5,000+ professionals</p>
            <p className="text-sm text-muted-foreground">Accelerating their careers with DreamStream</p>
          </div>
        </div>
      </div>
    </>
  )
}
