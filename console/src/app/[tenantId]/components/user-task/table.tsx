"use client";

import { Button } from "@littlehorse-enterprises/ui-library/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@littlehorse-enterprises/ui-library/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@littlehorse-enterprises/ui-library/table";
import type { SimpleUserTaskRunDTO } from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import { useEffect, useState } from "react";
import UserTask from "./index";
import { TaskStatus } from "./status";

const taskKey = (task: SimpleUserTaskRunDTO) => `${task.wfRunId}/${task.id}`;

export default function TaskTable({
  tasks,
  admin,
  claimable,
  emptyMessage = "No tasks to display.",
}: {
  tasks: SimpleUserTaskRunDTO[];
  admin: boolean;
  claimable?: boolean;
  emptyMessage?: string;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedTask = tasks.find((task) => taskKey(task) === selectedKey);
  // A completed/claimed task may leave the current filtered list during polling.
  useEffect(() => {
    if (selectedKey && !selectedTask) setSelectedKey(null);
  }, [selectedKey, selectedTask]);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table aria-label="Tasks">
          <TableHeader>
            <TableRow className="border-border bg-muted/30">
              <TableHead className="pl-4">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const reference = `${task.wfRunId.slice(0, 8)}… / ${task.id}`;
              const userName = task.user
                ? task.user.valid === false
                  ? "Unavailable user"
                  : [task.user.firstName, task.user.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    task.user.username ||
                    task.user.email ||
                    task.user.id
                : "Unassigned";
              return (
                <TableRow key={taskKey(task)} className="border-border">
                  <TableCell className="pl-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(taskKey(task))}
                      className="block max-w-64 rounded text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      aria-label={`Open ${task.userTaskDefName} task ${reference}`}
                    >
                      <span className="block truncate">
                        {task.userTaskDefName}
                      </span>
                    </button>
                    <span className="mt-1 block whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {reference}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TaskStatus status={task.status} />
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-48 truncate" title={userName}>
                      {userName}
                    </span>
                    {task.user?.valid !== false && task.user?.email && (
                      <span
                        className="mt-1 block max-w-48 truncate text-xs text-muted-foreground"
                        title={task.user.email}
                      >
                        {task.user.email}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <span
                      className="block max-w-40 truncate"
                      title={task.userGroup?.name || task.userGroup?.id}
                    >
                      {task.userGroup
                        ? task.userGroup.valid === false
                          ? "Unavailable group"
                          : task.userGroup.name || task.userGroup.id
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <time
                      dateTime={task.scheduledTime}
                      title={new Date(task.scheduledTime).toLocaleString()}
                    >
                      {new Date(task.scheduledTime).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </time>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedKey(taskKey(task))}
                      aria-label={`View task ${reference}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {tasks.length === 0 && (
              <TableRow className="border-border">
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Sheet
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedKey(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto border-border p-6 sm:max-w-xl">
          {selectedTask && (
            <>
              <SheetHeader className="p-0 pr-7 text-left">
                <SheetTitle className="break-words text-xl">
                  {selectedTask.userTaskDefName}
                </SheetTitle>
                <SheetDescription>Task details</SheetDescription>
              </SheetHeader>
              <UserTask
                key={taskKey(selectedTask)}
                userTask={selectedTask}
                admin={admin}
                claimable={claimable}
                embedded
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
