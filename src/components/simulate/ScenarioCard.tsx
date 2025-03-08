
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, PlayCircle, Loader2 } from "lucide-react";

interface ScenarioCardProps {
  title: string;
  description: string;
  onStart: () => void;
  disabled?: boolean;
  isInProgress?: boolean;
  isCompleted?: boolean;
  children?: React.ReactNode;
}

export function ScenarioCard({
  title,
  description,
  onStart,
  disabled = false,
  isInProgress = false,
  isCompleted = false,
  children,
}: ScenarioCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      
      {children ? (
        <CardContent>{children}</CardContent>
      ) : null}
      
      <CardFooter className="pt-2">
        {!isInProgress && !isCompleted && (
          <Button 
            onClick={onStart}
            disabled={disabled}
            className="w-full"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Scenario
          </Button>
        )}
        
        {isInProgress && (
          <div className="w-full flex items-center justify-center text-primary">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Scenario in progress...</span>
          </div>
        )}
        
        {isCompleted && !isInProgress && (
          <Button variant="outline" onClick={onStart} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
