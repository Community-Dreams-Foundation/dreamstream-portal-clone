
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { SupportSection } from "@/components/dashboard/sections/SupportSection"

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">
            Get help and resources for your journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <SupportSection />
        </div>
      </div>
    </DashboardLayout>
  );
}
