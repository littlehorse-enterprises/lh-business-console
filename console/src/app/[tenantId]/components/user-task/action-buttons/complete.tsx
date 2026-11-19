"use client";

import {
  adminCompleteUserTask,
  adminGetUserTaskDetail,
  adminSaveUserTaskProgress,
} from "@/app/[tenantId]/actions/admin";
import {
  completeUserTask,
  getUserTaskDetail,
  saveUserTaskProgress,
} from "@/app/[tenantId]/actions/user";
import { ErrorResponse } from "@/lib/error-handling";
import { findStructDefinition, validateTaskOutput } from "@/lib/task-output";
import {
  Button,
  buttonVariants,
} from "@littlehorse-enterprises/ui-library/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@littlehorse-enterprises/ui-library/dialog";
import {
  type DetailedUserTaskRunDTO,
  type SimpleUserTaskRunDTO,
  type TaskVariableValue,
  UserTaskEventType,
} from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { ErrorHandler } from "../../error-handler";
import Loading from "../../loading";
import NotesTextArea from "../notes";
import { StructFields } from "../struct-fields";

export default function CompleteUserTaskButton({
  userTask,
  admin = false,
  readOnly = false,
}: {
  userTask: SimpleUserTaskRunDTO;
  admin?: boolean;
  readOnly?: boolean;
}) {
  const [details, setDetails] = useState<DetailedUserTaskRunDTO>();
  const [output, setOutput] = useState<TaskVariableValue>();
  const [error, setError] = useState<ErrorResponse>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const tenantId = useParams().tenantId as string;
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const params = { wf_run_id: userTask.wfRunId, user_task_guid: userTask.id };
  const disabled =
    readOnly || details?.status === "DONE" || details?.status === "CANCELLED";
  const saveEvents = (details?.events ?? [])
    .filter((event) => event.type === UserTaskEventType.TASK_SAVED)
    .sort((a, b) => a.time.localeCompare(b.time));

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError(undefined);
    setValidationErrors([]);
    const response = await (admin
      ? adminGetUserTaskDetail(tenantId, params)
      : getUserTaskDetail(tenantId, params));
    setLoading(false);
    if (response.error) {
      setError(response.error);
      return;
    }
    const task = response.data;
    setDetails(task);
    setOutput(
      task?.output ??
        (task?.resultStructDefId
          ? {
              struct: {
                structDefId: task.resultStructDefId,
                struct: { fields: {} },
              },
            }
          : undefined),
    );
  };

  const handleSubmit = async (saving: boolean) => {
    if (!details || disabled || submitting) return;
    if (details.resultStructDefId && output) {
      let errors: string[];
      try {
        errors = validateTaskOutput(
          output,
          findStructDefinition(details.resultStructDefId, details.structDefs),
          details.structDefs,
          saving,
        );
      } catch (cause) {
        errors = [
          cause instanceof Error
            ? cause.message
            : "Unable to load the form schema.",
        ];
      }
      setValidationErrors(errors);
      if (errors.length) return;
    }
    setSubmitting(true);
    const request = output ? { output } : {};
    const action = saving
      ? admin
        ? adminSaveUserTaskProgress
        : saveUserTaskProgress
      : admin
        ? adminCompleteUserTask
        : completeUserTask;
    const response = await action(tenantId, params, request);
    setSubmitting(false);
    if (response.error) {
      toast.error(response.error.message);
      return;
    }
    toast.success(saving ? "Draft saved" : "Task completed");
    if (saving) await fetchTaskDetails();
    else setOpen(false);
    await mutate((key) => Array.isArray(key) && key[1] === "userTask");
    router.refresh();
  };

  const renderForm = () => {
    if (loading) return <Loading />;
    if (error)
      return (
        <ErrorHandler
          error={error}
          onRetry={fetchTaskDetails}
          allowReturn={false}
          title="Unable to load task"
        />
      );
    if (!details) return null;
    if (!details.resultStructDefId)
      return (
        <p>
          {disabled
            ? "This task has no results."
            : "This task has no fields to complete."}
        </p>
      );
    try {
      const schema = findStructDefinition(
        details.resultStructDefId,
        details.structDefs,
      );
      return (
        <StructFields
          schema={schema}
          fields={output?.struct?.struct?.fields ?? {}}
          definitions={details.structDefs}
          readOnly={disabled || submitting}
          onChange={(fields) => {
            setOutput({
              struct: {
                structDefId: details.resultStructDefId,
                struct: { fields },
              },
            });
            setValidationErrors([]);
          }}
        />
      );
    } catch (cause) {
      return (
        <p role="alert">
          {cause instanceof Error ? cause.message : "Schema unavailable"}
        </p>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return;
        setOpen(next);
        if (next) void fetchTaskDetails();
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full">
          {readOnly ? "View Results" : "Complete"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Results for" : "Complete"} {userTask.userTaskDefName}
          </DialogTitle>
        </DialogHeader>
        {details?.notes && <NotesTextArea notes={details.notes} />}
        {renderForm()}
        {validationErrors.length > 0 && (
          <ul role="alert" className="list-disc pl-5 text-sm text-destructive">
            {validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        {!disabled && details?.resultStructDefId && (
          <p className="text-sm text-muted-foreground">
            * Required when completing. Saving replaces your draft. Defaults are
            applied when you complete the task.
          </p>
        )}
        {admin && saveEvents.length > 0 && (
          <details>
            <summary className="cursor-pointer text-sm">Save history</summary>
            <ul className="space-y-1 text-sm">
              {saveEvents.map((event, index) => (
                <li key={`${event.time}-${index}`}>
                  Saved by{" "}
                  {"userId" in event.event
                    ? event.event.userId
                    : "unknown user"}{" "}
                  at {new Date(event.time).toLocaleString()}
                </li>
              ))}
            </ul>
          </details>
        )}
        <DialogFooter>
          <DialogClose
            disabled={submitting}
            className={buttonVariants({ variant: "outline" })}
          >
            Close
          </DialogClose>
          {!disabled && !error && details && !loading && (
            <>
              {details.resultStructDefId && (
                <Button
                  variant="outline"
                  disabled={submitting}
                  onClick={() => void handleSubmit(true)}
                >
                  Save draft
                </Button>
              )}
              <Button
                disabled={submitting}
                onClick={() => void handleSubmit(false)}
              >
                {submitting ? "Submitting…" : "Complete"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
