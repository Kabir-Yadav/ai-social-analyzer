"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function DraftsList({ drafts }: { drafts: { current: string }[] }) {
  const { toast } = useToast()

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copied", description: "Draft copied to clipboard." })
    } catch {
      toast({ title: "Copy failed", description: "Unable to copy.", variant: "destructive" })
    }
  }

  if (!drafts?.length) {
    return <p className="text-sm text-muted-foreground">Drafts will appear here after Step 5.</p>
  }

  return (
    <div className="space-y-3">
      {drafts.map((d, idx) => (
        <Card key={idx} className="border-2 hover:border-primary/50 transition-all">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary">
                {idx + 1}
              </div>
              <div className="flex-1 text-sm leading-relaxed">{d.current}</div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{d.current.length}/280</span>
                <span className={d.current.length > 280 ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                  {d.current.length > 280 ? "⚠️ Too long" : "✓ Ready"}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => copy(d.current)} className="shrink-0">
                📋 Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
