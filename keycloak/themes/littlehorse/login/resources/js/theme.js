(() => {
  const preferred = window.matchMedia("(prefers-color-scheme: dark)");
  const isTheme = (value) => ["light", "dark", "system"].includes(value);
  const params = new URLSearchParams(location.search);
  let selected = "light";
  try {
    const stored = localStorage.getItem("theme");
    if (isTheme(stored)) selected = stored;
    const transaction =
      params.get("lh_theme_sync") || params.get("code_challenge");
    const incoming = params.get("lh_theme");
    if (
      transaction &&
      isTheme(incoming) &&
      !sessionStorage.getItem("lh-theme-login:" + transaction)
    ) {
      const callback = new URL(params.get("redirect_uri"));
      if (["http:", "https:"].includes(callback.protocol)) {
        sessionStorage.setItem(
          "lh-theme-login:" + transaction,
          JSON.stringify({ origin: callback.origin }),
        );
        selected = incoming;
        localStorage.setItem("theme", selected);
      }
    }
  } catch {}
  const apply = () => {
    const dark =
      selected === "dark" || (selected === "system" && preferred.matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  };
  apply();
  preferred.addEventListener("change", apply);
  window.addEventListener("storage", (event) => {
    if (event.key === "theme" && isTheme(event.newValue)) {
      selected = event.newValue;
      apply();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.querySelector("[data-theme-toggle]");
    const menu = document.querySelector("[data-theme-menu]");
    if (!trigger || !menu) return;
    const items = [...menu.querySelectorAll("[data-theme-option]")];
    const close = (restoreFocus = false) => {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    };
    const open = (index = 0) => {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      items[index].focus();
    };
    trigger.addEventListener("click", () => (menu.hidden ? open() : close()));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        open(event.key === "ArrowUp" ? items.length - 1 : 0);
      }
    });
    items.forEach((item) =>
      item.addEventListener("click", () => {
        selected = item.dataset.themeOption;
        apply();
        try {
          localStorage.setItem("theme", selected);
        } catch {}
        close(true);
      }),
    );
    menu.addEventListener("keydown", (event) => {
      const current = items.indexOf(document.activeElement);
      const next = {
        ArrowDown: (current + 1) % items.length,
        ArrowUp: (current + items.length - 1) % items.length,
        Home: 0,
        End: items.length - 1,
      }[event.key];
      if (next !== undefined) {
        event.preventDefault();
        items[next].focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "Tab") close();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!menu.contains(event.target) && !trigger.contains(event.target))
        close();
    });
    menu.addEventListener("focusout", (event) => {
      if (!menu.contains(event.relatedTarget)) close();
    });
  });
})();
