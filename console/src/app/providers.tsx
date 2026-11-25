"use client";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPreview =
    pathname === "/home-preview" || pathname === "/form-builder-preview";

  return (
    <SessionProvider
      session={isPreview ? null : undefined}
      refetchOnWindowFocus={!isPreview}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
