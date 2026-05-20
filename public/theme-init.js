(function () {
  try {
    var k = 'elvoriatech:theme';
    var v = localStorage.getItem(k) || 'elvoria-light';
    var root = document.documentElement;
    root.classList.add('theme-elvoria');
    if (v === 'elvoria-dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {
    /* ignore */
  }
})();
