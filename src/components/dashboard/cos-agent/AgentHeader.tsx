
import { Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AgentActions } from "./AgentActions"

interface AgentHeaderProps {
  isRecording: boolean;
  toggleVoiceRecording: () => void;
  showMultiModal: boolean;
  setShowMultiModal: (show: boolean) => void;
}

export function AgentHeader({
  isRecording,
  toggleVoiceRecording,
  showMultiModal,
  setShowMultiModal
}: AgentHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">CoS Agent</h3>
      </div>
      <div className="flex items-center space-x-2">
        <AgentActions 
          isRecording={isRecording}
          toggleVoiceRecording={toggleVoiceRecording}
          showMultiModal={showMultiModal}
          setShowMultiModal={setShowMultiModal}
        />
        <Badge variant="secondary" className="animate-pulse">
          Active
        </Badge>
      </div>
    </div>
  );
}
