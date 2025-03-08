
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  isLoading?: boolean;
}

export function SettingsCard({
  title,
  description,
  footer,
  isLoading = false,
  children,
  className,
  ...props
}: SettingsCardProps) {
  return (
    <Card className={cn("shadow-sm bg-card border", className)} {...props}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("relative", isLoading ? "min-h-[100px]" : "")}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}
        <div className={cn(isLoading ? "opacity-50 pointer-events-none" : "")}>
          {children}
        </div>
      </CardContent>
      {footer && <CardFooter className="border-t pt-5">{footer}</CardFooter>}
    </Card>
  );
}
