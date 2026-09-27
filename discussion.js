/* Draws the "Things to discuss" list at the foot of a page from
   discussion-data.js, slide-style: numbered title, detail, what to decide.
   A page opts in with <section data-discussion="key">. The meeting-notes box
   under it belongs to notes.js. */
(function () {
  const data = window.phailDiscussion;
  if (!data) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  document.querySelectorAll("[data-discussion]").forEach((mount) => {
    const items = data[mount.dataset.discussion] || [];
    if (!items.length) return;
    mount.classList.add("talk");
    mount.innerHTML = `<h2 class="talk-title">Things to discuss <span>${escape(data.meeting)}</span></h2>`
      + `<ol class="talk-list">`
      + items.map((item) => `<li><h3>${escape(item.title)}</h3><p>${escape(item.detail)}</p>`
        + (item.decide ? `<p class="talk-decide"><span>Decide</span>${escape(item.decide)}</p>` : "") + "</li>").join("")
      + `</ol>`;
  });
})();
