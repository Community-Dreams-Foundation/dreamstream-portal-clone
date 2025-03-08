
import React, { useState } from "react";
import { Search, Filter, Calendar, Tag, Clock, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TaskPriority } from "@/types/task";
import { format } from "date-fns";

export interface TaskFiltersState {
  searchQuery: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  priorities: TaskPriority[];
  tags: string[];
}

interface TaskFiltersProps {
  availableTags: string[];
  filters: TaskFiltersState;
  onFiltersChange: (filters: TaskFiltersState) => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  availableTags,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const updateSearchQuery = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const updateDateRange = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const togglePriority = (priority: TaskPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const hasActiveFilters = 
    filters.searchQuery || 
    filters.dateRange.from || 
    filters.dateRange.to || 
    filters.priorities.length > 0 || 
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={filters.searchQuery}
            onChange={(e) => updateSearchQuery(e.target.value)}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-6 w-6 p-0"
              onClick={() => updateSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Date range filter */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-sm gap-1 ${filters.dateRange.from ? "bg-primary/10" : ""}`}
            >
              <Calendar className="h-4 w-4" />
              {filters.dateRange.from ? (
                <span>
                  {format(filters.dateRange.from, "MMM d")}
                  {filters.dateRange.to ? ` - ${format(filters.dateRange.to, "MMM d")}` : ""}
                </span>
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={(range) => {
                updateDateRange(range || { from: undefined, to: undefined });
                if (range?.to) setIsCalendarOpen(false);
              }}
              numberOfMonths={2}
            />
            {(filters.dateRange.from || filters.dateRange.to) && (
              <div className="p-3 border-t flex justify-between items-center">
                <span className="text-sm">
                  {filters.dateRange.from
                    ? `${format(filters.dateRange.from, "PPP")}${
                        filters.dateRange.to
                          ? ` - ${format(filters.dateRange.to, "PPP")}`
                          : ""
                      }`
                    : ""}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateDateRange({ from: undefined, to: undefined })}
                >
                  Reset
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Priority filter */}
        <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-sm gap-1 ${filters.priorities.length > 0 ? "bg-primary/10" : ""}`}
            >
              <Clock className="h-4 w-4" />
              Priority
              {filters.priorities.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.priorities.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3" align="start">
            <div className="space-y-2">
              <div className="font-medium">Priority</div>
              <Separator />
              <div className="space-y-2">
                {(["high", "medium", "low"] as TaskPriority[]).map((priority) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`priority-${priority}`} 
                      checked={filters.priorities.includes(priority)}
                      onCheckedChange={() => togglePriority(priority)}
                    />
                    <Label htmlFor={`priority-${priority}`} className="capitalize">
                      {priority}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Tags filter */}
        <Popover open={isTagsOpen} onOpenChange={setIsTagsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-sm gap-1 ${filters.tags.length > 0 ? "bg-primary/10" : ""}`}
            >
              <Tag className="h-4 w-4" />
              Tags
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-3" align="start">
            <div className="space-y-2">
              <div className="font-medium">Tags</div>
              <Separator />
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableTags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No tags available</div>
                ) : (
                  availableTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag}`} 
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      />
                      <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-sm gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              {filters.searchQuery}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => updateSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange.from && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(filters.dateRange.from, "MMM d")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM d")}`}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => updateDateRange({ from: undefined, to: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.priorities.map((priority) => (
            <Badge key={priority} variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => togglePriority(priority)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => toggleTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
