"use client";

import { adminGetAllTasks } from "@/app/[tenantId]/actions/admin";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@littlehorse-enterprises/ui-library/alert";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Input } from "@littlehorse-enterprises/ui-library/input";
import { Skeleton } from "@littlehorse-enterprises/ui-library/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@littlehorse-enterprises/ui-library/table";
import {
  UserTaskStatus,
  type UserTaskRunListDTO,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type TaskCount = { value: number; more: boolean };
type FormCounts = {
  name: string;
  total?: TaskCount;
  available?: TaskCount;
  assignedToMe?: TaskCount;
};

function countTasks(data?: UserTaskRunListDTO): TaskCount | undefined {
  return data
    ? { value: data.userTasks.length, more: !!data.bookmark }
    : undefined;
}

function Count({ count, loading }: { count?: TaskCount; loading: boolean }) {
  if (loading)
    return <Skeleton aria-label="Loading count" className="ml-auto h-4 w-8" />;
  return count ? (
    <>
      {count.value}
      {count.more ? "+" : ""}
    </>
  ) : (
    <span title="Count unavailable">—</span>
  );
}

export default function UserTaskDefs({
  tenantId,
  userTaskDefs,
  hasError,
}: {
  tenantId: string;
  userTaskDefs: string[];
  hasError: boolean;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [search, setSearch] = useState("");
  const {
    data: counts,
    error,
    refetch,
    isFetching,
  } = useQuery<FormCounts[]>({
    queryKey: ["form-table-counts", tenantId, userTaskDefs, userId],
    queryFn: async () => {
      if (!userId) return [];
      return Promise.all(
        userTaskDefs.map(async (name) => {
          const [total, available, assignedToMe] = await Promise.all([
            adminGetAllTasks(tenantId, { type: name, limit: 100 }),
            adminGetAllTasks(tenantId, {
              type: name,
              status: UserTaskStatus.UNASSIGNED,
              limit: 100,
            }),
            adminGetAllTasks(tenantId, {
              type: name,
              status: UserTaskStatus.ASSIGNED,
              user_id: userId,
              limit: 100,
            }),
          ]);
          return {
            name,
            total: countTasks(total.data),
            available: countTasks(available.data),
            assignedToMe: countTasks(assignedToMe.data),
          };
        }),
      );
    },
    enabled: userTaskDefs.length > 0 && !hasError && !!userId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  if (hasError)
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Error loading forms</AlertTitle>
        <AlertDescription>
          Could not load forms. Please try again.
        </AlertDescription>
      </Alert>
    );

  const matchingForms = userTaskDefs.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const loadingCounts = !counts && !error;
  const countError =
    !!error ||
    counts?.some(
      (form) => !form.total || !form.available || !form.assignedToMe,
    );

  return (
    <div className="space-y-4">
      <div className="relative max-w-lg">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
        />
        <Input
          aria-label="Search forms"
          placeholder="Search forms..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9 pr-10"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear form search"
            onClick={() => setSearch("")}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {countError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Some task counts could not be loaded</AlertTitle>
          <AlertDescription>
            The forms are still available below.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
            className="mt-3"
          >
            <RefreshCw className="mr-2 size-4" />
            Retry counts
          </Button>
        </Alert>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table aria-label="Forms">
          <TableHeader>
            <TableRow className="border-border bg-muted/30">
              <TableHead className="pl-4">Form</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Total tasks
              </TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Assigned to me
              </TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchingForms.map((name) => {
              const form = counts?.find((item) => item.name === name);
              const href = `/${tenantId}/admin/${encodeURIComponent(name)}`;
              return (
                <TableRow key={name} className="border-border">
                  <TableCell className="pl-4 py-4">
                    <Link href={href} className="font-medium hover:underline">
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Count count={form?.total} loading={loadingCounts} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-blue-700 dark:text-blue-300">
                    <Count count={form?.available} loading={loadingCounts} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-amber-900 dark:text-amber-200">
                    <Count count={form?.assignedToMe} loading={loadingCounts} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={href} aria-label={`View tasks for ${name}`}>
                        View tasks
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {matchingForms.length === 0 && (
              <TableRow className="border-border">
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  {search
                    ? "No forms match your search."
                    : "No forms are registered yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Showing {matchingForms.length} of {userTaskDefs.length} loaded forms
        </p>
      </div>
    </div>
  );
}
