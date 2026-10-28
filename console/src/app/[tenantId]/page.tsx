import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@littlehorse-enterprises/ui-library/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@littlehorse-enterprises/ui-library/tabs";
import { AlertCircle } from "lucide-react";
import { readTaskFilters } from "@/lib/task-filters";
import {
  getClaimableTasks,
  getUserGroupsFromIdentityProvider,
  getUserTasks,
} from "./actions/user";
import ListUserTasks from "./components/user-task/list";
import ListClaimableUserTasks from "./components/user-task/list-claimable";

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { tenantId } = await params;
  const search = await searchParams;
  const filters = readTaskFilters({ get: (key) => search[key] || null });
  const [groupResult, tasks] = await Promise.all([
    getUserGroupsFromIdentityProvider(tenantId),
    getUserTasks(tenantId, { ...filters, limit: 100 }),
  ]);
  const groups = groupResult.data?.groups || [];
  const available = await Promise.all(
    groups.map((group) =>
      getClaimableTasks(tenantId, { user_group_id: group.id, limit: 10 }),
    ),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      {groupResult.error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load available tasks</AlertTitle>
          <AlertDescription>
            Your assigned tasks are still available. Try again to load tasks
            from your groups.
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="my-tasks" className="w-full">
        <TabsList className="inline-flex! w-fit! self-start">
          <TabsTrigger value="my-tasks">My tasks</TabsTrigger>
          {groups.length > 0 && (
            <TabsTrigger value="claimable-tasks">Available tasks</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="my-tasks" className="pt-4">
          <ListUserTasks
            key="my-tasks"
            showHeading={false}
            userGroups={groups}
            initialData={tasks.data || { userTasks: [] }}
            initialError={tasks.error}
          />
        </TabsContent>
        {groups.length > 0 && (
          <TabsContent value="claimable-tasks" className="pt-4">
            <ListClaimableUserTasks
              userGroups={[groups[0], ...groups.slice(1)]}
              initialData={available.map(
                (result) => result.data || { userTasks: [] },
              )}
              initialErrors={available.map((result) => result.error)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
