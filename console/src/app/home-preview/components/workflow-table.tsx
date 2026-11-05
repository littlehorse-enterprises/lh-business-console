import { cn } from "@/lib/utils";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Card } from "@littlehorse-enterprises/ui-library/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@littlehorse-enterprises/ui-library/table";
import { workflowSpec } from "../data";
import { semanticColors } from "./semantic-colors";

export function WorkflowTable({
  pendingTasks,
  ordersOutForDelivery,
  delivered,
  latency,
  onSelect,
}: {
  pendingTasks: number;
  ordersOutForDelivery: number;
  delivered: number;
  latency: string;
  onSelect: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">Workflows</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30">
            <TableHead>Workflow</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Orders Out For Delivery
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Pending user tasks
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Delivered orders
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Average delivery time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-border">
            <TableCell>
              <Button
                variant="link"
                className="h-auto p-0 text-foreground"
                onClick={onSelect}
              >
                {workflowSpec.displayName}
              </Button>
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium tabular-nums",
                semanticColors.info.text,
              )}
            >
              {ordersOutForDelivery}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  "inline-flex min-w-7 justify-center rounded-md border px-2 py-0.5 text-xs font-medium",
                  pendingTasks
                    ? semanticColors.warning.badge
                    : "border-border text-muted-foreground",
                )}
              >
                {pendingTasks}
              </span>
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-medium tabular-nums",
                semanticColors.success.text,
              )}
            >
              {delivered}
            </TableCell>
            <TableCell className="text-right tabular-nums whitespace-nowrap">
              {latency}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
