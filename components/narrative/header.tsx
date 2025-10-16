import { ThemeToggle } from "@/components/theme-toggle";
import { StageStepper } from "@/components/pipeline/stage-stepper";
import { FiltersForm } from "./filters-form";

interface HeaderProps {
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
  pipelineSteps: Array<{ id: number; title: string; done: boolean }>;
}

export function Header({
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
  pipelineSteps,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">
                AI
              </span>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight">Darpan</div>
              <div className="text-xs text-muted-foreground">
                AI-Powered Analysis
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">
                All systems operational
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Filters */}
        <div className="pb-4">
          <FiltersForm
            keyword={keyword}
            setKeyword={setKeyword}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            persona={persona}
            setPersona={setPersona}
            tone={tone}
            setTone={setTone}
          />
        </div>

        {/* Stepper */}
        <div className="pb-4">
          <StageStepper steps={pipelineSteps} />
        </div>
      </div>
    </header>
  );
}
