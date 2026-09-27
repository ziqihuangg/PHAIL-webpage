const siteConfig = {
  name: "PhAIL Notes",
  acronym: "PhAIL",
  fullName: "Physical AI Ledger",
  personalSite: "https://ziqihuangg.github.io/"
};

const path = window.location.pathname.split("/").pop() || "index.html";
const pageKey = path === "index.html" ? "home" : path.replace(".html", "");
/* Left to right: what physical AI is (Scope, which also carries what used to be
   About), how models rank across boards, then the evidence behind the ranking.
   Metrics and Models have no tabs of their own: the metric glossary sits under
   Benchmarks, and models are compared on Ranking. about.html and metrics.html
   only redirect now. */
const pageLinks = [
  ["Scope", "index.html", "home"],
  ["Ranking", "ranking.html", "ranking"],
  ["Ledger", "tasks.html", "tasks"],
  ["Charts", "charts.html", "charts"],
  ["GPT-6 Astra", "gpt-6-astra.html", "gpt-6-astra"],
  ["Benchmarks", "benchmarks.html", "benchmarks"]
];
const header = document.querySelector("header.site-header");

if (header) {
  const homeHref = pageKey === "home" ? "#top" : "index.html";
  /* One deck line per page. A lookup rather than a ternary chain, because the
     chain stopped being readable at four pages. */
  const decks = {
    home: `<p class="site-deck dashboard-deck">What physical AI is, which boards measure it, how models rank across them - and who produced every number.</p>`,
    benchmarks: `<p class="site-deck">What each benchmark measures, and what its metric can and cannot tell you.</p>`
  };
  const pageDescription = decks[pageKey] || "";
  header.outerHTML = `<header class="site-header" id="top"><div class="header-row"><a class="site-name" href="${homeHref}"><span>${siteConfig.acronym}</span><img class="site-mark" src="physical-ai-mark.svg" alt="" /></a><nav aria-label="Primary navigation">${pageLinks.map(([label, href, key]) => `<a href="${href}"${pageKey === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav></div><p class="site-expansion">${siteConfig.fullName}</p><p class="site-wordplay">Pronounced like “fail” - because honest evaluation starts with what breaks.</p>${pageDescription}</header>`;
}

document.querySelectorAll("[data-personal-link]").forEach((element) => {
  element.href = siteConfig.personalSite;
});

document.title = pageKey === "home" ? `${siteConfig.name} - ${siteConfig.fullName}` : document.title;