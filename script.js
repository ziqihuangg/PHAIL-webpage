const siteConfig = {
  name: "PhAIL Notes",
  acronym: "PhAIL",
  fullName: "Physical AI Ledger",
  personalSite: "https://ziqihuangg.github.io/"
};

const path = window.location.pathname.split("/").pop() || "index.html";
const pageKey = path === "index.html" ? "home" : path.replace(".html", "");
/* Metrics and Models no longer have tabs of their own: the metrics table now
   sits under Benchmarks, which is where the question "what does this number
   mean" actually gets asked, and the model specs are a slice of the ledger. */
const pageLinks = [
  ["Ledger", "tasks.html", "tasks"],
  ["Charts", "charts.html", "charts"],
  ["GPT-6 Astra", "gpt-6-astra.html", "gpt-6-astra"],
  ["Benchmarks", "benchmarks.html", "benchmarks"],
  ["About", "about.html", "about"]
];
const header = document.querySelector("header.site-header");

if (header) {
  const homeHref = pageKey === "home" ? "#top" : "index.html";
  /* One deck line per page. A lookup rather than a ternary chain, because the
     chain stopped being readable at four pages. */
  const decks = {
    home: `<p class="site-deck dashboard-deck">We map physical AI tasks, metrics, models, and benchmarks - and record who produced every number.</p><p class="header-link"><a href="tasks.html">Browse the ledger <span aria-hidden="true">-&gt;</span></a> <a href="charts.html">See the charts <span aria-hidden="true">-&gt;</span></a> <a href="about.html">About this project <span aria-hidden="true">-&gt;</span></a></p>`,
    about: `<p class="site-deck">A research notebook, not a company.</p>`,
    tasks: `<p class="site-deck">Simulation and real hardware are kept apart, because nobody has shown that one predicts the other.</p>`,
    charts: `<p class="site-deck">One chart per benchmark, named after the group that ran it. Nothing averaged across boards.</p>`,
    benchmarks: `<p class="site-deck">What each benchmark measures, and what its metric can and cannot tell you.</p>`,
    "gpt-6-astra": `<p class="site-deck">Six groups, one model, and the four questions they answer differently.</p>`
  };
  const pageDescription = decks[pageKey] || "";
  header.outerHTML = `<header class="site-header" id="top"><div class="header-row"><a class="site-name" href="${homeHref}"><span>${siteConfig.acronym}</span><img class="site-mark" src="physical-ai-mark.svg" alt="" /></a><nav aria-label="Primary navigation">${pageLinks.map(([label, href, key]) => `<a href="${href}"${pageKey === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav></div><p class="site-expansion">${siteConfig.fullName}</p><p class="site-wordplay">Pronounced like “fail” - because honest evaluation starts with what breaks.</p>${pageDescription}</header>`;
}

document.querySelectorAll("[data-personal-link]").forEach((element) => {
  element.href = siteConfig.personalSite;
});

document.title = pageKey === "home" ? `${siteConfig.name} - ${siteConfig.fullName}` : document.title;