// Reuse these roles across summaries, tables, charts, and the case tracker.
// Amber primary controls remain the LittleHorse brand/selection color.
export const semanticColors = {
  info: {
    surface:
      "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/25",
    badge:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
    text: "text-blue-700 dark:text-blue-300",
    icon: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  warning: {
    surface: "border-warning/30 bg-warning/10",
    badge: "border-warning/30 bg-warning/10 text-amber-900 dark:text-amber-200",
    text: "text-amber-900 dark:text-amber-200",
    icon: "bg-warning/15 text-amber-900 dark:text-amber-200",
  },
  success: {
    surface: "border-success/25 bg-success/10",
    badge: "border-success/30 bg-success/10 text-green-800 dark:text-green-200",
    text: "text-green-800 dark:text-green-200",
    icon: "bg-success/15 text-green-800 dark:text-green-200",
  },
  danger: {
    surface: "border-destructive/30 bg-destructive/5",
    badge:
      "border-destructive/30 bg-destructive/10 text-red-800 dark:text-red-200",
    text: "text-red-700 dark:text-red-300",
    icon: "bg-destructive/10 text-red-700 dark:text-red-300",
  },
} as const;
