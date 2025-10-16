import { Button } from "@/components/ui/button";
import { Home, BarChart3, FileText, Settings, HelpCircle } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card flex-shrink-0 overflow-y-auto">
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              AI
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm">Darpan</div>
            <div className="text-xs text-muted-foreground">AI Analysis</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <Home className="size-4" />
            Narrative
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BarChart3 className="size-4" />
            Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="size-4" />
            Reports
          </Button>
          <div className="pt-4 border-t mt-4">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="size-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <HelpCircle className="size-4" />
              Help
            </Button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
