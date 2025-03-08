
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TrainingSection } from "@/components/dashboard/sections/TrainingSection"

const mockKnowledgeData = {
  nodes: [
    { 
      id: "1", 
      title: "Project Management",
      type: "skill" as const,
      description: "Project management expertise",
      tags: ["management", "leadership"],
      connections: ["2", "3"],
      strength: 0.8,
      lastUpdated: new Date().getTime(),
      category: "professional",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    },
    { 
      id: "2", 
      title: "Team Leadership",
      type: "skill" as const,
      description: "Team leadership experience",
      tags: ["leadership", "communication"],
      connections: ["1", "3"],
      strength: 0.9,
      lastUpdated: new Date().getTime(),
      category: "professional",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    },
    { 
      id: "3", 
      title: "Recent Project",
      type: "project" as const,
      description: "Latest project completion",
      tags: ["project", "achievement"],
      connections: ["1", "2"],
      strength: 0.7,
      lastUpdated: new Date().getTime(),
      category: "experience",
      lastAccessed: new Date().getTime(),
      createdAt: new Date().getTime()
    }
  ],
  edges: [
    { source: "1", target: "3", type: "created" as const, strength: 2 },
    { source: "2", target: "3", type: "created" as const, strength: 1 }
  ]
};

const mockChallenges = [
  {
    id: "1",
    title: "Sprint Excellence Challenge",
    description: "Complete all sprint tasks before deadline with high quality",
    type: "team" as const,
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    participants: ["user1", "user2"],
    teamSize: 5,
    rewards: {
      tier: "gold" as const,
      points: 1000,
      badges: ["Sprint Champion"]
    },
    objectives: [
      {
        id: "obj1",
        description: "Complete 20 tasks",
        progress: 8,
        target: 20,
        completed: false
      },
      {
        id: "obj2",
        description: "Maintain 90% quality score",
        progress: 85,
        target: 90,
        completed: false
      }
    ],
    status: "active" as const
  }
];

export default function TrainingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Training & Skills</h1>
          <p className="text-muted-foreground">
            Develop your professional skills and knowledge
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <TrainingSection 
            knowledgeData={mockKnowledgeData}
            challenges={mockChallenges}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
