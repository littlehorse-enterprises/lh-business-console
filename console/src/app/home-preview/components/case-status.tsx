import { cn } from "@/lib/utils";
import { Badge } from "@littlehorse-enterprises/ui-library/badge";
import { AlertTriangle, CircleDot, Clock } from "lucide-react";
import type { BusinessCase } from "../data";
import { semanticColors } from "./semantic-colors";

export function CaseStatus({ item }: { item: BusinessCase }) {
  const overdue = item.attention && item.due.includes("overdue");
  const tone = overdue ? "danger" : item.attention ? "warning" : "info";
  const Icon = overdue ? AlertTriangle : item.attention ? Clock : CircleDot;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 whitespace-nowrap font-normal",
        semanticColors[tone].badge,
      )}
    >
      <Icon aria-hidden className="size-3" />
      {overdue ? "Overdue" : item.attention ? "Needs attention" : "In progress"}
    </Badge>
  );
}
