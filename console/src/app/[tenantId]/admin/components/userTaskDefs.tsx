"use client";

import { adminGetAllTasks } from "@/app/[tenantId]/actions/admin";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@littlehorse-enterprises/ui-library/alert";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { UserTaskStatus } from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ClipboardList, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface UserTaskDefCount {
  name: string;
  totalCount: number;
  unassignedCount: number;
  assignedToMeCount: number;
}

interface UserTaskDefsProps {
  tenantId: string;
  userTaskDefs: string[];
  hasError: boolean;
}

export default function UserTaskDefs({
  tenantId,
  userTaskDefs,
  hasError,
}: UserTaskDefsProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch task counts for each definition
  const {
    data: taskCounts,
    error: taskCountsError,
    refetch: refreshTaskCounts,
    isLoading: isTaskCountsLoading,
  } = useQuery<UserTaskDefCount[]>({
    queryKey: ["taskCounts", tenantId, userTaskDefs, userId],
    queryFn: async () => {
      if (!userTaskDefs || userTaskDefs.length === 0) {
        return [];
      }

      const countPromises = userTaskDefs.map(async (name: string) => {
        // Get unassigned tasks count
        const unassignedResult = await adminGetAllTasks(tenantId, {
          type: name,
          status: UserTaskStatus.UNASSIGNED,
          limit: 100,
        });

        // Get tasks assigned to current user
        const assignedToMeResult = userId
          ? await adminGetAllTasks(tenantId, {
              type: name,
              status: UserTaskStatus.ASSIGNED,
              user_id: userId,
              limit: 100,
            })
          : { data: { userTasks: [] } };

        const totalCountResult = await adminGetAllTasks(tenantId, {
          type: name,
          limit: 100,
        });

        // Handle error responses
        const totalCount = totalCountResult.data?.userTasks?.length || 0;
        const unassignedCount = unassignedResult.data?.userTasks?.length || 0;
        const assignedToMeCount =
          assignedToMeResult.data?.userTasks?.length || 0;

        return {
          name,
          totalCount,
          unassignedCount,
          assignedToMeCount,
        };
      });

      return Promise.all(countPromises);
    },
    enabled: userTaskDefs.length > 0 && !hasError,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  // Handle errors
  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading forms</AlertTitle>
        <AlertDescription>
          Failed to load forms. Please check your permissions and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (taskCountsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading task counts</AlertTitle>
        <AlertDescription>
          {(taskCountsError as Error).message}
        </AlertDescription>
        <Button
          onClick={() => refreshTaskCounts()}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </Alert>
    );
  }

  // Loading state
  if (
    userTaskDefs.length > 0 &&
    (isTaskCountsLoading || typeof taskCounts === "undefined")
  ) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userTaskDefs.map((name) => (
            <div
              key={name}
              className="relative rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse"
            >
              {/* Status indicator skeleton */}
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>

              {/* Header skeleton */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <div className="h-6 w-6 bg-gray-200 rounded" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>

              {/* Statistics skeleton */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-8" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-6" />
                  </div>
                </div>
              </div>

              {/* Progress bar skeleton */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between mb-2">
                  <div className="h-3 bg-gray-200 rounded w-12" />
                  <div className="h-3 bg-gray-200 rounded w-8" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (userTaskDefs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="p-4 bg-muted/50 rounded-full">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            No forms found
          </h3>
          <p className="text-muted-foreground max-w-md">
            No forms are registered yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userTaskDefs.map((name: string) => {
          const counts = taskCounts?.find(
            (count: UserTaskDefCount) => count.name === name,
          ) || {
            totalCount: 0,
            unassignedCount: 0,
            assignedToMeCount: 0,
          };

          return (
            <Link
              key={name}
              href={`/${tenantId}/admin/${encodeURIComponent(name)}`}
            >
              <div className="group relative h-full cursor-pointer overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-300" />

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 group-hover:shadow-md transition-all duration-300">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Form</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total tasks</span>
                    <span className="font-medium text-foreground">
                      {counts.totalCount > 99 ? "99+" : counts.totalCount}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">
                        {counts.unassignedCount > 99
                          ? "99+"
                          : counts.unassignedCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Assigned to me
                        </span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {counts.assignedToMeCount > 99
                          ? "99+"
                          : counts.assignedToMeCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm">
                    View Details →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
