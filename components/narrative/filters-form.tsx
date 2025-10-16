import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersFormProps {
  keyword: string;
  setKeyword: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  persona: string;
  setPersona: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
}

export function FiltersForm({
  keyword,
  setKeyword,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  persona,
  setPersona,
  tone,
  setTone,
}: FiltersFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn("border-2", isExpanded ? "p-1" : "p-0")}>
      <CardContent
        className={cn(
          "transition-all duration-300 px-2",
          isExpanded ? "py-2" : "py-1"
        )}
      >
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filters
              </span>
              <span className="text-xs text-muted-foreground">
                ({keyword ? keyword : "No keyword"} • {persona} • {tone})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Search Filters</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="size-4" />
              </Button>
            </div>

            {/* Filter inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
              <div className="space-y-1.5 lg:col-span-2">
                <Label htmlFor="kw" className="text-xs font-medium">
                  Keyword/Topic
                </Label>
                <Input
                  id="kw"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter keyword..."
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sd" className="text-xs font-medium">
                  Start Date
                </Label>
                <Input
                  id="sd"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed" className="text-xs font-medium">
                  End Date
                </Label>
                <Input
                  id="ed"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="persona" className="text-xs font-medium">
                  Persona
                </Label>
                <Input
                  id="persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="e.g., CEO"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tone" className="text-xs font-medium">
                  Tone
                </Label>
                <Input
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g., Professional"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
