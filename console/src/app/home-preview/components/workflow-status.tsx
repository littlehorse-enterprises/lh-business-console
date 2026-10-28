import { cn } from "@/lib/utils";
import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { Check, CircleDot } from "lucide-react";
import { orderStatuses, type OrderStatus } from "../data";
import { semanticColors } from "./semantic-colors";

export function WorkflowStatus({ status }: { status: OrderStatus }) {
  const delivered = status === "DELIVERED";
  const Icon = delivered ? Check : CircleDot;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 whitespace-nowrap font-normal",
        semanticColors[delivered ? "success" : "info"].badge,
      )}
    >
      <Icon aria-hidden className="size-3" />
      {orderStatuses.find((item) => item.value === status)!.label}
    </Badge>
  );
}
