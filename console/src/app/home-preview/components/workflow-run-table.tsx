import { cn } from "@/lib/utils";
import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Card } from "@littlehorse-enterprises/ui-library/card";
import { Input } from "@littlehorse-enterprises/ui-library/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@littlehorse-enterprises/ui-library/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@littlehorse-enterprises/ui-library/tabs";
import { Clock, Search } from "lucide-react";
import { orderStatuses, type WorkflowRun } from "../data";
import { PreviewSelect } from "./preview-select";
import { semanticColors } from "./semantic-colors";
import { WorkflowStatus } from "./workflow-status";

export function WorkflowRunTable({
  runs,
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  pendingOnly,
  onPendingOnly,
  pendingTasks,
  sampleCount,
  userTasks,
  onOpen,
  limit,
  onViewAll,
}: {
  runs: WorkflowRun[];
  query: string;
  onQuery: (value: string) => void;
  statusFilter: string;
  onStatusFilter: (value: string) => void;
  pendingOnly: boolean;
  onPendingOnly: (value: boolean) => void;
  pendingTasks: number;
  sampleCount: number;
  userTasks: boolean;
  onOpen: (run: WorkflowRun) => void;
  limit?: number;
  onViewAll?: () => void;
}) {
  const shownRuns = limit ? runs.slice(0, limit) : runs;
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">
          {userTasks ? "User Tasks" : "Workflow Runs"}
        </h2>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-48 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search workflow runs"
            placeholder="Search by user id or order id"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <PreviewSelect
          label="Status"
          value={statusFilter}
          onChange={onStatusFilter}
          options={[
            { value: "all", label: "All statuses" },
            ...orderStatuses.map((status) => ({
              value: status.value,
              label: status.label,
            })),
          ]}
          className="w-full sm:w-52"
        />
        {(query || statusFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              onQuery("");
              onStatusFilter("all");
            }}
          >
            Clear search
          </Button>
        )}
      </div>
      {!userTasks && (
        <Tabs
          value={pendingOnly ? "pending" : "all"}
          onValueChange={(value) => onPendingOnly(value === "pending")}
          className="px-4 pb-4"
        >
          <TabsList className="inline-flex! w-fit! self-start">
            <TabsTrigger
              value="pending"
              className="px-2 text-xs sm:px-3 sm:text-sm"
            >
              Pending user tasks{" "}
              <span className="ml-2 tabular-nums">{pendingTasks}</span>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="px-2 text-xs sm:px-3 sm:text-sm"
            >
              All workflow runs{" "}
              <span className="ml-2 tabular-nums">{sampleCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30">
            <TableHead>WfRun</TableHead>
            <TableHead>order-id</TableHead>
            <TableHead>user-id</TableHead>
            <TableHead>order-status</TableHead>
            <TableHead>User Task</TableHead>
            <TableHead>
              <span className="sr-only">View</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shownRuns.map((run) => (
            <TableRow key={run.id} className="border-border">
              <TableCell>
                <Button
                  variant="link"
                  className="h-auto p-0 font-mono text-xs text-foreground"
                  title={run.id}
                  onClick={() => onOpen(run)}
                >
                  {run.id.slice(0, 8)}…{run.id.slice(-4)}
                </Button>
              </TableCell>
              <TableCell className="font-mono text-sm">{run.orderId}</TableCell>
              <TableCell className={semanticColors.info.text}>
                {run.userId}
              </TableCell>
              <TableCell>
                <WorkflowStatus status={run.status} />
              </TableCell>
              <TableCell>
                {run.userTask ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 font-normal",
                      semanticColors[
                        run.userTask === "pending" ? "warning" : "success"
                      ].badge,
                    )}
                  >
                    <Clock aria-hidden className="size-3" />
                    {run.userTask === "pending" ? "Pending" : "Executed"}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpen(run)}
                  aria-label={`View workflow run for order ${run.orderId}`}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {shownRuns.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                {userTasks && !query && statusFilter === "all"
                  ? "No pending user tasks."
                  : "No workflow runs match the search."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Showing {shownRuns.length} of {runs.length} sample workflow runs
      </div>
    </Card>
  );
}
