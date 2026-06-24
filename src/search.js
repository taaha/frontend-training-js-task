// =====================================================================
// SKILL 3 — SEARCH logic
// ---------------------------------------------------------------------
// Pure function: takes rows + a query, returns the matching rows.
// Case-insensitive substring match on the Pokémon's name.
// =====================================================================

/**
 * @param {object[]} rows
 * @param {string} query
 * @returns {object[]}
 */
export function searchPokemon(rows, query) {
  const needle = (query || '').trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) => row.name.toLowerCase().includes(needle));
}
