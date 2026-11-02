import assert from "node:assert/strict";
import { test } from "node:test";
import { UserTaskStatus } from "@littlehorse-enterprises/user-tasks-bridge-api-client";
import { getAdminView } from "./console-navigation";
import {
  readTaskFilters,
  readAvailableTaskFilters,
  updateTaskFilters,
} from "./task-filters";

test("available-task filters retain dates without inheriting an assigned-task status or group", () => {
  const params = new URLSearchParams({
    status: "DONE",
    user_group_id: "another-group",
    earliest_start_date: "2026-10-28T00:00:00.000Z",
    latest_start_date: "2026-11-03T00:00:00.000Z",
  });
  assert.deepEqual(readAvailableTaskFilters(params), {
    earliest_start_date: "2026-10-28T00:00:00.000Z",
    latest_start_date: "2026-11-03T00:00:00.000Z",
  });
});

test("the new task landing and legacy dashboard links resolve to their intended views", () => {
  assert.equal(getAdminView({}), "tasks");
  assert.equal(getAdminView({ view: "forms" }), "forms");
  assert.equal(getAdminView({ view: "unknown" }), "tasks");
  assert.equal(getAdminView({ tab: "tasks" }), "forms");
  assert.equal(getAdminView({ tab: "users" }), "users");
  assert.equal(getAdminView({ tab: "groups" }), "groups");
  assert.equal(getAdminView({ view: "tasks", tab: "users" }), "tasks");
});

test("task filters preserve sidebar navigation without sending navigation parameters to the API", () => {
  const original = new URLSearchParams(
    "view=tasks&status=ASSIGNED&user_group_id=shipping",
  );
  assert.deepEqual(readTaskFilters(original), {
    status: "ASSIGNED",
    user_group_id: "shipping",
  });
  const updated = updateTaskFilters(original, { status: UserTaskStatus.DONE });
  assert.equal(updated.get("view"), "tasks");
  assert.equal(updated.get("status"), "DONE");
  assert.equal(updated.has("user_group_id"), false);
  assert.equal(updateTaskFilters(updated, {}).toString(), "view=tasks");
  assert.equal(original.get("user_group_id"), "shipping");
});
