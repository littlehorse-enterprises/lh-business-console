import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export function TaskStatus({ status }: { status: string }) {
  const styles = {
    ASSIGNED: {
      label: "In progress",
      icon: Clock,
      className:
        "border-warning/30 bg-warning/10 text-amber-900 dark:text-amber-200",
    },
    UNASSIGNED: {
      label: "Available",
      icon: AlertCircle,
      className:
        "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
    },
    DONE: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-success/30 bg-success/10 text-green-800 dark:text-green-200",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
  };
  const style = styles[status as keyof typeof styles];
  const Icon = style?.icon || AlertCircle;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 whitespace-nowrap font-normal ${style?.className || "text-muted-foreground"}`}
    >
      <Icon aria-hidden className="size-3" />
      {style?.label || status}
    </Badge>
  );
}
