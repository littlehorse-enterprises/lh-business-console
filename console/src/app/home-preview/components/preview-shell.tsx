import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
} from "@littlehorse-enterprises/ui-library/avatar";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@littlehorse-enterprises/ui-library/dialog";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Info,
  Users,
  Workflow,
} from "lucide-react";
import { useState, type ReactNode } from "react";

export type View = "overview" | "workflows" | "tasks" | "metrics";
export const viewNames: Record<View, string> = {
  overview: "Process Overview",
  workflows: "Processes",
  tasks: "User Tasks",
  metrics: "Metrics",
};
const navigation = [
  { id: "overview", icon: Home },
  { id: "workflows", icon: Workflow },
  { id: "tasks", icon: ClipboardList },
  { id: "metrics", icon: BarChart3 },
] as const;

export function PreviewShell({
  view,
  onNavigate,
  taskCount,
  children,
}: {
  view: View;
  onNavigate: (view: View) => void;
  taskCount: number;
  children: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <div className="flex h-dvh flex-col bg-background font-sans text-foreground">
      <a
        href="#preview-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("overview")}
            className="flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-ring"
            aria-label="LittleHorse Business Console home"
          >
            <img
              src="/images/logo.svg"
              alt=""
              width={40}
              height={40}
              className="dark:hidden"
            />
            <img
              src="/images/logo-white.svg"
              alt=""
              width={40}
              height={40}
              className="hidden dark:block"
            />
            <span>
              <span className="block text-lg font-bold leading-6">
                LittleHorse
              </span>
              <span className="block text-xs font-medium text-muted-foreground">
                Business Console
              </span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium">Bob</p>
              <p className="text-xs text-muted-foreground">Business user</p>
            </div>
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                B
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="shrink-0 border-b border-border bg-background md:w-56 md:border-r md:border-b-0">
          <nav
            aria-label="Main navigation"
            className="flex gap-1 overflow-x-auto p-2 md:h-full md:flex-col md:py-4"
          >
            {navigation.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() => onNavigate(id)}
                aria-current={view === id ? "page" : undefined}
                className={cn(
                  "shrink-0 justify-start gap-2 px-2 text-xs sm:text-sm md:w-full md:gap-3 md:px-3",
                  view === id
                    ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="hidden size-4 sm:block" />
                <span>{viewNames[id]}</span>
                {id === "tasks" && (
                  <span className="ml-auto rounded bg-background/60 px-1.5 text-xs text-foreground">
                    {taskCount}
                  </span>
                )}
              </Button>
            ))}
            <div className="mt-5 hidden border-t border-border pt-4 md:block">
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                Configuration
              </p>
              <Button
                variant="ghost"
                disabled
                className="w-full justify-start gap-3 text-muted-foreground"
              >
                <FileText className="size-4" />
                User Task Forms
              </Button>
              <Button
                variant="ghost"
                disabled
                className="w-full justify-start gap-3 text-muted-foreground"
              >
                <Users className="size-4" />
                Users & Groups
              </Button>
              <p className="mt-1 px-3 text-xs text-muted-foreground">
                Not included in this preview
              </p>
            </div>
            <Button
              variant="ghost"
              className="hidden justify-start gap-3 text-muted-foreground md:mt-auto md:flex"
              onClick={() => setDetailsOpen(true)}
            >
              <Info className="size-4" />
              Business Console
            </Button>
          </nav>
        </aside>
        <main
          id="preview-main"
          className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6"
        >
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{viewNames[view]}</span>
              <span>Preview · Sample data · Resets on reload</span>
            </div>
            {children}
          </div>
        </main>
      </div>
      <footer className="flex shrink-0 justify-between gap-4 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground md:px-6">
        <span>© 2026 LittleHorse Enterprises LLC</span>
        <button
          className="hover:underline"
          onClick={() => setDetailsOpen(true)}
        >
          Business Console
        </button>
      </footer>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Console</DialogTitle>
            <DialogDescription>
              Business Console home page visualization for initial design
              discussions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Processes, orders, user tasks, and metrics use sample data.
              Completing a user task updates this preview and resets on reload.
            </p>
            <p>
              The order list is a sample of the process totals. User Task Forms
              and permissions are outside this preview.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
