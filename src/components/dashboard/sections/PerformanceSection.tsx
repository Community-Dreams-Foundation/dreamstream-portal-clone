
import { Card } from "@/components/ui/card"
import { CosAgent } from "@/components/dashboard/CosAgent"
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics"
import { RecruitmentFunnel } from "@/components/dashboard/cos-agent/RecruitmentFunnel"
import { VisaStatusTracker } from "@/components/dashboard/immigration/VisaStatusTracker"
import type { RecruitmentFunnel as RecruitmentFunnelType } from "@/types/agent"
import type { VisaStatus } from "@/types/immigration"

interface PerformanceSectionProps {
  recruitmentData: RecruitmentFunnelType;
  visaStatus: VisaStatus;
}

export function PerformanceSection({ recruitmentData, visaStatus }: PerformanceSectionProps) {
  return (
    <div className="space-y-4">
      <CosAgent />
      <Card className="p-6">
        <PerformanceMetrics />
      </Card>
      <Card className="p-6">
        <RecruitmentFunnel data={recruitmentData} />
      </Card>
      <Card className="p-6">
        <VisaStatusTracker 
          status={visaStatus}
          onSetReminder={(deadline) => console.log("Setting reminder for:", deadline)}
        />
      </Card>
    </div>
  );
}

