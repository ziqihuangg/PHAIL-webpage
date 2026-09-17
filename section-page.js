/* The section pages are thin: they lift a section out of index.html so that the
   markup for a table lives in exactly one place. Benchmarks now carries two of
   them - the board list and the metric glossary - because "what does this
   number mean" is the question you have while reading a benchmark row, not a
   separate destination. */
const sectionNames = (document.body.dataset.sections || document.body.dataset.section || "")
  .split(",").map((name) => name.trim()).filter(Boolean);
const titles = { benchmarks: "Benchmarks", metrics: "Evaluation metrics", models: "Model specifications" };
const source = await fetch("index.html").then((response) => response.text());
const sourceDocument = new DOMParser().parseFromString(source, "text/html");
const target = document.querySelector(".section-page");

const found = sectionNames
  .map((name) => ({ name, node: sourceDocument.querySelector(`#${name}`) }))
  .filter((entry) => entry.node);

if (found.length && target) {
  found.forEach((entry, index) => {
    const clonedSection = entry.node.cloneNode(true);
    const heading = clonedSection.querySelector(".section-heading h1, .section-heading h2");
    const kicker = clonedSection.querySelector(".section-kicker");
    if (heading) heading.textContent = titles[entry.name] || entry.name;
    if (kicker) kicker.remove();
    /* Only the first section on the page gets the page-sized heading; the ones
       under it are subsections, not rival titles. */
    if (index > 0) clonedSection.classList.add("section-secondary");
    target.append(clonedSection);
  });
  document.title = `PhAIL - ${titles[found[0].name] || found[0].name}`;
  target.setAttribute("aria-busy", "false");
} else if (target) {
  target.textContent = "This section is not available yet.";
  target.setAttribute("aria-busy", "false");
}
