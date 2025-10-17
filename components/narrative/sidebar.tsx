"use client";

import { Button } from "@/components/ui/button";
import {
  Home,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  FolderOpen,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

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
          <Link href="/" className="block">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Home className="size-4" />
              Narrative
            </Button>
          </Link>
          <Link href="/analytics" className="block">
            <Button
              variant={pathname === "/analytics" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <BarChart3 className="size-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/file-manager" className="block">
            <Button
              variant={pathname === "/file-manager" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <FolderOpen className="size-4" />
              File Manager
            </Button>
          </Link>
          <Link href="/reports" className="block">
            <Button
              variant={pathname === "/reports" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <FileText className="size-4" />
              Reports
            </Button>
          </Link>
          <Link href="/influencers" className="block">
            <Button
              variant={pathname === "/influencers" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Users className="size-4" />
              Influencers
            </Button>
          </Link>
          <div className="pt-4 border-t mt-4">
            <Link href="/settings" className="block">
              <Button
                variant={pathname === "/settings" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Settings className="size-4" />
                Settings
              </Button>
            </Link>
            <Link href="/help" className="block">
              <Button
                variant={pathname === "/help" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <HelpCircle className="size-4" />
                Help
              </Button>
            </Link>
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
