const database = window.phailDatabase;
const target = document.querySelector(".task-database");
const taskSelect = document.querySelector("#task-filter");
const benchmarkSelect = document.querySelector("#benchmark-filter");
const modelSelect = document.querySelector("#model-filter");
const opennessSelect = document.querySelector("#openness-filter");
const embodimentSelect = document.querySelector("#embodiment-filter");
const sizeSelect = document.querySelector("#size-filter");
const trackSelect = document.querySelector("#track-filter");
const metricSelect = document.querySelector("#metric-filter");
const searchInput = document.querySelector("#search-filter");
const resultCount = document.querySelector("[data-result-count]");
const recommendation = document.querySelector("[data-recommendation]");

const findById = (items, id) => items.find((item) => item.id === id);
const isVerified = (result) => result.verified === true;

function optionMarkup(items, label) {
  return `<option value="">All ${label}</option>${items.map((item) => `<option value="${item.id}">${item.name}</option>`).join("")}`;
}

taskSelect.innerHTML = optionMarkup(database.tasks, "tasks");
benchmarkSelect.innerHTML = optionMarkup(database.benchmarks, "benchmarks");
modelSelect.innerHTML = optionMarkup(database.models, "models");

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = database.results.filter((result) => {
    const task = findById(database.tasks, result.task);
    const benchmark = findById(database.benchmarks, result.benchmark);
    const model = findById(database.models, result.model);
    const haystack = [task.name, task.family, benchmark.name, model.name, model.maker, result.metric, result.value, result.source, result.note || ""].join(" ").toLowerCase();
    return (!taskSelect.value || result.task === taskSelect.value)
      && (!benchmarkSelect.value || result.benchmark === benchmarkSelect.value)
      && (!modelSelect.value || result.model === modelSelect.value)
      && (!opennessSelect.value || model.open === opennessSelect.value)
      && (!embodimentSelect.value || model.embodiment.includes(embodimentSelect.value))
      && (!sizeSelect.value || model.size.includes(sizeSelect.value))
      && (!trackSelect.value || result.track === trackSelect.value)
      && (!metricSelect.value || result.metric === metricSelect.value)
      && (!query || haystack.includes(query));
  });

  if (benchmarkSelect.value) {
    matches.sort((left, right) => {
      const leftScore = Number.parseFloat(left.value);
      const rightScore = Number.parseFloat(right.value);
      if (left.track !== right.track) return (left.track || "").localeCompare(right.track || "");
      if (isVerified(left) !== isVerified(right)) return isVerified(right) ? 1 : -1;
      if (Number.isNaN(leftScore) && Number.isNaN(rightScore)) return left.model.localeCompare(right.model);
      if (Number.isNaN(leftScore)) return 1;
      if (Number.isNaN(rightScore)) return -1;
      return rightScore - leftScore;
    });
  }

  resultCount.textContent = `${matches.length} of ${database.results.length} records${benchmarkSelect.value ? " - benchmark view ranked where numeric results exist" : ""}`;
  const recommended = matches
    .filter((result) => isVerified(result) && !Number.isNaN(Number.parseFloat(result.value)))
    .sort((left, right) => Number.parseFloat(right.value) - Number.parseFloat(left.value))[0];
  if (recommended) {
    const model = findById(database.models, recommended.model);
    const benchmark = findById(database.benchmarks, recommended.benchmark);
    recommendation.innerHTML = `<strong>Best-supported record in this view</strong><span>${model.name} · ${recommended.value} ${recommended.metric} on ${benchmark.name}</span><a href="${recommended.sourceUrl}" target="_blank" rel="noreferrer">Source: ${recommended.source}</a>`;
  } else {
    recommendation.innerHTML = `<strong>No comparable numeric result in this view</strong><span>Use the source links to inspect reported or pending records.</span>`;
  }
  target.innerHTML = matches.length ? matches.map((result) => {
    const task = findById(database.tasks, result.task);
    const benchmark = findById(database.benchmarks, result.benchmark);
    const model = findById(database.models, result.model);
    const rank = benchmarkSelect.value && isVerified(result) && !Number.isNaN(Number.parseFloat(result.value)) ? `#${matches.filter((item) => item.track === result.track && isVerified(item)).indexOf(result) + 1}` : "-";
    const verification = result.verified === true ? "Verified" : result.verified === "partial" || typeof result.verified === "string" ? "Partial" : "Unverified / pending";
    return `<tr><td class="rank-cell">${rank}</td><td><strong>${model.name}</strong><small>${model.maker} · ${model.open} · ${model.size}</small><small>Runtime: ${model.runtime || "Not reported"} · License: ${model.license || "Not reported"}</small></td><td><strong>${task.name}</strong><small>${task.family}</small></td><td><a href="${benchmark.url}" target="_blank" rel="noreferrer">${benchmark.name}</a><small>${benchmark.type} · ${benchmark.year}</small></td><td>${result.track || "-"}</td><td><strong>${result.metric}</strong><small>${result.value}</small></td><td>${result.latency}</td><td>${result.cost}</td><td><a href="${result.sourceUrl}" target="_blank" rel="noreferrer">${result.source}</a><small>${verification}${result.note ? ` · ${result.note}` : ""}</small></td></tr>`;
  }).join("") : `<tr><td colspan="9" class="empty-state">No records match these filters yet. This is a gap in the ledger, not a zero.</td></tr>`;
}

[taskSelect, benchmarkSelect, modelSelect, opennessSelect, embodimentSelect, sizeSelect, trackSelect, metricSelect, searchInput].forEach((control) => control.addEventListener("input", render));
render();
