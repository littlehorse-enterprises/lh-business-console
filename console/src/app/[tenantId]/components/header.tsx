"use client";
import logoWhite from "@/../public/images/logo-white.svg";
import logoBlack from "@/../public/images/logo.svg";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Avatar,
  AvatarFallback,
} from "@littlehorse-enterprises/ui-library/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@littlehorse-enterprises/ui-library/dropdown-menu";
import { Skeleton } from "@littlehorse-enterprises/ui-library/skeleton";
import { LogOut, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin =
    status === "authenticated" &&
    session?.roles.includes("lh-user-tasks-admin");
  const { tenantId } = useParams();

  return (
    <>
      <header className="shrink-0 border-b border-border bg-background">
        <div className="px-4 py-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo and Branding */}
            <Link
              href={
                isAdmin && pathname.startsWith(`/${tenantId}/admin`)
                  ? `/${tenantId}/admin`
                  : `/${tenantId}`
              }
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <Image
                  src={
                    mounted && resolvedTheme === "dark" ? logoWhite : logoBlack
                  }
                  alt="LittleHorse"
                  height={40}
                  width={40}
                  className="transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground">
                  LittleHorse
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Business Console
                </span>
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-accent/50"
                  >
                    {status === "authenticated" ? (
                      <>
                        <div className="hidden flex-col items-end text-right md:flex">
                          <span className="text-sm font-medium text-foreground">
                            {session.user?.name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isAdmin
                              ? pathname.startsWith(`/${tenantId}/admin`)
                                ? "Administrator"
                                : "User view"
                              : "User"}
                          </span>
                        </div>
                        <Avatar className="h-9 w-9 border-2 border-border">
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {(session.user?.name || "User")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </>
                    ) : (
                      <>
                        <div className="hidden flex-col items-end text-right md:flex">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-medium">
                      {status === "authenticated"
                        ? session.user?.name || "User"
                        : "Loading..."}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {session?.user?.email}
                    </span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <>
                      {pathname.startsWith(`/${tenantId}/admin`) ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/${tenantId}`}
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            View As User
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/${tenantId}/admin`}
                            className="flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
