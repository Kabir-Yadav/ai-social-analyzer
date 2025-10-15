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
    <div className="grid md:grid-cols-3 gap-4">
      {drafts.map((d, idx) => (
        <Card key={idx}>
          <CardContent className="p-4 space-y-3">
            <div className="text-sm">{d.current}</div>
            <Button size="sm" className="w-full" onClick={() => copy(d.current)}>
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
