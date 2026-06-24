// =====================================================================
// SKILL 1 — FETCH dashboard data from an API (PokéAPI)
// ---------------------------------------------------------------------
// The list endpoint only returns { name, url } for each Pokémon, so to
// build a dashboard we fetch the list first, then fetch every detail
// record in parallel with Promise.all.
// =====================================================================

const BASE = 'https://pokeapi.co/api/v2';

/**
 * Fetch a page of the Pokémon index. The PokéAPI list endpoint supports
 * `limit` (page size) and `offset` (how many to skip) query params, plus
 * a `count` of the total number of Pokémon available.
 * @param {number} limit  page size
 * @param {number} offset how many records to skip
 * @returns {Promise<{ results: Array<{ name: string, url: string }>, count: number }>}
 */
export async function fetchPokemonList(limit = 60, offset = 0) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Pokémon list (HTTP ${res.status})`);
  }
  const data = await res.json();
  return { results: data.results, count: data.count };
}

/**
 * Fetch a single Pokémon's full detail record from its URL.
 * @param {string} url
 * @returns {Promise<object>} raw PokéAPI detail object
 */
export async function fetchPokemonDetail(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Pokémon detail (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Orchestrates one page of the dashboard fetch: list page → parallel details.
 * @param {number} limit  page size
 * @param {number} offset how many records to skip
 * @returns {Promise<{ rows: object[], totalCount: number }>} raw detail
 *   records for the page plus the total number of Pokémon available
 */
export async function fetchDashboardData(limit = 60, offset = 0) {
  const { results, count } = await fetchPokemonList(limit, offset);
  const rows = await Promise.all(
    results.map((entry) => fetchPokemonDetail(entry.url))
  );
  return { rows, totalCount: count };
}
