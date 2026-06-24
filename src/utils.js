// =====================================================================
// Small shared utilities.
// =====================================================================

/**
 * Returns a debounced version of `fn`: it only runs after `delay` ms
 * have passed without another call. Useful for high-frequency events
 * like typing in a search box, so we re-filter/re-render once the user
 * pauses instead of on every keystroke.
 *
 * @param {Function} fn
 * @param {number} delay milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
