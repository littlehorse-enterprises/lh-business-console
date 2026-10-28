"use client";

import { cn } from "@/lib/utils";
import { Card } from "@littlehorse-enterprises/ui-library/card";
import { ClipboardList, Clock, Workflow, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  initialCases,
  monthlyActivity,
  processes,
  weeklyActivity,
  type BusinessCase,
  type ProcessId,
} from "../data";
import { ActivityChart } from "./activity-chart";
import { CaseDetails, type ReviewEvent } from "./case-details";
import { CaseTable } from "./case-table";
import { PreviewSelect } from "./preview-select";
import { PreviewShell, viewNames, type View } from "./preview-shell";
import { ProcessTable } from "./process-table";
import { semanticColors } from "./semantic-colors";

export default function HomePreview() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState("7");
  const [query, setQuery] = useState("");
  const [processFilter, setProcessFilter] = useState("all");
  const [attentionOnly, setAttentionOnly] = useState(true);
  const [cases, setCases] = useState(initialCases);
  const [selectedCase, setSelectedCase] = useState<BusinessCase | null>(null);
  const [caseActivity, setCaseActivity] = useState<
    Record<string, ReviewEvent[]>
  >({});
  const completedIds = useRef(new Set<string>());
  const attentionCount = cases.filter((item) => item.attention).length;
  const taskCount = cases.filter((item) => item.mine && item.attention).length;
  const periodIndex = period === "7" ? 0 : 1;
  const completed = processes.reduce(
    (sum, process) => sum + process.completed[periodIndex],
    0,
  );
  const activity = period === "7" ? weeklyActivity : monthlyActivity;
  const filteredCases = cases.filter((item) => {
    const process = processes.find((process) => process.id === item.processId)!;
    return (
      (view !== "tasks" || (item.mine && item.attention)) &&
      (!attentionOnly || item.attention || view === "tasks") &&
      (processFilter === "all" || item.processId === processFilter) &&
      `${item.name} ${item.id} ${item.owner} ${process.name} ${item.reason}`
        .toLowerCase()
        .includes(query.toLowerCase().trim())
    );
  });

  function navigate(next: View) {
    setView(next);
    setProcessFilter("all");
    setQuery("");
    setAttentionOnly(true);
  }

  function selectProcess(id: ProcessId) {
    navigate("processes");
    setProcessFilter(id);
    setAttentionOnly(false);
  }

  function reviewTask(item: BusinessCase, decision: string, note: string) {
    const approved = decision === "approve";
    setCaseActivity((history) => ({
      ...history,
      [item.id]: [
        {
          kind: approved
            ? ("approved" as const)
            : ("changes-requested" as const),
          action: approved
            ? "Review approved by Alex Morgan"
            : "Changes requested by Alex Morgan",
          note,
        },
        ...(history[item.id] || []),
      ],
    }));
    setCases((items) =>
      items.map((current) =>
        current.id !== item.id
          ? current
          : approved
            ? {
                ...current,
                attention: false,
                stage: Math.min(current.stage + 1, 3),
                reason: "Moving to the next stage",
              }
            : { ...current, reason: "Changes requested" },
      ),
    );
    if (approved) completedIds.current.add(item.id);
    setSelectedCase(null);
    const notify = approved ? toast.success : toast.info;
    notify(
      approved ? `Task completed: ${item.id}` : `Changes requested: ${item.id}`,
      {
        description: approved
          ? "The sample case advanced to the next stage."
          : "The sample task remains open.",
      },
    );
  }

  const statistics = [
    {
      label: "In progress",
      value: 146,
      detail: "Across 3 processes",
      icon: Workflow,
      tone: "info" as const,
    },
    {
      label: "Needs attention",
      value: attentionCount,
      detail: `${taskCount} assigned to you`,
      icon: ClipboardList,
      tone: "warning" as const,
    },
    {
      label: "Completed",
      value: completed.toLocaleString(),
      detail: `Last ${period} days`,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: "Avg. turnaround",
      value: `${period === "7" ? "2.4" : "2.7"} days`,
      detail: "Customer onboarding",
      icon: Clock,
      tone: null,
    },
  ];

  return (
    <PreviewShell view={view} onNavigate={navigate} taskCount={taskCount}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {viewNames[view]}
        </h1>
        {view !== "tasks" && (
          <PreviewSelect
            label="Reporting period"
            value={period}
            onChange={setPeriod}
            className="w-44"
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
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
        <ProcessTable
          cases={cases}
          periodIndex={periodIndex}
          onSelect={selectProcess}
          onViewAll={
            view === "overview" ? () => navigate("processes") : undefined
          }
        />
      )}
      {view !== "metrics" && (
        <CaseTable
          cases={filteredCases}
          query={query}
          onQuery={setQuery}
          processFilter={processFilter}
          onProcessFilter={setProcessFilter}
          attentionOnly={attentionOnly}
          onAttentionOnly={setAttentionOnly}
          attentionCount={attentionCount}
          sampleCount={cases.length}
          myTasks={view === "tasks"}
          onOpen={setSelectedCase}
          limit={view === "overview" ? 4 : undefined}
          onViewAll={
            view === "overview" ? () => navigate("processes") : undefined
          }
        />
      )}
      {(view === "overview" || view === "metrics") && (
        <ActivityChart
          values={activity}
          completed={completed}
          period={period}
        />
      )}
      <CaseDetails
        item={selectedCase}
        onClose={() => setSelectedCase(null)}
        onReview={reviewTask}
        history={selectedCase ? caseActivity[selectedCase.id] || [] : []}
        advanced={
          selectedCase ? completedIds.current.has(selectedCase.id) : false
        }
      />
    </PreviewShell>
  );
}
