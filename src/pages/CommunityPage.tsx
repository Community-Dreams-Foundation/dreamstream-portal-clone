
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CommunitySection } from "@/components/dashboard/sections/CommunitySection"

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Connect with your professional network
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <CommunitySection />
        </div>
      </div>
    </DashboardLayout>
  );
}
