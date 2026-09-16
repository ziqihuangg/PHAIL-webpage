const sectionName = document.body.dataset.section;
const source = await fetch("index.html").then((response) => response.text());
const sourceDocument = new DOMParser().parseFromString(source, "text/html");
const section = sourceDocument.querySelector(`#${sectionName}`);
const target = document.querySelector(".section-page");

if (section && target) {
  const clonedSection = section.cloneNode(true);
  const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
  const heading = clonedSection.querySelector(".section-heading h1, .section-heading h2");
  const kicker = clonedSection.querySelector(".section-kicker");
  if (heading) heading.textContent = sectionTitle;
  if (kicker) kicker.remove();
  target.append(clonedSection);
  document.title = `PhAIL - ${sectionTitle}`;
  target.setAttribute("aria-busy", "false");
} else if (target) {
  target.textContent = "This section is not available yet.";
  target.setAttribute("aria-busy", "false");
}
