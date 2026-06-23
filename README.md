# Pokémon Dashboard — Frontend Training Task

A small vanilla-ES6 dashboard built on the [PokéAPI](https://pokeapi.co/) to
practice four core frontend skills in isolation: **fetching**, **transforming**,
**searching**, and **filtering** data.

It loads the original 151 Pokémon, shows summary stat cards, and renders a grid
you can search by name and filter by type / minimum base-stat total. The cards
recompute from the currently visible set, so they stay in sync with the active
search and filters.

## Run it

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL. (A dev server is required — ES modules
and `fetch` don't work from `file://`.)

## Where each skill lives

| Skill        | File               | What it does                                                        |
| ------------ | ------------------ | ------------------------------------------------------------------- |
| **Fetch**    | `src/api.js`       | Fetches the list, then all detail records in parallel (`Promise.all`). |
| **Transform**| `src/transform.js` | Flattens nested API records into rows; computes aggregate stats.    |
| **Search**   | `src/search.js`    | Pure, case-insensitive substring match on name.                     |
| **Filter**   | `src/filter.js`    | Pure, composable AND filters (types + base-total range).            |

Supporting files: `src/render.js` (DOM rendering), `src/main.js` (orchestrator
+ state), `src/utils.js` (shared helpers), `src/styles.css`, `index.html`.

### Search debouncing

The text search is **debounced at 200ms** (`debounce` in `src/utils.js`, wired
up in `src/render.js`), so the grid re-filters and re-renders once the user
pauses typing rather than on every keystroke. The type filters and the
min-total slider stay instant. Search here is purely client-side over 151 rows
so the win is small, but it's the right pattern once the dataset grows or the
search is backed by a network request.

## Data flow

```
fetchDashboardData()  →  transformAll()  →  [ searchPokemon → filterPokemon ]  →  render
   (api.js)               (transform.js)        (search.js)   (filter.js)        (render.js)
```

The four logic functions (`transformPokemon`, `computeStats`, `searchPokemon`,
`filterPokemon`) are pure and free of DOM access, so they're easy to unit test.
