
import { Bold, Italic, Code, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessageFormat } from "@/types/communication"

interface FormatControlsProps {
  messageFormat: MessageFormat;
  onToggleFormat: (type: keyof MessageFormat) => void;
}

export function FormatControls({ messageFormat, onToggleFormat }: FormatControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onToggleFormat('bold')}
        className={messageFormat.bold ? 'bg-primary text-primary-foreground' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onToggleFormat('italic')}
        className={messageFormat.italic ? 'bg-primary text-primary-foreground' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onToggleFormat('code')}
        className={messageFormat.code ? 'bg-primary text-primary-foreground' : ''}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onToggleFormat('quote')}
        className={messageFormat.quote ? 'bg-primary text-primary-foreground' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
    </div>
  );
}
