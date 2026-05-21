// theme.js — runs synchronously in <head> before paint to avoid the
// light→dark flash. Resolves the initial mode in this priority order:
//   1. Explicit user choice persisted in localStorage (after they clicked
//      the sun/moon toggle).
//   2. System preference via prefers-color-scheme media query.
//   3. Light fallback if neither is available.
// After init, also wires the .theme-toggle buttons in the nav.

(function () {
  var STORAGE_KEY = 'tf-theme';

  function systemPrefersDark() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  function readStoredDark() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      var parsed = JSON.parse(stored);
      return typeof parsed.dark === 'boolean' ? parsed.dark : null;
    } catch (e) {
      return null;
    }
  }

  // Resolve initial mode.
  var explicit = readStoredDark();
  var isDark = explicit === null ? systemPrefersDark() : explicit;
  document.documentElement.dataset.dark = isDark ? 'true' : 'false';

  // Follow live system preference changes ONLY when the user hasn't made an
  // explicit choice. Once they click the toggle, their pick wins.
  if (explicit === null && typeof window.matchMedia === 'function') {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', function (e) {
      if (readStoredDark() === null) {
        document.documentElement.dataset.dark = e.matches ? 'true' : 'false';
      }
    });
  }

  function setDark(next) {
    document.documentElement.dataset.dark = next ? 'true' : 'false';
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      var parsed = stored ? JSON.parse(stored) : {};
      parsed.dark = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {}
  }

  function wire() {
    var btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setDark(document.documentElement.dataset.dark !== 'true');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
