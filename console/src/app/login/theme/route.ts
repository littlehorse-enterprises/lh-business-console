import { localCallback, readLoginTheme } from "@/lib/login-theme";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callback = localCallback(
    url.searchParams.get("callbackUrl") || "/",
    url.origin,
  );
  const theme = readLoginTheme(url.searchParams.get("theme"));
  const complete = url.searchParams.get("complete") === "true";
  let bridge: string | undefined;
  if (!complete && process.env.LHUT_KEYCLOAK_THEME_SYNC === "true") {
    const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
    if (issuer) {
      try {
        // Keycloak versions its static resource URLs; discover the current prefix from its public account shell.
        const response = await fetch(`${issuer.replace(/\/$/, "")}/account/`, {
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        const shell = response.ok ? await response.text() : "";
        const prefix = shell.match(
          /["']([^"']*\/resources\/[a-zA-Z0-9_-]+\/)/,
        )?.[1];
        if (prefix) {
          const target = new URL(
            "login/littlehorse/theme-sync.html",
            new URL(prefix, issuer),
          );
          if (target.origin !== new URL(issuer).origin)
            throw new Error("Unexpected theme resource origin");
          const installed = await fetch(target, {
            method: "HEAD",
            cache: "no-store",
            signal: AbortSignal.timeout(3000),
          });
          if (installed.ok) {
            url.searchParams.set("complete", "true");
            target.hash = new URLSearchParams({
              returnTo: url.href,
              sync: url.searchParams.get("sync") || "",
              theme,
            }).toString();
            bridge = target.href;
          }
        }
      } catch {
        // Appearance sync must not prevent a completed login from opening the console.
      }
    }
  }
  const config = JSON.stringify({
    callback,
    theme,
    complete,
    bridge,
  }).replaceAll("<", "\\u003c");
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signing in | LittleHorse</title><script>
    const config = ${config};
    const value = config.complete ? new URLSearchParams(location.hash.slice(1)).get('theme') : config.theme;
    const theme = ['light', 'dark', 'system'].includes(value) ? value : config.theme;
    try { localStorage.setItem('theme', theme); } catch {}
    const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.documentElement.style.backgroundColor = dark ? '#0c0a09' : '#fff';
    location.replace(config.bridge || config.callback);
  </script></head><body><noscript>Enable JavaScript to finish signing in.</noscript></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "origin",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  );
}
