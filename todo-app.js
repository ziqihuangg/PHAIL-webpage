/* Draws the TODO tab from todo-data.js. Board counts come from scope-data.js. */
(function () {
  const data = window.phailTodo;
  const mount = document.querySelector("[data-todo]");
  if (!data || !mount) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let boards = "?";
  let ledger = "?";
  if (window.phailScope) {
    const all = [];
    window.phailScope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) =>
      task.benchmarks.forEach((benchmark) => all.push(benchmark)))));
    boards = all.length;
    ledger = all.filter((benchmark) => benchmark.ledger).length;
  }
  const fill = (text) => escape(text).replace("{boards}", boards).replace("{ledger}", ledger);
  const statusText = { doing: "In progress", next: "Next", later: "Later" };

  mount.innerHTML = data.groups.map((group) => `<section class="todo-group"><h2>${escape(group.name)}</h2><ul class="todo-list">`
    + group.items.map((item) => `<li class="todo-item todo-item--${item.status}">`
      + `<span class="todo-status">${statusText[item.status] || item.status}</span>`
      + `<div><h3>${escape(item.title)}${item.added ? ` <span class="todo-new">new ${escape(item.added.slice(5))}</span>` : ""}</h3>`
      + `<p>${fill(item.detail)}</p></div></li>`).join("")
    + "</ul></section>").join("");
})();
