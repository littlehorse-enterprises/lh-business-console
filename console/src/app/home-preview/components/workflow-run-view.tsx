import { cn } from "@/lib/utils";
import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@littlehorse-enterprises/ui-library/sheet";
import { Check, Clock, Radio } from "lucide-react";
import {
  initialWorkflowRuns,
  orderStatuses,
  workflowSpec,
  type WorkflowRun,
} from "../data";
import { semanticColors } from "./semantic-colors";
import { WorkflowStatus } from "./workflow-status";

export type WorkflowHistoryEntry = {
  type: "User Task" | "WorkflowEvent";
  message: string;
  name?: string;
};

export function WorkflowRunView({
  run,
  onClose,
  onExecute,
  history,
}: {
  run: WorkflowRun | null;
  onClose: () => void;
  onExecute: (run: WorkflowRun) => void;
  history: WorkflowHistoryEntry[];
}) {
  return (
    <Sheet
      open={run !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto border-border sm:max-w-xl">
        {run && (
          <RunContent
            key={run.id}
            run={run}
            onExecute={onExecute}
            history={history}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function RunContent({
  run,
  onExecute,
  history,
}: {
  run: WorkflowRun;
  onExecute: (run: WorkflowRun) => void;
  history: WorkflowHistoryEntry[];
}) {
  const currentStatus = orderStatuses.findIndex(
    (status) => status.value === run.status,
  );
  const initialStatus = initialWorkflowRuns.find(
    (item) => item.id === run.id,
  )!.status;
  const initialStatusIndex = orderStatuses.findIndex(
    (status) => status.value === initialStatus,
  );
  const publicVariables = [
    ["order-id", run.orderId],
    ["user-id", run.userId],
    ["order-status", run.status],
  ];
  return (
    <div className="space-y-6">
      <SheetHeader className="pr-7 text-left">
        <SheetTitle className="text-xl">Workflow Run View</SheetTitle>
        <SheetDescription>WfSpec: {workflowSpec.name}</SheetDescription>
        <p className="break-all font-mono text-xs text-muted-foreground">
          WfRun: {run.id}
        </p>
      </SheetHeader>
      <WorkflowStatus status={run.status} />
      <section aria-label="Workflow status">
        <h3 className="mb-4 text-sm font-semibold">
          Status: {workflowSpec.statusVariable}
        </h3>
        <ol>
          {orderStatuses.map((status, index) => {
            const delivered =
              status.value === "DELIVERED" && run.status === "DELIVERED";
            const executed = index < currentStatus || delivered;
            return (
              <li
                key={status.value}
                className="relative flex items-start gap-3 pb-5 last:pb-0"
              >
                <span
                  className={cn(
                    "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                    executed
                      ? semanticColors.success.badge
                      : index === currentStatus
                        ? semanticColors.info.badge
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {executed ? <Check className="size-4" /> : index + 1}
                </span>
                {index < orderStatuses.length - 1 && (
                  <span
                    className={cn(
                      "absolute top-7 bottom-0 left-3.5 border-l",
                      index < currentStatus
                        ? "border-success/40"
                        : "border-border",
                    )}
                  />
                )}
                <p
                  className={cn(
                    "pt-0.5 text-sm",
                    executed && semanticColors.success.text,
                    index === currentStatus && "font-semibold",
                    index > currentStatus && "text-muted-foreground",
                  )}
                >
                  {status.label}
                </p>
                {index === currentStatus && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-auto font-normal",
                      semanticColors[delivered ? "success" : "info"].badge,
                    )}
                  >
                    order-status
                  </Badge>
                )}
              </li>
            );
          })}
        </ol>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold">Public Variables</h3>
        <dl className="divide-y divide-border rounded-md border border-border">
          {publicVariables.map(([name, value]) => (
            <div
              key={name}
              className="flex justify-between gap-4 px-4 py-3 text-sm"
            >
              <dt className="shrink-0 font-mono text-muted-foreground">
                {name}
              </dt>
              <dd
                className={cn(
                  "text-right break-words",
                  name === "user-id" && semanticColors.info.text,
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {run.userTask === "pending" && (
        <section
          className={cn(
            "space-y-4 rounded-lg border p-4",
            semanticColors.info.surface,
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">User Task</h3>
            <Badge variant="outline" className={semanticColors.warning.badge}>
              Pending
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">user-id: {run.userId}</p>
          <Button onClick={() => onExecute(run)}>Execute user task</Button>
          <p className="text-xs text-muted-foreground">
            Sample data. No workflow is changed.
          </p>
        </section>
      )}
      <section>
        <h3 className="mb-4 text-sm font-semibold">Timeline</h3>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={index} className="flex gap-3">
              {entry.type === "User Task" ? (
                <Check
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    semanticColors.success.text,
                  )}
                />
              ) : (
                <Radio
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    semanticColors.info.text,
                  )}
                />
              )}
              <div>
                <p className="text-sm font-medium">
                  {entry.type}
                  {entry.name && `: ${entry.name}`}
                </p>
                <p className="mt-1 text-sm">{entry.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
          ))}
          {run.userTask === "pending" && (
            <div className="flex gap-3">
              <Clock
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  semanticColors.warning.text,
                )}
              />
              <div>
                <p className="text-sm">User Task: Pending</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  user-id: {run.userId}
                </p>
              </div>
            </div>
          )}
          {initialStatusIndex >= 2 && (
            <div className="flex gap-3">
              <Radio
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  semanticColors.info.text,
                )}
              />
              <div>
                <p className="text-sm font-medium">
                  WorkflowEvent: order-picked-up
                </p>
                <p className="mt-1 text-sm">
                  Your order was picked up at 9:42 AM.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Oct 26, 2026
                </p>
              </div>
            </div>
          )}
          {initialStatus === "DELIVERED" && (
            <div className="flex gap-3">
              <Check
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  semanticColors.success.text,
                )}
              />
              <div>
                <p className="text-sm font-medium">
                  WorkflowEvent: order-delivered
                </p>
                <p className="mt-1 text-sm">
                  Your order was delivered at Apartment Building at 10:00 AM.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Oct 26, 2026
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
