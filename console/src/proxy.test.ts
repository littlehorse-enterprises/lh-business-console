import assert from "node:assert/strict";
import { test } from "node:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "./proxy";

test("login and the fixture preview are public while tenant and similar paths retain auth", () => {
  for (const url of [
    "/login",
    "/login?callbackUrl=/default",
    "/login/",
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
    "/login-extra",
    "/acme/login",
  ]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), true, url);
  }
});
