export type LoginTheme = "light" | "dark" | "system";

export function readLoginTheme(value: unknown): LoginTheme {
  return value === "dark" || value === "system" ? value : "light";
}

export function localCallback(value: string, origin: string): string {
  try {
    const url = new URL(value, origin);
    return url.origin === origin ? url.pathname + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}

export function loginThemeOptions(
  callbackUrl: string,
  preference: unknown,
): {
  redirectTo: string;
  authorization: Record<string, string>;
} {
  const theme = readLoginTheme(preference);
  if (process.env.LHUT_KEYCLOAK_THEME_SYNC !== "true") {
    return { redirectTo: callbackUrl, authorization: { lh_theme: theme } };
  }
  const sync = crypto.randomUUID();
  return {
    redirectTo: `/login/theme?${new URLSearchParams({ callbackUrl, theme, sync })}`,
    authorization: { lh_theme: theme, lh_theme_sync: sync },
  };
}
