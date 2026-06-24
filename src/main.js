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
  renderPagination,
  renderMessage,
} from './render.js';

const statsEl = document.querySelector('#stats');
const controlsEl = document.querySelector('#controls');
const gridEl = document.querySelector('#grid');
const paginationEl = document.querySelector('#pagination');

// Application state. Pagination is server-side: only the current page's
// `pageSize` rows are ever held in `pageRows`, so search/filter/stats apply
// to the current page rather than the whole dataset.
const state = {
  pageRows: [],
  query: '',
  filters: { types: [], minTotal: null, maxTotal: null },
  page: 0,
  pageSize: 60,
  totalCount: 0,
};

/** Apply the search → filter pipeline to the current page of rows. */
const getVisibleRows = () => {
  const searched = searchPokemon(state.pageRows, state.query);
  return filterPokemon(searched, state.filters);
};

/** Recompute visible rows and repaint the cards, grid, and page controls. */
const update = () => {
  const visible = getVisibleRows();
  renderStatCards(statsEl, computeStats(visible));
  renderGrid(gridEl, visible);
  renderPagination(
    paginationEl,
    { page: state.page, pageSize: state.pageSize, totalCount: state.totalCount },
    {
      onPrev: () => {
        if (state.page > 0) loadPage(state.page - 1);
      },
      onNext: () => {
        const totalPages = Math.ceil(state.totalCount / state.pageSize);
        if (state.page < totalPages - 1) loadPage(state.page + 1);
      },
    }
  );
};

/** Fetch a page of Pokémon (0-based), then re-render. */
const loadPage = async (page) => {
  renderMessage(gridEl, 'Loading Pokémon…', 'info');
  paginationEl.innerHTML = '';

  try {
    const { rows, totalCount } = await fetchDashboardData(
      state.pageSize,
      page * state.pageSize
    );
    state.pageRows = transformAll(rows);
    state.totalCount = totalCount;
    state.page = page;
  } catch (err) {
    renderMessage(gridEl, `Couldn't load data: ${err.message}`, 'error');
    return;
  }

  update();
};

const init = async () => {
  await loadPage(0);

  // Bail out if the first fetch failed (the error message is already shown).
  if (!state.pageRows.length) return;

  // Derive control options from the first page of data and render the
  // controls once so the user's search/filter selections survive page changes.
  const types = [...new Set(state.pageRows.flatMap((p) => p.types))].sort();
  const maxTotal = Math.max(...state.pageRows.map((p) => p.total));

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
};

init();
