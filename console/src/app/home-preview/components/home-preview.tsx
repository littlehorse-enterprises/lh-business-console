"use client";

import { cn } from "@/lib/utils";
import { Card } from "@littlehorse-enterprises/ui-library/card";
import { CheckCircle2, ClipboardList, Clock, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  deliveredOrders,
  initialWorkflowRuns,
  orderStatuses,
  previousDeliveredOrders,
  workflowSpec,
  type WorkflowRun,
} from "../data";
import { PreviewSelect } from "./preview-select";
import { PreviewShell, viewNames, type View } from "./preview-shell";
import { semanticColors } from "./semantic-colors";
import { WorkflowMetrics } from "./workflow-metrics";
import { WorkflowRunTable } from "./workflow-run-table";
import {
  WorkflowRunView,
  type WorkflowHistoryEntry,
} from "./workflow-run-view";
import { WorkflowTable } from "./workflow-table";

export default function HomePreview() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState("current");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [runs, setRuns] = useState(initialWorkflowRuns);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [history, setHistory] = useState<
    Record<string, WorkflowHistoryEntry[]>
  >({});
  const pendingTasks = runs.filter((run) => run.userTask === "pending").length;
  const periodIndex = period === "current" ? 0 : 1;
  const newlyDelivered = runs.filter(
    (run) => run.status === "DELIVERED" && run.userTask === "executed",
  ).length;
  const totalDelivered =
    workflowSpec.delivered[periodIndex] +
    (periodIndex === 0 ? newlyDelivered : 0);
  const outForDelivery =
    workflowSpec.ordersOutForDelivery +
    runs.filter((run) => run.status === "PICKED_UP").length -
    initialWorkflowRuns.filter((run) => run.status === "PICKED_UP").length;
  const activity =
    periodIndex === 0
      ? deliveredOrders.map((value, index) =>
          index === deliveredOrders.length - 1 ? value + newlyDelivered : value,
        )
      : previousDeliveredOrders;
  const filteredRuns = runs.filter(
    (run) =>
      (view !== "tasks" || run.userTask === "pending") &&
      (!pendingOnly || run.userTask === "pending" || view === "tasks") &&
      (statusFilter === "all" || run.status === statusFilter) &&
      `${run.id} ${run.orderId} ${run.userId} ${run.status}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );

  function navigate(next: View) {
    setView(next);
    setStatusFilter("all");
    setQuery("");
    setPendingOnly(false);
  }

  function executeUserTask(run: WorkflowRun) {
    const index = orderStatuses.findIndex(
      (status) => status.value === run.status,
    );
    const status =
      orderStatuses[Math.min(index + 1, orderStatuses.length - 1)].value;
    const entries: WorkflowHistoryEntry[] = [
      { type: "User Task", message: "Executed" },
    ];
    if (status === "PICKED_UP")
      entries.push({
        type: "WorkflowEvent",
        name: "order-picked-up",
        message: "Your order was picked up just now.",
      });
    if (status === "DELIVERED")
      entries.push({
        type: "WorkflowEvent",
        name: "order-delivered",
        message: "Your order was delivered at Apartment Building just now.",
      });
    setHistory((current) => ({
      ...current,
      [run.id]: [...entries, ...(current[run.id] || [])],
    }));
    setRuns((current) =>
      current.map((item) =>
        item.id === run.id ? { ...item, status, userTask: "executed" } : item,
      ),
    );
    setSelectedRun(null);
    toast.success("User task executed", { description: `WfRun: ${run.id}` });
  }

  const statistics = [
    {
      label: "Orders Out For Delivery",
      value: outForDelivery,
      detail: "order-status: PICKED_UP",
      icon: Truck,
      tone: "info" as const,
    },
    {
      label: "Pending user tasks",
      value: pendingTasks,
      detail: "user-id: Bob",
      icon: ClipboardList,
      tone: "warning" as const,
    },
    {
      label: "Delivered orders",
      value: totalDelivered.toLocaleString(),
      detail: periodIndex === 0 ? "Last 30 days" : "Previous 30 days",
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Latency",
      value: workflowSpec.latency[periodIndex],
      detail: "Ready for pickup → Delivered",
      icon: Clock,
      tone: null,
    },
  ];

  return (
    <PreviewShell view={view} onNavigate={navigate} taskCount={pendingTasks}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {viewNames[view]}
        </h1>
        {view !== "tasks" && (
          <PreviewSelect
            label="Metrics window"
            value={period}
            onChange={setPeriod}
            className="w-48"
            options={[
              { value: "current", label: "Last 30 days" },
              { value: "previous", label: "Previous 30 days" },
            ]}
          />
        )}
      </div>
      {(view === "overview" || view === "metrics") && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {statistics.map(({ label, value, detail, icon: Icon, tone }) => (
            <Card
              key={label}
              className={cn(
                "gap-0 rounded-lg border-border p-4 shadow-none",
                tone && semanticColors[tone].surface,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {label}
                </p>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md",
                    tone
                      ? semanticColors[tone].icon
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-3 text-2xl font-semibold tabular-nums",
                  tone && semanticColors[tone].text,
                )}
              >
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </Card>
          ))}
        </div>
      )}
      {view !== "tasks" && (
        <WorkflowTable
          pendingTasks={pendingTasks}
          ordersOutForDelivery={outForDelivery}
          delivered={totalDelivered}
          latency={workflowSpec.latency[periodIndex]}
          onSelect={() => navigate("workflows")}
        />
      )}
      {view !== "metrics" && (
        <WorkflowRunTable
          runs={filteredRuns}
          query={query}
          onQuery={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          pendingOnly={pendingOnly}
          onPendingOnly={setPendingOnly}
          pendingTasks={pendingTasks}
          sampleCount={runs.length}
          userTasks={view === "tasks"}
          onOpen={setSelectedRun}
          limit={view === "overview" ? 4 : undefined}
          onViewAll={
            view === "overview" ? () => navigate("workflows") : undefined
          }
        />
      )}
      {(view === "overview" || view === "metrics") && (
        <WorkflowMetrics
          values={activity}
          total={totalDelivered}
          previous={periodIndex === 1}
        />
      )}
      <WorkflowRunView
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
        onExecute={executeUserTask}
        history={selectedRun ? history[selectedRun.id] || [] : []}
      />
    </PreviewShell>
  );
}
