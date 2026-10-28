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
import { Search } from "lucide-react";
import { processes, type BusinessCase } from "../data";
import { PreviewSelect } from "./preview-select";

export function CaseTable({
  cases,
  query,
  onQuery,
  processFilter,
  onProcessFilter,
  attentionOnly,
  onAttentionOnly,
  attentionCount,
  sampleCount,
  myTasks,
  onOpen,
  limit,
  onViewAll,
}: {
  cases: BusinessCase[];
  query: string;
  onQuery: (value: string) => void;
  processFilter: string;
  onProcessFilter: (value: string) => void;
  attentionOnly: boolean;
  onAttentionOnly: (value: boolean) => void;
  attentionCount: number;
  sampleCount: number;
  myTasks: boolean;
  onOpen: (item: BusinessCase) => void;
  limit?: number;
  onViewAll?: () => void;
}) {
  const shownCases = limit ? cases.slice(0, limit) : cases;
  return (
    <Card className="gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">
          {myTasks ? "Assigned Tasks" : "Process Cases"}
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
            aria-label="Search cases"
            placeholder="Search by case, name, process, or assignee"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <PreviewSelect
          label="Filter by process"
          value={processFilter}
          onChange={onProcessFilter}
          options={[
            { value: "all", label: "All processes" },
            ...processes.map((process) => ({
              value: process.id,
              label: process.name,
            })),
          ]}
          className="w-full sm:w-52"
        />
        {(query || processFilter !== "all") && (
          <Button
            variant="outline"
            onClick={() => {
              onQuery("");
              onProcessFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      {!myTasks && (
        <Tabs
          value={attentionOnly ? "attention" : "all"}
          onValueChange={(value) => onAttentionOnly(value === "attention")}
          className="px-4 pb-4"
        >
          <TabsList className="inline-flex! w-fit! self-start">
            <TabsTrigger value="attention" className="px-3">
              Needs attention{" "}
              <span className="ml-2 tabular-nums">{attentionCount}</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="px-3">
              All cases <span className="ml-2 tabular-nums">{sampleCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30">
            <TableHead>Case</TableHead>
            <TableHead>Process / Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="whitespace-nowrap">Assigned to</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shownCases.map((item) => {
            const process = processes.find(
              (process) => process.id === item.processId,
            )!;
            return (
              <TableRow key={item.id} className="border-border">
                <TableCell>
                  <Button
                    variant="link"
                    className="h-auto p-0 font-mono text-xs text-foreground"
                    onClick={() => onOpen(item)}
                  >
                    {item.id}
                  </Button>
                  <p className="mt-1 whitespace-nowrap font-medium">
                    {item.name}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <p>{process.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {process.stages[item.stage]}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      item.attention
                        ? "whitespace-nowrap border-primary/40 bg-primary/10 font-normal"
                        : "whitespace-nowrap font-normal text-muted-foreground"
                    }
                  >
                    {item.attention ? "Needs attention" : "In progress"}
                  </Badge>
                  <p className="mt-1 text-xs whitespace-nowrap text-muted-foreground">
                    {item.reason}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {item.owner}
                  {item.mine && (
                    <p className="mt-1 text-xs text-muted-foreground">You</p>
                  )}
                </TableCell>
                <TableCell
                  className={
                    item.attention && item.due.includes("overdue")
                      ? "whitespace-nowrap text-destructive"
                      : "whitespace-nowrap text-muted-foreground"
                  }
                >
                  {item.attention ? item.due : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpen(item)}
                    aria-label={`View ${item.id}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {shownCases.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                {myTasks && !query && processFilter === "all"
                  ? "No tasks assigned to you."
                  : "No cases match the selected filters."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Showing {shownCases.length} of {cases.length} sample cases
      </div>
    </Card>
  );
}
