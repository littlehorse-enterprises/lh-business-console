import { getAdminView } from "@/lib/console-navigation";
import { readTaskFilters } from "@/lib/task-filters";
import { UserTaskStatus } from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import {
  adminGetAllTasks,
  adminGetAllUserTaskDefs,
  adminGetUserGroups,
} from "../actions/admin";
import { getGroups } from "../actions/group-management";
import { getUsersFromIdP } from "../actions/user-management";
import ListUserTasks from "../components/user-task/list";
import GroupsManagement from "./components/groups";
import UserTaskDefs from "./components/userTaskDefs";
import UsersManagement from "./components/users";

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { tenantId } = await params;
  const search = await searchParams;
  const view = getAdminView(search);

  if (view === "users") {
    const result = await getUsersFromIdP(tenantId, { max_results: 1000 });
    return (
      <UsersManagement
        tenantId={tenantId}
        initialUsers={result.data?.users || []}
        hasError={!!result.error}
      />
    );
  }
  if (view === "groups") {
    const result = await getGroups(tenantId, { max_results: 1000 });
    return (
      <GroupsManagement
        tenantId={tenantId}
        initialGroups={result.data?.groups || []}
        hasError={!!result.error}
      />
    );
  }
  if (view === "forms") {
    const result = await adminGetAllUserTaskDefs(tenantId, { limit: 1000 });
    const names = result.data?.userTaskDefNames || [];
    return (
      <div className="space-y-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          {!result.error && (
            <span className="text-sm text-muted-foreground">
              {names.length}
              {result.data?.bookmark ? "+" : ""}{" "}
              {names.length === 1 && !result.data?.bookmark ? "form" : "forms"}
            </span>
          )}
        </div>
        <UserTaskDefs
          tenantId={tenantId}
          userTaskDefs={names}
          hasError={!!result.error}
        />
      </div>
    );
  }

  const filters = readTaskFilters({ get: (key) => search[key] || null });
  const [tasks, groups] = await Promise.all([
    // A status is required when searching across forms by the existing kernel API.
    adminGetAllTasks(tenantId, {
      ...filters,
      status: filters.status || UserTaskStatus.ASSIGNED,
      type: "",
      limit: 100,
    }),
    adminGetUserGroups(tenantId),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      <ListUserTasks
        key="all-tasks"
        admin
        showHeading={false}
        userGroups={groups.data?.groups || []}
        initialData={tasks.data || { userTasks: [] }}
        initialError={tasks.error}
      />
    </div>
  );
}
