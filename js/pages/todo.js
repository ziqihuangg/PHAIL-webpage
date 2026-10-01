/* Draws the TODO tab from data/todo.js. Numbers in it are {tokens}, filled by
   js/common/facts.js from the data files this page loads. */
(function () {
  const data = window.phailTodo;
  const mount = document.querySelector("[data-todo]");
  if (!data || !mount) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fill = (text, where) => window.phailFacts.fill(escape(text), where);
  const statusText = { doing: "In progress", next: "Next", later: "Later" };

  mount.innerHTML = data.groups.map((group) => `<section class="todo-group"><h2>${escape(group.name)}</h2><ul class="todo-list">`
    + group.items.map((item) => `<li class="todo-item todo-item--${item.status}">`
      + `<span class="todo-status">${statusText[item.status] || item.status}</span>`
      + `<div><h3>${fill(item.title, "todo")}${item.added ? ` <span class="todo-new">new ${escape(item.added.slice(5))}</span>` : ""}</h3>`
      + `<p>${fill(item.detail, "todo " + item.title)}</p></div></li>`).join("")
    + "</ul></section>").join("");
})();
