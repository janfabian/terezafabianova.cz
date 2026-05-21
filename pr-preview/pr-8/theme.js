// theme.js — runs before everything else.
// Reads dark-mode preference from localStorage and applies it to <html> ASAP
// to avoid the white flash. Also wires the .theme-toggle buttons in the nav.

(function () {
  try {
    var stored = localStorage.getItem('tf-theme');
    var isDark = false;
    if (stored) {
      var parsed = JSON.parse(stored);
      isDark = !!parsed.dark;
    }
    document.documentElement.dataset.dark = isDark ? 'true' : 'false';
  } catch (e) {}

  function setDark(next) {
    document.documentElement.dataset.dark = next ? 'true' : 'false';
    try {
      var stored = localStorage.getItem('tf-theme');
      var parsed = stored ? JSON.parse(stored) : {};
      parsed.dark = next;
      localStorage.setItem('tf-theme', JSON.stringify(parsed));
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
