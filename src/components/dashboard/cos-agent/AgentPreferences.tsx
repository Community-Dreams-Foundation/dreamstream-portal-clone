
import { Badge } from "@/components/ui/badge"
import { CoSPreferences } from "@/types/agent"

interface AgentPreferencesProps {
  preferences: CoSPreferences;
}

export function AgentPreferences({ preferences }: AgentPreferencesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge variant="outline">
        {preferences.tone === "formal" ? "Formal Tone" : "Casual Tone"}
      </Badge>
      <Badge variant="outline">
        {preferences.notificationFrequency} notifications
      </Badge>
      <Badge variant="outline">
        {preferences.delegationPreference} delegation
      </Badge>
      <Badge variant="outline">
        {preferences.agentInteractionLevel} interaction
      </Badge>
    </div>
  )
}
