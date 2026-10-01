/* Draws the "Things to discuss" list at the foot of a page from
   data/discussion.js (numbers in it are {tokens}: js/common/facts.js), slide-style: numbered title, detail or labelled points,
   what to decide. A page opts in with <section data-discussion="key">. The
   meeting-notes box under it belongs to js/common/notes.js. */
(function () {
  const data = window.phailDiscussion;
  if (!data) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  /* numbers in the text are {tokens} filled from js/common/facts.js */
  const fill = (text, where) => (window.phailFacts ? window.phailFacts.fill(escape(text), where) : escape(text));

  document.querySelectorAll("[data-discussion]").forEach((mount) => {
    const items = data[mount.dataset.discussion] || [];
    if (!items.length) return;
    mount.classList.add("talk");
    mount.innerHTML = `<h2 class="talk-title">Things to discuss <span>${escape(data.meeting)}</span></h2>`
      + `<ol class="talk-list">`
      + items.map((item, i) => {
        const where = `discussion ${mount.dataset.discussion} #${i + 1}`;
        return `<li><h3>${fill(item.title, where)}</h3>`
          + (item.detail ? `<p>${fill(item.detail, where)}</p>` : "")
          + (item.points ? `<dl class="talk-points">${item.points.map(([label, text]) => `<div><dt>${fill(label, where)}</dt><dd>${fill(text, where)}</dd></div>`).join("")}</dl>` : "")
          + (item.decide ? `<p class="talk-decide"><span>Decide</span>${fill(item.decide, where)}</p>` : "") + "</li>";
      }).join("")
      + `</ol>`;
  });
})();
