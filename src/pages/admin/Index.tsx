
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/card"
import { AdminMembershipPanel } from "@/components/admin/membership/AdminMembershipPanel"
import { AdminPerformanceOverview } from "@/components/admin/performance/AdminPerformanceOverview"
import { AdminLeadershipPanel } from "@/components/admin/leadership/AdminLeadershipPanel"
import { AdminCommunicationHub } from "@/components/admin/communication/AdminCommunicationHub"

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Membership and Fee Management Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <AdminMembershipPanel />
          </Card>
        </div>

        {/* Performance Overview */}
        <div>
          <Card className="p-6">
            <AdminPerformanceOverview />
          </Card>
        </div>

        {/* Leadership Development Panel */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <AdminLeadershipPanel />
          </Card>
        </div>

        {/* Admin Communication Hub */}
        <div className="col-span-full">
          <Card className="p-6">
            <AdminCommunicationHub />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
