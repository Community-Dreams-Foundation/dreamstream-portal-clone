
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, update } from "firebase/database"
import type { Agent, AgentType } from "@/types/task"

interface CreateAgentDialogProps {
  onAgentCreated: (agent: Agent) => void
}

export function CreateAgentDialog({ onAgentCreated }: CreateAgentDialogProps) {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<AgentType>("general")

  const handleCreateAgent = async () => {
    if (!currentUser) return

    try {
      const db = getDatabase()
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        type: selectedType,
        name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Agent`,
        skills: [],
        currentLoad: 0,
        assignedTasks: [],
        performance: {
          successRate: 100,
          averageTaskTime: 0,
          tasksCompleted: 0
        },
        createdAt: Date.now(),
        lastActive: Date.now(),
        status: "active",
        specializationScore: {}
      }

      await update(ref(db, `users/${currentUser.uid}/agents/${newAgent.id}`), newAgent)
      onAgentCreated(newAgent)
      setShowDialog(false)
      
      toast({
        title: "Agent Created",
        description: `New ${selectedType} agent has been created successfully!`,
      })
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create agent. Please try again.",
      })
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            {["general", "data-analysis", "content-creation", "project-management"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type as AgentType)}
              >
                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
          <Button onClick={handleCreateAgent} className="w-full">
            Create Agent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
