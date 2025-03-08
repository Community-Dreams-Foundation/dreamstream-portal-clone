
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PerformanceSection } from "@/components/dashboard/sections/PerformanceSection"

const mockRecruitmentData = {
  stages: [
    {
      id: "research",
      name: "Research",
      companies: [
        { 
          id: "1", 
          name: "Tech Corp", 
          status: "researching" as const,
          probability: 0.7,
          lastContact: Date.now(),
          notes: "Initial research phase",
          nextSteps: "Schedule initial call"
        }
      ],
      requirements: ["Resume", "Portfolio"],
      timeline: {
        start: Date.now(),
        target: Date.now() + 7 * 24 * 60 * 60 * 1000
      }
    },
    {
      id: "applied",
      name: "Applied",
      companies: [
        { 
          id: "2", 
          name: "Innovation Inc", 
          status: "applied" as const,
          probability: 0.8,
          lastContact: Date.now(),
          notes: "Application submitted",
          nextSteps: "Follow up next week"
        }
      ],
      requirements: ["Interview", "Technical Test"],
      timeline: {
        start: Date.now(),
        target: Date.now() + 14 * 24 * 60 * 60 * 1000
      }
    }
  ],
  metrics: {
    totalApplications: 5,
    activeProcesses: 2,
    successRate: 0.75,
    averageTimeToOffer: 1209600000
  }
};

const mockVisaStatus = {
  type: "H-1B",
  expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
  remainingDays: 180,
  documents: [
    {
      name: "Work Authorization",
      status: "valid" as const,
      expiryDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
      category: "primary" as const,
      uploadedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      fileUrl: "/documents/work-auth.pdf",
      notes: "Original document issued by USCIS"
    },
    {
      name: "Passport",
      status: "expiring" as const,
      expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      category: "primary" as const,
      uploadedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      fileUrl: "/documents/passport.pdf"
    }
  ],
  nextSteps: [
    {
      id: "step1",
      description: "Submit I-765 form for EAD renewal",
      deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
      completed: false,
      requiredDocuments: ["Passport", "I-94", "Previous EAD"]
    },
    {
      id: "step2",
      description: "Schedule biometrics appointment",
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
      completed: false
    }
  ]
};

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Track your professional performance and growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <PerformanceSection 
            recruitmentData={mockRecruitmentData}
            visaStatus={mockVisaStatus}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
