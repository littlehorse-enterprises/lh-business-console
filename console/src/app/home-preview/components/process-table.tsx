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
import { semanticColors } from "./semantic-colors";
import { cn } from "@/lib/utils";
import { processes, type BusinessCase, type ProcessId } from "../data";

export function ProcessTable({
  cases,
  periodIndex,
  onSelect,
  onViewAll,
}: {
  cases: BusinessCase[];
  periodIndex: number;
  onSelect: (id: ProcessId) => void;
  onViewAll?: () => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">Business Processes</h2>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30">
            <TableHead>Process</TableHead>
            <TableHead className="text-right">In progress</TableHead>
            <TableHead className="text-right">Needs attention</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              Avg. turnaround
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id} className="border-border">
              <TableCell>
                <Button
                  variant="link"
                  className="h-auto justify-start p-0 text-left font-medium text-foreground"
                  onClick={() => onSelect(process.id)}
                >
                  {process.name}
                </Button>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium tabular-nums",
                  semanticColors.info.text,
                )}
              >
                {process.active}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <span
                  className={cn(
                    "inline-flex min-w-7 justify-center rounded-md border px-2 py-0.5 text-xs font-medium",
                    semanticColors.warning.badge,
                  )}
                >
                  {
                    cases.filter(
                      (item) => item.processId === process.id && item.attention,
                    ).length
                  }
                </span>
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium tabular-nums",
                  semanticColors.success.text,
                )}
              >
                {process.completed[periodIndex]}
              </TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">
                {process.id === "onboarding" && periodIndex === 1
                  ? "2.7 days"
                  : process.turnaround}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
