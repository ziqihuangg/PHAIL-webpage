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
   ranking, then our own notes (related work, TODO). about.html and metrics.html
   only redirect; models.html has no tab. */
const pageLinks = [
  ["Scope", "index.html", "home"],
  ["Robotics Index", "ranking.html", "ranking"],
  ["CAD Index", "cad-index.html", "cad-index"],
  ["Ledger", "tasks.html", "tasks"],
  ["Charts", "charts.html", "charts"],
  ["GPT-6 Astra", "gpt-6-astra.html", "gpt-6-astra"],
  ["Benchmarks", "benchmarks.html", "benchmarks"],
  ["Related work", "related.html", "related"],
  ["TODO", "todo.html", "todo"]
];
const header = document.querySelector("header.site-header");

if (header) {
  const homeHref = pageKey === "home" ? "#top" : "index.html";
  header.outerHTML = `<header class="site-header" id="top"><div class="header-row">`
    + `<a class="site-name" href="${homeHref}" title="${siteConfig.fullName}"><img class="site-mark" src="physical-ai-mark.svg" alt="" /><span>${siteConfig.acronym}</span></a>`
    + `<nav aria-label="Primary navigation">${pageLinks.map(([label, href, key]) => `<a href="${href}"${pageKey === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav></div></header>`;
}

document.querySelectorAll("[data-personal-link]").forEach((element) => {
  element.href = siteConfig.personalSite;
});

document.title = pageKey === "home" ? `${siteConfig.name} - ${siteConfig.fullName}` : document.title;
