/* =============================================================================
   PhAIL - meeting notes at the foot of every tab
   -----------------------------------------------------------------------------
   Type a note, press Enter: under `bash preview.sh` it is POSTed to
   preview_server.py, which appends it to notes-data.js - so the note is in the
   repo and ships with the next commit. Anywhere else (GitHub Pages, file://)
   there is no API: saved notes are shown read-only and the box is hidden.

   Mounts: <div data-notes="scope"> for one tab's notes and input;
           <div data-notes="*" data-notes-input="todo"> lists every tab's notes
           (the TODO tab) and files new ones under "todo".
   ========================================================================== */

(function () {
  const labels = { scope: "Scope", ranking: "Ranking", ledger: "Ledger", charts: "Charts", astra: "GPT-6 Astra", related: "Related work", todo: "TODO" };
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let notes = window.phailNotes || [];
  let live = false;
  let focusMount = null;

  /* A tab with a discussion list gets its notes box inside the same section. */
  document.querySelectorAll("[data-discussion]").forEach((section) => {
    if (section.querySelector("[data-notes]")) return;
    const box = document.createElement("div");
    box.dataset.notes = section.dataset.discussion;
    section.appendChild(box);
  });
  const mounts = Array.from(document.querySelectorAll("[data-notes]"));
  if (!mounts.length) return;

  const item = (note, showPage) => `<li><span class="notes-time">${escape(note.time)}</span>`
    + (showPage ? `<span class="notes-page">${escape(labels[note.page] || note.page)}</span>` : "")
    + `<span class="notes-text">${escape(note.text)}</span>`
    + (live ? `<button type="button" class="notes-delete" data-note-id="${escape(note.id)}" aria-label="Delete note">&times;</button>` : "")
    + "</li>";

  function render() {
    mounts.forEach((mount) => {
      const key = mount.dataset.notes;
      const all = key === "*";
      const target = mount.dataset.notesInput || key;
      const list = all ? notes.slice() : notes.filter((note) => note.page === key);
      if (all) list.sort((a, b) => (a.page === b.page ? 0 : (labels[a.page] || a.page) < (labels[b.page] || b.page) ? -1 : 1));
      if (!live && !list.length) { mount.innerHTML = ""; mount.hidden = true; return; }
      mount.hidden = false;
      mount.classList.add("notes");
      mount.innerHTML = `<h3 class="notes-title">Meeting notes${all ? " from every tab" : ""}</h3>`
        + (list.length ? `<ul class="notes-list">${list.map((note) => item(note, all)).join("")}</ul>` : "")
        + (live ? `<input class="notes-input" type="text" maxlength="2000" data-notes-page="${escape(target)}" placeholder="Type a note, press Enter - saved into notes-data.js" aria-label="Add a meeting note" />` : "")
        + `<p class="notes-status" aria-live="polite"></p>`;
      if (mount === focusMount) { const input = mount.querySelector(".notes-input"); if (input) input.focus(); }
    });
  }

  function send(path, body, mount) {
    return fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("HTTP " + response.status))))
      .then((data) => { notes = data.notes; focusMount = mount; render(); focusMount = null; })
      .catch((error) => {
        const input = mount && mount.querySelector(".notes-input");
        if (input) { input.disabled = false; input.focus(); }
        const status = mount && mount.querySelector(".notes-status");
        if (status) status.textContent = "Not saved (" + error.message + "). Is bash preview.sh running?";
      });
  }

  document.addEventListener("keydown", (event) => {
    const input = event.target;
    if (event.key !== "Enter" || !input.classList || !input.classList.contains("notes-input") || event.isComposing) return;
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    send("/api/notes", { page: input.dataset.notesPage, text: text }, input.closest("[data-notes]"));
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest && event.target.closest(".notes-delete");
    if (!button) return;
    send("/api/notes/delete", { id: button.dataset.noteId }, button.closest("[data-notes]"));
  });

  render();
  if (window.location.protocol.indexOf("http") === 0) {
    fetch("/api/notes", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => { live = true; notes = data.notes; render(); })
      .catch(() => {});
  }
})();
