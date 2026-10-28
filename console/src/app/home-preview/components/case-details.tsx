import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { Button } from "@littlehorse-enterprises/ui-library/button";
import { Label } from "@littlehorse-enterprises/ui-library/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@littlehorse-enterprises/ui-library/sheet";
import { Textarea } from "@littlehorse-enterprises/ui-library/textarea";
import { Check, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { processes, type BusinessCase } from "../data";
import { PreviewSelect } from "./preview-select";

export type ReviewEvent = { action: string; note: string };

export function CaseDetails({
  item,
  onClose,
  onReview,
  history,
  advanced,
}: {
  item: BusinessCase | null;
  onClose: () => void;
  onReview: (item: BusinessCase, decision: string, note: string) => void;
  history: ReviewEvent[];
  advanced: boolean;
}) {
  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto border-border sm:max-w-xl">
        {item && (
          <CaseContent
            key={item.id}
            item={item}
            onReview={onReview}
            history={history}
            advanced={advanced}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function CaseContent({
  item,
  onReview,
  history,
  advanced,
}: {
  item: BusinessCase;
  onReview: (item: BusinessCase, decision: string, note: string) => void;
  history: ReviewEvent[];
  advanced: boolean;
}) {
  const process = processes.find((process) => process.id === item.processId)!;
  const [decision, setDecision] = useState("approve");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const details = [
    ["Case reference", item.id],
    ["Customer / request", item.name],
    ["Responsible person", item.owner],
    ["Due", item.attention ? item.due : "—"],
  ];
  return (
    <div className="space-y-6">
      <SheetHeader className="pr-7 text-left">
        <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
        <SheetTitle className="text-xl">{item.name}</SheetTitle>
        <SheetDescription>{process.name}</SheetDescription>
      </SheetHeader>
      <Badge
        variant="outline"
        className={
          item.attention
            ? "border-primary/40 bg-primary/10"
            : "text-muted-foreground"
        }
      >
        {item.attention ? "Needs attention" : "In progress"}
      </Badge>
      <section aria-label="Process stages">
        <h3 className="mb-4 text-sm font-semibold">Process Stages</h3>
        <ol>
          {process.stages.map((stage, index) => (
            <li
              key={stage}
              className="relative flex items-start gap-3 pb-5 last:pb-0"
            >
              <span
                className={cn(
                  "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                  index < item.stage
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === item.stage
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {index < item.stage ? <Check className="size-4" /> : index + 1}
              </span>
              {index < process.stages.length - 1 && (
                <span className="absolute top-7 bottom-0 left-3.5 border-l border-border" />
              )}
              <div className="pt-0.5">
                <p
                  className={cn(
                    "text-sm",
                    index === item.stage && "font-semibold",
                    index > item.stage && "text-muted-foreground",
                  )}
                >
                  {stage}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {index < item.stage
                    ? "Completed"
                    : index === item.stage
                      ? item.reason
                      : "Pending"}
                </p>
              </div>
              {index === item.stage && (
                <Badge variant="secondary" className="ml-auto font-normal">
                  Current
                </Badge>
              )}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold">Business Details</h3>
        <dl className="divide-y divide-border rounded-md border border-border">
          {details.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 px-4 py-3 text-sm"
            >
              <dt className="shrink-0 text-muted-foreground">{label}</dt>
              <dd className="text-right break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {item.mine && item.attention && (
        <form
          className="space-y-4 rounded-lg border border-border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!note.trim()) {
              setNoteError(true);
              return;
            }
            onReview(item, decision, note.trim());
          }}
        >
          <h3 className="text-sm font-semibold">Assigned Review</h3>
          <div className="space-y-2">
            <Label>Decision</Label>
            <PreviewSelect
              label="Decision"
              value={decision}
              onChange={setDecision}
              options={[
                { value: "approve", label: "Approve and continue" },
                { value: "request-changes", label: "Request changes" },
              ]}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-note">Review note</Label>
            <Textarea
              id="review-note"
              required
              maxLength={500}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteError(false);
              }}
              aria-invalid={noteError}
              aria-describedby={noteError ? "review-note-error" : undefined}
              placeholder="Add a review note"
            />
            {noteError && (
              <p id="review-note-error" className="text-sm text-destructive">
                Enter a review note.
              </p>
            )}
          </div>
          <Button type="submit">
            {decision === "approve" ? "Complete task" : "Request changes"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Sample action. No workflow is changed.
          </p>
        </form>
      )}
      <section>
        <h3 className="mb-4 text-sm font-semibold">Activity</h3>
        <div className="space-y-4">
          {history.map((event, index) => (
            <div key={index} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm">{event.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.note}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm">
                {process.stages[Math.max(item.stage - (advanced ? 1 : 0), 0)]}{" "}
                started
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Oct 26, 2026 · 9:42 AM
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm">Process started</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Oct 25, 2026 · 2:18 PM
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
