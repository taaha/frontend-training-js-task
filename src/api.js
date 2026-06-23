// =====================================================================
// SKILL 1 — FETCH dashboard data from an API (PokéAPI)
// ---------------------------------------------------------------------
// The list endpoint only returns { name, url } for each Pokémon, so to
// build a dashboard we fetch the list first, then fetch every detail
// record in parallel with Promise.all.
// =====================================================================

const BASE = 'https://pokeapi.co/api/v2';

/**
 * Fetch the index of Pokémon. Returns the raw `results` array of
 * { name, url } objects — NOT the full detail records.
 * @param {number} limit
 * @returns {Promise<Array<{ name: string, url: string }>>}
 */
export async function fetchPokemonList(limit = 151) {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Pokémon list (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.results;
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
 * Orchestrates the full dashboard fetch: list → parallel details.
 * @param {number} limit
 * @returns {Promise<object[]>} array of raw detail records
 */
export async function fetchDashboardData(limit = 151) {
  const list = await fetchPokemonList(limit);
  return Promise.all(list.map((entry) => fetchPokemonDetail(entry.url)));
}
