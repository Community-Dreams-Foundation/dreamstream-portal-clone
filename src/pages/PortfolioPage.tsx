
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { PortfolioSection } from "@/components/dashboard/sections/PortfolioSection"

const mockPortfolio = {
  userId: "user123",
  metadata: {
    title: "John Doe's Portfolio",
    description: "Software Engineer Portfolio",
    lastUpdated: Date.now(),
    format: "website" as const,
    visibility: "public" as const
  },
  items: [],
  metrics: {
    tasksCompleted: 150,
    efficiency: 0.85,
    timesSaved: 120,
    impactScore: 92
  },
  preferences: {
    template: "default" as const,
    primaryColor: "#3b82f6",
    showMetrics: true,
    selectedItems: []
  },
  summary: {
    totalProjects: 15,
    avgEfficiency: 0.85,
    topSkills: ["React", "TypeScript", "Node.js"],
    overallImpact: {
      tasksCompleted: 150,
      efficiencyImprovement: 0.25,
      timesSaved: 120
    }
  }
};

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Showcase your work and achievements
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <PortfolioSection portfolio={mockPortfolio} />
        </div>
      </div>
    </DashboardLayout>
  );
}
