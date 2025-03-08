
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import type { Agent } from "@/types/task"
import type { CoSPreferences } from "@/types/agent"

const defaultPreferences: CoSPreferences = {
  tone: "casual",
  notificationFrequency: "medium",
  trainingFocus: ["time-management", "leadership", "delegation"],
  workloadThreshold: 40,
  delegationPreference: "balanced",
  communicationStyle: "casual",
  agentInteractionLevel: "medium"
}

export function useCosData() {
  const { currentUser } = useAuth()

  const { data: preferences } = useQuery({
    queryKey: ['cosPreferences', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return defaultPreferences
      const db = getDatabase()
      const prefsRef = ref(db, `users/${currentUser.uid}/cosPreferences`)
      const snapshot = await get(prefsRef)
      return snapshot.exists() ? snapshot.val() : defaultPreferences
    },
    enabled: !!currentUser
  })

  const { data: agents } = useQuery({
    queryKey: ['agents', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return []
      const db = getDatabase()
      const agentsRef = ref(db, `users/${currentUser.uid}/agents`)
      const snapshot = await get(agentsRef)
      return snapshot.exists() ? Object.values(snapshot.val()) : []
    },
    enabled: !!currentUser
  })

  return {
    preferences: preferences || defaultPreferences,
    agents: agents as Agent[] || []
  }
}
