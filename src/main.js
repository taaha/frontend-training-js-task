// =====================================================================
// ORCHESTRATOR — wires the four skills together.
//   fetch (api) → transform → [ search → filter ] → render
// =====================================================================

import { fetchDashboardData } from './api.js';
import { transformAll, computeStats } from './transform.js';
import { searchPokemon } from './search.js';
import { filterPokemon } from './filter.js';
import {
  renderStatCards,
  renderControls,
  renderGrid,
  renderMessage,
} from './render.js';

const statsEl = document.querySelector('#stats');
const controlsEl = document.querySelector('#controls');
const gridEl = document.querySelector('#grid');

// Application state.
const state = {
  allRows: [],
  query: '',
  filters: { types: [], minTotal: null, maxTotal: null },
};

/** Apply the search → filter pipeline to the full dataset. */
function getVisibleRows() {
  const searched = searchPokemon(state.allRows, state.query);
  return filterPokemon(searched, state.filters);
}

/** Recompute visible rows and repaint the cards + grid. */
function update() {
  const visible = getVisibleRows();
  renderStatCards(statsEl, computeStats(visible));
  renderGrid(gridEl, visible);
}

async function init() {
  renderMessage(gridEl, 'Loading Pokémon…', 'info');

  try {
    const raw = await fetchDashboardData(151);
    state.allRows = transformAll(raw);
  } catch (err) {
    renderMessage(gridEl, `Couldn't load data: ${err.message}`, 'error');
    return;
  }

  // Derive control options from the data.
  const types = [...new Set(state.allRows.flatMap((p) => p.types))].sort();
  const maxTotal = Math.max(...state.allRows.map((p) => p.total));

  renderControls(
    controlsEl,
    { types, maxTotal },
    {
      onSearch: (value) => {
        state.query = value;
        update();
      },
      onTypesChange: (selected) => {
        state.filters.types = selected;
        update();
      },
      onMinTotalChange: (value) => {
        state.filters.minTotal = value || null;
        update();
      },
    }
  );

  update();
}

init();
