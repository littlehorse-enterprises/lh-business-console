(() => {
  const params = new URLSearchParams(location.hash.slice(1));
  const key = "lh-theme-login:" + params.get("sync");
  const isTheme = (value) => ["light", "dark", "system"].includes(value);
  try {
    const target = new URL(params.get("returnTo"));
    const record = JSON.parse(sessionStorage.getItem(key) || "null");
    const source =
      record?.origin ||
      (document.referrer && new URL(document.referrer).origin);
    if (
      !source ||
      target.origin !== source ||
      target.pathname !== "/login/theme" ||
      !["http:", "https:"].includes(target.protocol)
    )
      return;
    const stored = localStorage.getItem("theme");
    const incoming = params.get("theme");
    const theme =
      record && isTheme(stored)
        ? stored
        : isTheme(incoming)
          ? incoming
          : "light";
    document.documentElement.style.colorScheme =
      theme === "system" ? "light dark" : theme;
    target.hash = new URLSearchParams({ theme }).toString();
    sessionStorage.removeItem(key);
    location.replace(target.href);
  } catch {
    history.back();
  }
})();
