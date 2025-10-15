import { cn } from "@/lib/utils"

type Step = { id: number; title: string; done?: boolean }

export function StageStepper({ steps }: { steps: Step[] }) {
  const firstPending = steps.findIndex((s) => !s.done)
  const activeIndex = Math.max(0, firstPending === -1 ? steps.length - 1 : firstPending)
  const progressPct =
    steps.length > 1 ? (Math.max(0, activeIndex + (steps[activeIndex]?.done ? 1 : 0)) / (steps.length - 1)) * 100 : 0

  return (
    <div className="relative">
      {/* progress track */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-border" aria-hidden="true" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${progressPct}%` }}
        aria-hidden="true"
      />
      <nav aria-label="Pipeline Progress" className="w-full relative">
        <ol className="flex items-center justify-between gap-2 md:gap-3 px-1">
          {steps.map((s, idx) => {
            const isDone = Boolean(s.done)
            const isActive = idx === activeIndex && !isDone

            return (
              <li key={s.id} className="min-w-0 flex-1 flex items-center justify-center">
                <div
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2 border transition-all duration-300",
                    isDone
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : isActive
                        ? "bg-accent text-foreground border-foreground/10 shadow-xs"
                        : "bg-card text-muted-foreground border-border",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-medium transition-colors",
                      isDone ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    {isDone ? "✓" : s.id}
                  </span>
                  <span className={cn("truncate text-xs md:text-sm font-medium")}>{s.title}</span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
