// =====================================================================
// RENDERING — turns data into DOM. Kept separate from the fetch/
// transform/search/filter logic so those stay pure and testable.
// =====================================================================

import { debounce } from './utils.js';

/** Escape user/data text before injecting into innerHTML. */
function esc(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Render the summary stat cards.
 * @param {HTMLElement} container
 * @param {{count:number, avgTotal:number, strongest:object|null, countByType:Record<string,number>}} stats
 */
export function renderStatCards(container, stats) {
  const topTypes = Object.entries(stats.countByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, n]) => `${cap(type)} (${n})`)
    .join(', ');

  const cards = [
    { label: 'Showing', value: stats.count },
    { label: 'Avg. base total', value: stats.avgTotal },
    {
      label: 'Strongest',
      value: stats.strongest ? cap(stats.strongest.name) : '—',
      sub: stats.strongest ? `${stats.strongest.total} total` : '',
    },
    { label: 'Top types', value: topTypes || '—' },
  ];

  container.innerHTML = cards
    .map(
      (c) => `
      <div class="card">
        <div class="card-value">${esc(c.value)}</div>
        <div class="card-label">${esc(c.label)}</div>
        ${c.sub ? `<div class="card-sub">${esc(c.sub)}</div>` : ''}
      </div>`
    )
    .join('');
}

/**
 * Render the search box + type checkboxes + min-total slider.
 * Wires events to the provided handlers.
 * @param {HTMLElement} container
 * @param {{ types: string[], maxTotal: number }} options
 * @param {{ onSearch:Function, onTypesChange:Function, onMinTotalChange:Function }} handlers
 */
export function renderControls(container, options, handlers) {
  const { types, maxTotal } = options;

  container.innerHTML = `
    <input
      type="search"
      id="search-input"
      class="search-input"
      placeholder="Search by name…"
      autocomplete="off"
    />
    <fieldset class="type-filters">
      <legend>Types</legend>
      ${types
        .map(
          (t) => `
        <label class="type-chip type-${t}">
          <input type="checkbox" value="${esc(t)}" /> ${cap(t)}
        </label>`
        )
        .join('')}
    </fieldset>
    <div class="range-filter">
      <label for="min-total">Min base total: <span id="min-total-val">0</span></label>
      <input type="range" id="min-total" min="0" max="${maxTotal}" step="10" value="0" />
    </div>
  `;

  // Debounce search so we only re-filter/re-render once the user pauses
  // typing, not on every keystroke.
  const onSearch = debounce(handlers.onSearch, 200);
  container
    .querySelector('#search-input')
    .addEventListener('input', (e) => onSearch(e.target.value));

  container.querySelectorAll('.type-filters input').forEach((box) => {
    box.addEventListener('change', () => {
      const selected = [
        ...container.querySelectorAll('.type-filters input:checked'),
      ].map((b) => b.value);
      handlers.onTypesChange(selected);
    });
  });

  const slider = container.querySelector('#min-total');
  const sliderVal = container.querySelector('#min-total-val');
  slider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    sliderVal.textContent = value;
    handlers.onMinTotalChange(value);
  });
}

/**
 * Render the Pokémon grid (or an empty state).
 * @param {HTMLElement} container
 * @param {object[]} rows
 */
export function renderGrid(container, rows) {
  if (!rows.length) {
    container.innerHTML = `<p class="empty">No Pokémon match your search and filters.</p>`;
    return;
  }

  container.innerHTML = rows
    .map(
      (p) => `
      <article class="poke-card">
        <span class="poke-id">#${String(p.id).padStart(3, '0')}</span>
        <img class="poke-sprite" src="${esc(p.sprite || '')}" alt="${esc(p.name)}" loading="lazy" />
        <h3 class="poke-name">${esc(cap(p.name))}</h3>
        <div class="poke-types">
          ${p.types.map((t) => `<span class="type-badge type-${t}">${esc(cap(t))}</span>`).join('')}
        </div>
        <div class="poke-total">Total ${p.total}</div>
      </article>`
    )
    .join('');
}

/** Simple full-section status message (loading / error). */
export function renderMessage(container, message, kind = 'info') {
  container.innerHTML = `<p class="status status-${kind}">${esc(message)}</p>`;
}
