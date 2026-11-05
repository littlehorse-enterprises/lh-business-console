import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export function TaskStatus({ status }: { status: string }) {
  const styles = {
    ASSIGNED: {
      label: "In progress",
      icon: Clock,
      className: "border-warning/30 bg-warning/10 text-warning-strong",
    },
    UNASSIGNED: {
      label: "Available",
      icon: AlertCircle,
      className: "border-info-fg/30 bg-tint-blue-bg text-info-fg",
    },
    DONE: {
      label: "Completed",
      icon: CheckCircle2,
      className: "border-success/30 bg-success/10 text-success-strong",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "border-border bg-muted text-muted-strong",
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
