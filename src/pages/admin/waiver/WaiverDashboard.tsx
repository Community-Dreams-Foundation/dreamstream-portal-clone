import { WaiverRequestDialog } from "@/components/waiver/WaiverRequestDialog"
import { WaiverList } from "@/components/waiver/WaiverList"

export default function WaiverDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Waiver Management</h1>
        <WaiverRequestDialog />
      </div>
      <WaiverList />
    </div>
  )
}
