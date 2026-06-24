// =====================================================================
// SKILL 2 — TRANSFORM raw API data
// ---------------------------------------------------------------------
// PokéAPI detail records are deeply nested. We flatten each one into a
// clean "row" the UI can render directly, and compute aggregate stats
// for the dashboard cards.
// =====================================================================

// PokéAPI stat keys mapped to the flat field names we want on a row.
const STAT_KEYS = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

/**
 * Flatten one raw PokéAPI detail record into a dashboard row.
 * @param {object} raw
 * @returns {{
 *   id: number, name: string, sprite: string|null, types: string[],
 *   hp: number, attack: number, defense: number,
 *   specialAttack: number, specialDefense: number, speed: number,
 *   total: number, height: number, weight: number
 * }}
 */
export function transformPokemon(raw) {
  const stats = {};
  for (const entry of raw.stats) {
    const key = STAT_KEYS[entry.stat.name];
    if (key) stats[key] = entry.base_stat;
  }

  const total = Object.values(stats).reduce((sum, n) => sum + n, 0);

  const sprite =
    raw.sprites?.other?.['official-artwork']?.front_default ??
    raw.sprites?.front_default ??
    null;

  return {
    id: raw.id,
    name: raw.name,
    sprite,
    types: raw.types.map((t) => t.type.name),
    ...stats,
    total,
    height: raw.height,
    weight: raw.weight,
  };
}

/**
 * Transform a list of raw detail records into dashboard rows.
 * @param {object[]} rawArray
 */
export function transformAll(rawArray) {
  return rawArray.map(transformPokemon);
}

/**
 * Compute aggregate statistics for the dashboard cards. Designed to run
 * on whatever rows are currently visible so the cards stay in sync with
 * the active search/filter.
 * @param {object[]} rows
 * @returns {{
 *   count: number,
 *   countByType: Record<string, number>,
 *   avgTotal: number,
 *   strongest: object|null
 * }}
 */
export function computeStats(rows) {
  const countByType = {};
  let strongest = null;
  let totalSum = 0;

  for (const row of rows) {
    totalSum += row.total;
    if (!strongest || row.total > strongest.total) strongest = row;
    for (const type of row.types) {
      countByType[type] = (countByType[type] || 0) + 1;
    }
  }

  return {
    count: rows.length,
    countByType,
    avgTotal: rows.length ? Math.round(totalSum / rows.length) : 0,
    strongest,
  };
}
