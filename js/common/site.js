const siteConfig = {
  name: "PhAIL",
  acronym: "PhAIL",
  fullName: "Physical AI Ledger",
  personalSite: "https://ziqihuangg.github.io/"
};

const path = window.location.pathname.split("/").pop() || "index.html";
const pageKey = path === "index.html" ? "home" : path.replace(".html", "");

/* The ONLY place the tabs are defined. Every page ships an empty
   <header class="site-header"> and this fills it, so adding or reordering a tab
   is one edit here - no page carries its own copy of the nav to go stale.
   Left to right: what physical AI is, how models rank, the evidence behind the
   ranking. Everything else sits under one "Internal Work in Progress" menu.
   about.html and metrics.html only redirect; models.html has no tab. */
/* [label, file, page key, ready?] - a tab that is not ready yet still opens,
   but carries a small "Not ready" mark so no one reads it as finished. */
const pageLinks = [
  ["Scope", "index.html", "home", true],
  ["Robotics Index", "robotics-index.html", "robotics-index", true],
  ["Ledger", "tasks.html", "tasks", true]
];
const internalLinks = [
  ["Mobile Manipulation Platforms", "benchmark-landscape.html", "benchmark-landscape", true],
  ["CAD Index", "cad-index.html", "cad-index", false],
  ["Charts", "charts.html", "charts", false],
  ["GPT-6 Astra", "gpt-6-astra.html", "gpt-6-astra", false],
  ["Related work", "related.html", "related", false],
  ["TODO", "todo.html", "todo", true],
  ["Checks", "check.html", "check", true]
];
/* every tab, for check.html (it scans each page and knows which are not ready) */
window.phailPages = pageLinks.concat(internalLinks).map(([label, file, key, ready]) => ({ label: label, file: file, key: key, ready: ready }));
const header = document.querySelector("header.site-header");

if (header) {
  const homeHref = pageKey === "home" ? "#top" : "index.html";
  const tab = ([label, href, key, ready]) => `<a href="${href}"${pageKey === key ? ' aria-current="page"' : ""}${ready ? "" : ' class="tab-not-ready" title="Not ready yet"'}>${label}${ready ? "" : '<span class="tab-flag">Not ready</span>'}</a>`;
  const internalCurrent = internalLinks.some(([, , key]) => key === pageKey);
  header.outerHTML = `<header class="site-header" id="top"><div class="header-row">`
    + `<a class="site-name" href="${homeHref}" title="${siteConfig.fullName}"><img class="site-mark" src="assets/physical-ai-mark.svg" alt="" /><span>${siteConfig.acronym}</span></a>`
    + `<nav aria-label="Primary navigation">${pageLinks.map(tab).join("")}`
    + `<div class="nav-more${internalCurrent ? " is-current" : ""}">`
    + `<button type="button" class="nav-more-button" aria-expanded="false" aria-controls="nav-internal">Internal Work in Progress</button>`
    + `<div class="nav-menu" id="nav-internal">${internalLinks.map(tab).join("")}</div></div></nav></div></header>`;
}

/* The internal menu: a mouse opens it on hover; a tap or Enter toggles it;
   Escape, a click elsewhere or tabbing out closes it. */
const navMore = document.querySelector(".nav-more");
if (navMore) {
  const button = navMore.querySelector(".nav-more-button");
  const setOpen = (open) => {
    navMore.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  };
  navMore.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") setOpen(true); });
  navMore.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") setOpen(false); });
  /* a mouse click on the button keeps the hover-opened menu open instead of closing it */
  button.addEventListener("click", (event) => setOpen(event.pointerType === "mouse" || !navMore.classList.contains("is-open")));
  navMore.addEventListener("focusout", (event) => { if (!navMore.contains(event.relatedTarget)) setOpen(false); });
  navMore.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMore.classList.contains("is-open")) { setOpen(false); button.focus(); }
  });
  document.addEventListener("click", (event) => { if (!navMore.contains(event.target)) setOpen(false); });
}

document.querySelectorAll("[data-personal-link]").forEach((element) => {
  element.href = siteConfig.personalSite;
});

document.title = pageKey === "home" ? `${siteConfig.name} - ${siteConfig.fullName}` : document.title;
