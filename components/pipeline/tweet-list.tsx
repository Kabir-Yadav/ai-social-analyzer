"use client"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Tweet } from "@/lib/types"

export function TweetList(props: {
  tweets: Tweet[]
  selectedIds: Array<number | string>
  onChangeSelected: (ids: Array<number | string>) => void
}) {
  const { tweets, selectedIds, onChangeSelected } = props

  function toggle(id: number | string, checked: boolean) {
    if (checked) {
      onChangeSelected([...selectedIds, id])
    } else {
      onChangeSelected(selectedIds.filter((x) => x !== id))
    }
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border">
      <div className="p-3 space-y-3">
        {tweets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Awaiting fetched tweets. Add mock items in data/mock-tweets.ts or run Step 1 after adjusting filters.
          </p>
        ) : (
          tweets.map((t) => {
            const preview = t.text.length > 80 ? `${t.text.slice(0, 80)}...` : t.text
            const idKey = String(t.id)
            return (
              <label key={idKey} className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedIds.includes(t.id)}
                  onCheckedChange={(c) => toggle(t.id, Boolean(c))}
                  aria-label={`Select tweet by ${t.author}`}
                />
                <div className="text-sm leading-6">
                  <span className="font-medium">{t.author}</span>{" "}
                  <span className="text-muted-foreground">({t.date})</span>: {preview}
                </div>
              </label>
            )
          })
        )}
      </div>
    </ScrollArea>
  )
}
