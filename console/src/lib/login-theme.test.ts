import assert from "node:assert/strict";
import { test } from "node:test";
import {
  localCallback,
  loginThemeOptions,
  readLoginTheme,
} from "./login-theme";

test("theme handoff keeps the explicit mode, including System, and rejects unsupported modes", () => {
  for (const mode of ["light", "dark", "system"] as const) {
    assert.equal(readLoginTheme(mode), mode);
  }
  for (const mode of [null, undefined, "auto", "<script>"]) {
    assert.equal(readLoginTheme(mode), "light");
  }
});

test("login completion preserves local destinations and rejects external redirect targets", () => {
  const origin = "https://console.example.com";
  assert.equal(
    localCallback("/default/admin?view=forms#list", origin),
    "/default/admin?view=forms#list",
  );
  assert.equal(localCallback(`${origin}/default`, origin), "/default");
  for (const callback of [
    "https://other.example/default",
    "//other.example/default",
    "javascript:alert(1)",
  ]) {
    assert.equal(localCallback(callback, origin), "/");
  }
});

test("installed-theme handoff gives each login a distinct transaction and retains the destination", () => {
  const previous = process.env.LHUT_KEYCLOAK_THEME_SYNC;
  try {
    process.env.LHUT_KEYCLOAK_THEME_SYNC = "true";
    const first = loginThemeOptions("/default/admin?view=forms", "system");
    const second = loginThemeOptions("/default", "dark");
    const target = new URL(first.redirectTo, "https://console.example.com");
    assert.equal(target.pathname, "/login/theme");
    assert.equal(
      target.searchParams.get("callbackUrl"),
      "/default/admin?view=forms",
    );
    assert.equal(
      target.searchParams.get("sync"),
      first.authorization.lh_theme_sync,
    );
    assert.equal(first.authorization.lh_theme, "system");
    assert.notEqual(
      first.authorization.lh_theme_sync,
      second.authorization.lh_theme_sync,
    );
    delete process.env.LHUT_KEYCLOAK_THEME_SYNC;
    assert.deepEqual(loginThemeOptions("/default", "dark"), {
      redirectTo: "/default",
      authorization: { lh_theme: "dark" },
    });
  } finally {
    if (previous === undefined) delete process.env.LHUT_KEYCLOAK_THEME_SYNC;
    else process.env.LHUT_KEYCLOAK_THEME_SYNC = previous;
  }
});
