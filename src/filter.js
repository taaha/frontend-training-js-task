// =====================================================================
// SKILL 4 — FILTER logic
// ---------------------------------------------------------------------
// Pure function with composable AND semantics. A row must satisfy every
// active constraint. An empty `types` array or a null bound means "no
// constraint", so filters combine cleanly.
// =====================================================================

/**
 * @typedef {{
 *   types: string[],
 *   minTotal: number|null,
 *   maxTotal: number|null
 * }} Filters
 */

/**
 * @param {object[]} rows
 * @param {Filters} filters
 * @returns {object[]}
 */
export function filterPokemon(rows, filters = {}) {
  const { types = [], minTotal = null, maxTotal = null } = filters;

  return rows.filter((row) => {
    // Type filter: row must include at least one of the selected types.
    if (types.length && !types.some((t) => row.types.includes(t))) {
      return false;
    }
    // Total stat range.
    if (minTotal != null && row.total < minTotal) return false;
    if (maxTotal != null && row.total > maxTotal) return false;
    return true;
  });
}
