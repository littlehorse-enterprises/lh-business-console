export type AdminView = "tasks" | "forms" | "users" | "groups";

export function getAdminView(params: {
  view?: string;
  tab?: string;
}): AdminView {
  if (["tasks", "forms", "users", "groups"].includes(params.view || "")) {
    return params.view as AdminView;
  }
  // Preserve links from the original admin dashboard.
  if (params.tab === "tasks") return "forms";
  if (params.tab === "users" || params.tab === "groups") return params.tab;
  return "tasks";
}
