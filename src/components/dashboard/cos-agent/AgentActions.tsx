
import { Mic, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MultiModalInput } from "./MultiModalInput"

interface AgentActionsProps {
  isRecording: boolean;
  toggleVoiceRecording: () => void;
  showMultiModal: boolean;
  setShowMultiModal: (show: boolean) => void;
}

export function AgentActions({
  isRecording, 
  toggleVoiceRecording,
  showMultiModal,
  setShowMultiModal
}: AgentActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className={isRecording ? "animate-pulse bg-red-100" : ""}
        onClick={toggleVoiceRecording}
      >
        <Mic className={`h-4 w-4 ${isRecording ? "text-red-500" : ""} mr-2`} />
        {isRecording ? "Listening..." : "Voice Input"}
      </Button>
      <Popover open={showMultiModal} onOpenChange={setShowMultiModal}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <FileImage className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <MultiModalInput onClose={() => setShowMultiModal(false)} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
