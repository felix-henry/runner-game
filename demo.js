(() => {
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    document.documentElement.dataset.theme = scheme.matches ? "dark" : "light";
    window.dispatchEvent(new Event("themechange"));
  };
  update();
  scheme.addEventListener("change", update);
})();
