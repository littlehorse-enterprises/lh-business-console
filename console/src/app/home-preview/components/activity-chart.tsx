import { Card } from "@littlehorse-enterprises/ui-library/card";

export function ActivityChart({
  values,
  completed,
  period,
}: {
  values: number[];
  completed: number;
  period: string;
}) {
  const labels =
    period === "7"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["1–4", "5–8", "9–12", "13–16", "17–20", "21–24", "25–30"];
  return (
    <Card className="gap-0 rounded-lg border-border py-0 shadow-none">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">Completed Processes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {completed.toLocaleString()} in the last {period} days
        </p>
      </div>
      <div className="px-5 pt-8 pb-5">
        <div
          className="flex h-40 items-end gap-3 border-b border-border"
          role="img"
          aria-label={`${completed} completed processes. ${values.map((value, index) => `${labels[index]}: ${value}`).join(", ")}`}
        >
          {values.map((value, index) => (
            <div
              key={index}
              className="relative flex h-full min-w-0 flex-1 items-end justify-center"
            >
              <div
                className="relative w-full max-w-10 rounded-t-sm bg-success/80"
                style={{ height: `${(value / Math.max(...values)) * 100}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs tabular-nums text-muted-foreground">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-3 text-center text-xs text-muted-foreground">
          {labels.map((label) => (
            <span key={label} className="min-w-0 flex-1">
              {label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
