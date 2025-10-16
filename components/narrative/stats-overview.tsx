import { Card, CardContent } from "@/components/ui/card"

interface StatCard {
  label: string
  value: number
  hint: string
}

interface StatsOverviewProps {
  stats: StatCard[]
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="mt-2 text-4xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>
              </div>
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">{i === 0 ? "📊" : i === 1 ? "✓" : "✉️"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
