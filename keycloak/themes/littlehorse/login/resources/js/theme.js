(() => {
  const preferred = window.matchMedia("(prefers-color-scheme: dark)");
  let selected;
  try {
    selected = localStorage.getItem("littlehorse-theme");
  } catch {}
  const apply = (dark) => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  };
  apply(selected ? selected === "dark" : preferred.matches);
  preferred.addEventListener("change", (event) => {
    if (!selected) apply(event.matches);
  });
  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelector("[data-theme-toggle]")
      ?.addEventListener("click", () => {
        selected = document.documentElement.classList.contains("dark")
          ? "light"
          : "dark";
        apply(selected === "dark");
        try {
          localStorage.setItem("littlehorse-theme", selected);
        } catch {}
      });
  });
})();
