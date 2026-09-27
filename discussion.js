/* Draws the "Things to discuss" block at the foot of a page from
   discussion-data.js. A page opts in with <section data-discussion="key">. */
(function () {
  const data = window.phailDiscussion;
  if (!data) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  document.querySelectorAll("[data-discussion]").forEach((mount) => {
    const items = data[mount.dataset.discussion] || [];
    if (!items.length) return;
    mount.classList.add("discussion");
    mount.innerHTML = `<h2 class="discussion-title">Things to discuss <span>and proposed solutions &middot; for ${escape(data.meeting)}</span></h2>`
      + `<div class="data-table-wrap"><table class="data-table discussion-table">`
      + `<colgroup><col class="col-num" /><col class="col-issue" /><col class="col-proposal" /><col class="col-decide" /></colgroup>`
      + `<thead><tr><th>#</th><th>Question</th><th>Proposed solution</th><th>To decide</th></tr></thead><tbody>`
      + items.map((item, index) => `<tr><td class="discussion-num">${index + 1}</td>`
        + `<td><span class="discussion-topic">${escape(item.topic)}</span><span class="discussion-issue">${escape(item.issue)}</span></td>`
        + `<td>${escape(item.proposal)}</td><td class="discussion-decide">${escape(item.decide)}</td></tr>`).join("")
      + `</tbody></table></div>`;
  });
})();
