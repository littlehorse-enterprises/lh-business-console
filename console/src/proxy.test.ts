import assert from "node:assert/strict";
import { test } from "node:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "./proxy";

test("the fixture preview is public while tenant and similar paths retain auth", () => {
  for (const url of [
    "/home-preview",
    "/home-preview/",
    "/home-preview?view=overview",
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), false, url);
  }
  for (const url of [
    "/",
    "/acme",
    "/acme/admin",
    "/acme/home-preview",
    "/home-preview/admin",
    "/home-preview-extra",
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), true, url);
  }
});
