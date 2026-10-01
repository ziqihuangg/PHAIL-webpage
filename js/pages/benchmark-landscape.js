/* Data lives in data/benchmark-landscape.js; no external requests needed. */
(function () {
  const data = window.phailBenchmarkLandscape;
  if (!data) return;
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {mobile:'Mobile manipulation', loco:'Loco-manipulation', dexterous:'Dexterous manipulation'};
  const link = (source) => `<a href="${esc(source.url)}" target="_blank" rel="noreferrer">${esc(source.label)}</a>`;
  const domain = $('[data-landscape-domain]');
  const simulator = $('[data-landscape-sim]');
  const search = $('[data-landscape-search]');
  const references = $('[data-landscape-references]');
  const families = ['MuJoCo', 'Isaac', 'Habitat', 'SAPIEN', 'Genesis', 'Real'];
  families.forEach((name) => simulator.add(new Option(name, name.toLowerCase())));
  let visible = [];
  $('[data-landscape-date]').textContent = data.updated;
  $('[data-landscape-overview]').innerHTML = Object.entries(labels).map(([key, name]) => {
    const rows = data.rows.filter((r) => r.group === key && r.kind === 'Benchmark');
    return `<article><strong>${rows.length}</strong><h3>${esc(name)}</h3><p>${rows.filter((r) => r.status === 'Added').length} additions to the original Scope inventory. <a href="#inventory" data-domain-link="${key}">Explore this domain →</a></p></article>`;
  }).join('');
  function render() {
    const q = search.value.trim().toLowerCase();
    visible = data.rows.filter((r) => (references.checked || r.kind === 'Benchmark')
      && (domain.value === 'all' || r.group === domain.value || domain.value === 'moving' && ['mobile','loco'].includes(r.group))
      && (simulator.value === 'all' || r.sim.toLowerCase().includes(simulator.value))
      && (!q || Object.values(r).filter((v) => typeof v === 'string').join(' ').toLowerCase().includes(q)));
    $('[data-landscape-count]').textContent = `${visible.length} entries shown · ${visible.filter((r) => r.kind === 'Benchmark').length} benchmarks · checked ${data.updated}. Scroll sideways for asset details; benchmark names stay visible on desktop.`;
    ['moving', 'dexterous'].forEach((group) => {
    const rows = visible.filter((r) => group === 'moving' ? r.group !== 'dexterous' : r.group === 'dexterous');
    $('[data-table-count="' + group + '"]').textContent = `${rows.length} entries · ${rows.filter((r) => r.kind === 'Benchmark').length} benchmarks`;
    $('[data-landscape-rows="' + group + '"]').innerHTML = rows.length ? rows.map((r) => `<tr id="entry-${esc(r.id)}">
      <td><span class="landscape-tag${r.status === 'Added' ? ' landscape-tag--new' : ''}">${esc(r.status)}</span><br><b>${esc(r.name)}</b><small>${esc(labels[r.group])} · ${esc(r.kind)}</small><small>${esc(r.version)}</small><div class="landscape-sources">${r.sources.map(link).join('')}</div></td>
      <td>${esc(r.tasks)}</td><td>${esc(r.body)}</td><td>${esc(r.models)}</td><td>${esc(r.sim)}</td>
      <td><span class="landscape-tag">${esc(r.origin)}</span><br>${esc(r.assetSource)}</td><td>${esc(r.assets)}</td><td>${esc(r.deformable)}</td><td>${esc(r.articulated)}</td>
      <td><p>${esc(r.reuse)}</p><small>${esc(r.caveat)}</small></td></tr>`).join('') : '<tr><td colspan="10">No matching entries. Clear the search or reset the filters.</td></tr>';
    });
  }
  function reset() { domain.value = 'all'; simulator.value = 'all'; search.value = ''; references.checked = false; }
  function showEntry(id) {
    const row = data.rows.find((r) => r.id === id);
    if (!row) return;
    reset(); references.checked = row.kind !== 'Benchmark'; search.value = row.name; render();
    $('#entry-' + row.id).scrollIntoView({behavior:'smooth'});
  }
  const params = new URLSearchParams(window.location.search);
  if ([...domain.options].some((o) => o.value === params.get('domain'))) domain.value = params.get('domain');
  [domain, simulator, references].forEach((element) => element.addEventListener('change', render));
  search.addEventListener('input', render);
  $('[data-landscape-reset]').addEventListener('click', () => { reset(); render(); });
  document.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-domain-link]');
    if (jump) { reset(); domain.value = jump.dataset.domainLink; render(); }
    const entry = event.target.closest('[data-entry-link]');
    if (entry) { event.preventDefault(); showEntry(entry.dataset.entryLink); }
  });
  $('[data-landscape-reuse]').innerHTML = data.assets.map((asset) => `<article><h3>${esc(asset.name)}</h3><p>${esc(asset.text)}</p><p><b>Access / integration:</b> ${esc(asset.access)}</p><p>${asset.ids.map((id) => {
    const row = data.rows.find((r) => r.id === id);
    return `<a href="#entry-${esc(id)}" data-entry-link="${esc(id)}">${esc(row.name)}</a>`;
  }).join(' · ')}</p></article>`).join('');
  $('[data-landscape-audit]').innerHTML = `<div class="landscape-audit">${data.audit.map((item) => `<article><h3>${esc(item.title)}</h3><ul>${item.items.map((text) => `<li>${esc(text)}</li>`).join('')}</ul></article>`).join('')}</div>`;
  $('[data-landscape-export]').addEventListener('click', () => {
    const keys = ['name','group','kind','status','version','tasks','body','models','sim','origin','assetSource','assets','deformable','articulated','reuse','caveat'];
    const cell = (value) => '"' + String(value).replace(/"/g, '""') + '"';
    const csv = [keys.concat('sources','checked').map(cell).join(','), ...visible.map((r) => keys.map((k) => r[k]).concat(r.sources.map((s) => `${s.label}: ${s.url}`).join(' | '), data.updated).map(cell).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href = url; a.download = `phail-manipulation-${data.updated}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
  if (window.location.hash.startsWith('#entry-')) showEntry(window.location.hash.slice(7));
})();
