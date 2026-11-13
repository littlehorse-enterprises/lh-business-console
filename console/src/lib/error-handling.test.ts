import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ErrorType,
  isJsonContentType,
  withErrorHandling,
} from "./error-handling";

test("isJsonContentType accepts application/json and +json suffixes", () => {
  assert.equal(isJsonContentType("application/json"), true);
  assert.equal(isJsonContentType("application/json; charset=utf-8"), true);
  assert.equal(isJsonContentType("application/problem+json"), true);
  assert.equal(
    isJsonContentType("Application/Problem+JSON;charset=UTF-8"),
    true,
  );
});

test("isJsonContentType rejects other and missing content types", () => {
  assert.equal(isJsonContentType("text/plain"), false);
  assert.equal(isJsonContentType("text/html; charset=utf-8"), false);
  assert.equal(isJsonContentType("application/jsonl"), false);
  assert.equal(isJsonContentType(""), false);
  assert.equal(isJsonContentType(null), false);
  assert.equal(isJsonContentType(undefined), false);
});

test("a 403 problem+json response surfaces its detail as the message", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(console, "log", () => {});
  const problem = {
    detail: "Claim the task before submitting its output",
    instance: "/default/tasks/wf-run/0-1/result",
    status: 403,
    title: "Forbidden",
  };
  const result = await withErrorHandling(async () => {
    throw new Response(JSON.stringify(problem), {
      status: 403,
      headers: { "content-type": "application/problem+json" },
    });
  });
  assert.equal(result.data, undefined);
  assert.equal(result.error?.type, ErrorType.FORBIDDEN);
  assert.equal(result.error?.statusCode, 403);
  assert.equal(
    result.error?.message,
    "Claim the task before submitting its output",
  );
  assert.deepEqual(result.error?.details, problem);
});

test("a problem+json response without a detail falls back to its title", async (t) => {
  t.mock.method(console, "error", () => {});
  t.mock.method(console, "log", () => {});
  const result = await withErrorHandling(async () => {
    throw new Response(JSON.stringify({ status: 403, title: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/problem+json" },
    });
  });
  assert.equal(result.error?.type, ErrorType.FORBIDDEN);
  assert.equal(result.error?.message, "Forbidden");
});
