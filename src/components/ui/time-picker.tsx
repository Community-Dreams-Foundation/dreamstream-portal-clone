
"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function TimePickerDemo({
  className,
  label,
  value,
  onChange,
}: {
  className?: string
  label?: string
  value?: string
  onChange?: (time: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState<string>(value || "12:00")

  const hours = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i)
  }, [])

  const minutes = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i * 5)
  }, [])

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    onChange?.(newTime)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="p-3">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1 space-y-1">
                  <Label>Hours</Label>
                  <div className="grid grid-cols-6 gap-1 h-[180px] overflow-y-auto">
                    {hours.map((hour) => (
                      <div key={hour} className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const [_, minute] = time.split(":")
                            handleTimeChange(`${hour.toString().padStart(2, "0")}:${minute}`)
                          }}
                          className={cn(
                            "h-8 w-8",
                            time.split(":")[0] === hour.toString().padStart(2, "0") &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          {hour.toString().padStart(2, "0")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 space-y-1">
                  <Label>Minutes</Label>
                  <div className="grid grid-cols-3 gap-1 h-[180px] overflow-y-auto">
                    {minutes.map((minute) => (
                      <div key={minute} className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const [hour, _] = time.split(":")
                            handleTimeChange(`${hour}:${minute.toString().padStart(2, "0")}`)
                          }}
                          className={cn(
                            "h-8 w-8",
                            time.split(":")[1] === minute.toString().padStart(2, "0") &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          {minute.toString().padStart(2, "0")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-24"
                />
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  size="sm"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
