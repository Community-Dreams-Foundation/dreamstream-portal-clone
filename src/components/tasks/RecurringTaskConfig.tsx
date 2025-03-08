
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RecurringTaskConfig as RecurringTaskConfigType, TaskRecurrencePattern } from "@/types/task";
import { addDays, format, addWeeks, addMonths } from "date-fns";
import { Calendar as CalendarIcon, CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface RecurringTaskConfigProps {
  config: RecurringTaskConfigType;
  onChange: (config: RecurringTaskConfigType) => void;
}

export const RecurringTaskConfig: React.FC<RecurringTaskConfigProps> = ({
  config,
  onChange,
}) => {
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  // Function to calculate and show the next occurrence date
  const getNextOccurrenceText = () => {
    if (!config.isRecurring) return "None";

    const now = new Date();
    let nextDate = new Date();

    switch (config.pattern) {
      case "daily":
        nextDate = addDays(now, config.interval);
        break;
      case "weekly":
        nextDate = addWeeks(now, config.interval);
        break;
      case "biweekly":
        nextDate = addWeeks(now, 2 * config.interval);
        break;
      case "monthly":
        nextDate = addMonths(now, config.interval);
        break;
      default:
        break;
    }

    return format(nextDate, "PPP");
  };

  // Update next occurrence whenever the recurrence pattern changes
  useEffect(() => {
    if (config.isRecurring) {
      const now = new Date();
      let nextOccurrence: Date;

      switch (config.pattern) {
        case "daily":
          nextOccurrence = addDays(now, config.interval);
          break;
        case "weekly":
          nextOccurrence = addWeeks(now, config.interval);
          break;
        case "biweekly":
          nextOccurrence = addWeeks(now, 2 * config.interval);
          break;
        case "monthly":
          nextOccurrence = addMonths(now, config.interval);
          break;
        default:
          nextOccurrence = addDays(now, config.interval);
      }

      onChange({
        ...config,
        nextOccurrence: nextOccurrence.getTime(),
      });
    }
  }, [config.isRecurring, config.pattern, config.interval]);

  // Toggle recurring status
  const handleRecurringToggle = (checked: boolean) => {
    onChange({
      ...config,
      isRecurring: checked,
    });
  };

  // Change recurrence pattern
  const handlePatternChange = (value: string) => {
    onChange({
      ...config,
      pattern: value as TaskRecurrencePattern,
    });
  };

  // Change interval
  const handleIntervalChange = (value: number) => {
    onChange({
      ...config,
      interval: value,
    });
  };

  // Toggle specific days of the week
  const toggleDayOfWeek = (day: number) => {
    const daysOfWeek = config.daysOfWeek || [];
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter((d) => d !== day)
      : [...daysOfWeek, day];
    
    onChange({
      ...config,
      daysOfWeek: newDays.sort(),
    });
  };

  // Set end after occurrences
  const handleEndAfterOccurrences = (value: number) => {
    onChange({
      ...config,
      endAfterOccurrences: value,
      endDate: undefined,
    });
  };

  // Set end date
  const handleEndDate = (date: Date | undefined) => {
    onChange({
      ...config,
      endDate: date ? date.getTime() : undefined,
      endAfterOccurrences: undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="recurring-toggle" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Make this a recurring task
        </Label>
        <Switch
          id="recurring-toggle"
          checked={config.isRecurring}
          onCheckedChange={handleRecurringToggle}
        />
      </div>

      {config.isRecurring && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurrence-pattern">Repeat</Label>
              <Select
                value={config.pattern}
                onValueChange={handlePatternChange}
              >
                <SelectTrigger id="recurrence-pattern">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence-interval">Every</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="recurrence-interval"
                  type="number"
                  min={1}
                  max={99}
                  value={config.interval}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  {config.pattern === "daily"
                    ? config.interval > 1
                      ? "days"
                      : "day"
                    : config.pattern === "weekly"
                    ? config.interval > 1
                      ? "weeks"
                      : "week"
                    : config.pattern === "biweekly"
                    ? config.interval > 1
                      ? "bi-weeks"
                      : "bi-week"
                    : config.interval > 1
                    ? "months"
                    : "month"}
                </span>
              </div>
            </div>
          </div>

          {(config.pattern === "weekly" || config.pattern === "biweekly") && (
            <div className="space-y-2">
              <Label>On these days</Label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-10 h-10 rounded-full p-0", 
                        config.daysOfWeek?.includes(index) && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleDayOfWeek(index)}
                    >
                      {day.charAt(0)}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Ends</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="never-ends" 
                  checked={!config.endAfterOccurrences && !config.endDate}
                  onCheckedChange={() => onChange({
                    ...config,
                    endAfterOccurrences: undefined,
                    endDate: undefined
                  })}
                />
                <Label htmlFor="never-ends">Never</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="end-after" 
                  checked={!!config.endAfterOccurrences}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange({
                        ...config,
                        endAfterOccurrences: 10,
                        endDate: undefined
                      });
                    } else {
                      onChange({
                        ...config,
                        endAfterOccurrences: undefined
                      });
                    }
                  }}
                />
                <Label htmlFor="end-after" className="flex items-center gap-2">
                  After
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    disabled={!config.endAfterOccurrences}
                    value={config.endAfterOccurrences || 10}
                    onChange={(e) => handleEndAfterOccurrences(parseInt(e.target.value) || 1)}
                    className="w-20 inline-block"
                  />
                  occurrences
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="end-on-date" 
                  checked={!!config.endDate}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const date = addMonths(new Date(), 3);
                      onChange({
                        ...config,
                        endDate: date.getTime(),
                        endAfterOccurrences: undefined
                      });
                    } else {
                      onChange({
                        ...config,
                        endDate: undefined
                      });
                    }
                  }}
                />
                <Label htmlFor="end-on-date" className="flex items-center gap-2">
                  On date
                  <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!config.endDate}
                        className={cn(
                          "w-[150px] justify-start text-left font-normal",
                          !config.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.endDate ? (
                          format(new Date(config.endDate), "PPP")
                        ) : (
                          "Pick a date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={config.endDate ? new Date(config.endDate) : undefined}
                        onSelect={(date) => {
                          handleEndDate(date);
                          setIsEndDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md flex items-start gap-3">
            <CheckSquare className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Task will recur:</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Every {config.interval}{" "}
                {config.pattern === "daily"
                  ? config.interval > 1
                    ? "days"
                    : "day"
                  : config.pattern === "weekly"
                  ? config.interval > 1
                    ? "weeks"
                    : "week"
                  : config.pattern === "biweekly"
                  ? config.interval > 1
                    ? "bi-weeks"
                    : "bi-week"
                  : config.interval > 1
                  ? "months"
                  : "month"}
                {config.daysOfWeek && config.daysOfWeek.length > 0
                  ? ` on ${config.daysOfWeek
                      .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
                      .join(", ")}`
                  : ""}
                {config.endAfterOccurrences
                  ? `, ending after ${config.endAfterOccurrences} occurrences`
                  : config.endDate
                  ? `, ending on ${format(new Date(config.endDate), "PPP")}`
                  : ", with no end date"}
              </p>
              <p className="text-sm font-medium mt-2">
                Next occurrence: {getNextOccurrenceText()}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-700 dark:text-amber-300">About recurring tasks</h4>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                When a recurring task is completed, a new task will automatically be created based on the recurrence pattern. 
                The CoS system will assist in tracking and managing recurring tasks to ensure they're completed on time.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
