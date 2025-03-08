
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FeeTrackingDashboard } from "@/components/fees/FeeTrackingDashboard";

export default function FeeTracking() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Fee Tracking</h1>
        <FeeTrackingDashboard />
      </div>
    </DashboardLayout>
  );
}
