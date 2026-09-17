/* Portfolio — Moncef Ghellai
   Comportements communs : thème clair/sombre, année du footer. */

(function () {
  "use strict";

  /* ---------- Thème ---------- */
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("mg-theme", theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", theme === "light" ? "#F4F6FB" : "#070B12");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }

  /* ---------- Année courante ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
