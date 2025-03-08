

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getDatabase, ref, onValue, set } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

interface AgentStatus {
  isOnline: boolean;
  lastActive: string;
  currentQueue: number;
}

export function LiveAgentStatus() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    isOnline: false,
    lastActive: new Date().toISOString(),
    currentQueue: 0,
  });
  const { currentUser } = useAuth()

  useEffect(() => {
    const db = getDatabase()
    const agentStatusRef = ref(db, 'agentStatus')

    const unsubscribe = onValue(agentStatusRef, (snapshot) => {
      if (snapshot.exists()) {
        setAgentStatus(snapshot.val())
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={agentStatus.isOnline ? "success" : "secondary"}>
        {agentStatus.isOnline ? "Agents Available" : "Agents Busy"}
      </Badge>
      {agentStatus.currentQueue > 0 && (
        <span className="text-sm text-muted-foreground">
          Queue: {agentStatus.currentQueue} users
        </span>
      )}
    </div>
  )
}
