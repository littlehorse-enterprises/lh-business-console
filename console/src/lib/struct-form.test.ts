import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StructFields } from "../app/[tenantId]/components/user-task/struct-fields";
import { LHUTBApiClient } from "@littlehorse-enterprises/user-tasks-bridge-api-client";

test("completed form preserves int64 display and hides masked values", () => {
  const html = renderToStaticMarkup(
    createElement(StructFields, {
      schema: {
        fields: {
          count: { fieldType: { primitiveType: "INT" } },
          secret: { fieldType: { primitiveType: "STR", masked: true } },
          note: { fieldType: { primitiveType: "STR" }, isNullable: true },
        },
      },
      fields: {
        count: { value: { int: "9223372036854775807" } },
        secret: { value: { str: "do-not-render-this" }, masked: true },
        note: { value: {} },
      },
      definitions: [],
      readOnly: true,
      onChange() {},
    }),
  );
  assert.match(html, /9223372036854775807/);
  assert.match(html, /Hidden value/);
  assert.match(html, /Null/);
  assert.doesNotMatch(html, /do-not-render-this/);
});

test("editable form offers omission, explicit null, defaults and collection controls", () => {
  const html = renderToStaticMarkup(
    createElement(StructFields, {
      schema: {
        fields: {
          note: { fieldType: { primitiveType: "STR" }, isNullable: true },
          approved: {
            fieldType: { primitiveType: "BOOL" },
            defaultValue: { bool: false },
          },
          items: {
            fieldType: {
              inlineArrayDef: { arrayType: { primitiveType: "STR" } },
            },
          },
        },
      },
      fields: { items: { value: { array: { items: [] } } } },
      definitions: [],
      readOnly: false,
      onChange() {},
    }),
  );
  assert.match(html, /Not provided/);
  assert.match(html, /Null/);
  assert.match(html, /Use default when completing/);
  assert.match(html, /Add item/);
});

test("user and admin clients send output envelopes to completion and progress routes", async (context) => {
  const requests: { url: string; init?: RequestInit }[] = [];
  context.mock.method(
    globalThis,
    "fetch",
    async (url: string, init?: RequestInit) => {
      requests.push({ url, init });
      return new Response(null, { status: 204 });
    },
  );
  const client = new LHUTBApiClient({
    baseUrl: "https://example.test",
    tenantId: "tenant",
    accessToken: "test",
  });
  const params = { wf_run_id: "run", user_task_guid: "task" };
  const body = {
    output: {
      struct: {
        struct: { fields: { count: { value: { int: "9007199254740993" } } } },
      },
    },
  };
  await client.user.completeUserTask(params, body);
  await client.user.saveUserTaskProgress(params, body);
  await client.admin.completeUserTask(params, body);
  await client.admin.saveUserTaskProgress(params, body);
  assert.deepEqual(
    requests.map(({ url }) => url),
    [
      "https://example.test/tenant/tasks/run/task/result",
      "https://example.test/tenant/tasks/run/task/progress",
      "https://example.test/tenant/admin/tasks/run/task/result",
      "https://example.test/tenant/admin/tasks/run/task/progress",
    ],
  );
  for (const { init } of requests) {
    assert.equal(init?.method, "POST");
    assert.equal(init?.body, JSON.stringify(body));
  }
});
