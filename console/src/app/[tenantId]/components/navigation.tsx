"use client";

import { getAdminView } from "@/lib/console-navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@littlehorse-enterprises/ui-library/button";
import { ClipboardList, FileText, Users, UsersRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";

export default function Navigation() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const adminPath = `/${tenantId}/admin`;
  const admin =
    session?.roles.includes("lh-user-tasks-admin") &&
    (pathname === adminPath || pathname.startsWith(`${adminPath}/`));
  const current = admin
    ? pathname !== adminPath
      ? "forms"
      : getAdminView({
          view: searchParams.get("view") || undefined,
          tab: searchParams.get("tab") || undefined,
        })
    : "tasks";
  const links = [
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    ...(admin ? [{ id: "forms", label: "Forms", icon: FileText }] : []),
    ...(admin
      ? [
          { id: "users", label: "Users", icon: Users },
          { id: "groups", label: "Groups", icon: UsersRound },
        ]
      : []),
  ];

  return (
    <aside className="shrink-0 border-b border-border bg-background md:w-56 md:border-r md:border-b-0">
      <nav
        aria-label="Main navigation"
        className="flex items-center gap-1 overflow-x-auto p-2 md:h-full md:flex-col md:items-stretch md:py-5"
      >
        <p className="hidden px-3 pb-2 text-xs font-semibold text-muted-foreground md:block">
          User Tasks
        </p>
        {links.map(({ id, label, icon: Icon }) => (
          <div key={id} className="shrink-0">
            {id === "users" && (
              <p className="mt-5 mb-2 hidden border-t border-border px-3 pt-4 text-xs font-semibold text-muted-foreground md:block">
                Administration
              </p>
            )}
            <Link
              href={admin ? `${adminPath}?view=${id}` : `/${tenantId}`}
              aria-current={current === id ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-2 px-3 text-sm md:gap-3",
                current === id
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}
