import type { UserTaskStatus } from "@littlehorse-enterprises/user-tasks-bridge-api-client";

export type TaskFilters = {
  user_group_id?: string;
  status?: UserTaskStatus;
  earliest_start_date?: string;
  latest_start_date?: string;
};

const filterKeys = [
  "user_group_id",
  "status",
  "earliest_start_date",
  "latest_start_date",
] as const;

export function readTaskFilters(
  params: Pick<URLSearchParams, "get">,
): TaskFilters {
  return Object.fromEntries(
    filterKeys.flatMap((key) => {
      const value = params.get(key);
      return value ? [[key, value]] : [];
    }),
  );
}

export function updateTaskFilters(
  params: URLSearchParams,
  filters: TaskFilters,
) {
  const next = new URLSearchParams(params);
  for (const key of filterKeys) {
    next.delete(key);
    if (filters[key]) next.set(key, filters[key]);
  }
  return next;
}
