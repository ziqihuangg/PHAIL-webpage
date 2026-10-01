/* Draws the Related work tab from data/related.js: one card per project. */
(function () {
  const data = window.phailRelated;
  const mount = document.querySelector("[data-related]");
  if (!data || !mount) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  mount.innerHTML = data.entries.map((entry, index) => `<article class="related-entry" id="${escape(entry.id)}">`
    + `<p class="related-index">${index + 1}</p>`
    + `<h2><a href="${escape(entry.links[0][1])}" target="_blank" rel="noreferrer">${escape(entry.title)}</a></h2>`
    + `<p class="related-meta">${escape(entry.who)} &middot; ${escape(entry.when)} &middot; read ${escape(entry.read)}`
    + entry.links.map(([label, url]) => ` &middot; <a href="${escape(url)}" target="_blank" rel="noreferrer">${escape(label)}</a>`).join("") + "</p>"
    + `<p class="related-summary">${escape(entry.summary)}</p>`
    + `<dl class="related-facts">${entry.facts.map(([key, value]) => `<div><dt>${escape(key)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>`
    + `<h3>Differences from PhAIL</h3>`
    + `<div class="data-table-wrap"><table class="data-table related-compare"><thead><tr><th></th><th>This work</th><th>PhAIL</th></tr></thead><tbody>`
    + entry.compare.map(([key, them, us]) => `<tr><td>${escape(key)}</td><td>${escape(them)}</td><td>${escape(us)}</td></tr>`).join("")
    + `</tbody></table></div>`
    + `<h3>Lessons for PhAIL</h3>`
    + `<ol class="slide-steps">${entry.learn.map(([title, detail]) => `<li><b>${escape(title)}</b><span>${escape(detail)}</span></li>`).join("")}</ol>`
    + `<h3>Gaps in this work</h3>`
    + `<ul class="slide-points">${entry.theyLack.map((line) => `<li>${escape(line)}</li>`).join("")}</ul>`
    + `<p class="related-overlap"><b>Boards both of us track:</b> ${escape(entry.overlap)}</p>`
    + "</article>").join("");
})();
