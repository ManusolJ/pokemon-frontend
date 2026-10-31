(function () {
  var theme = 'dark';
  try {
    var stored = localStorage.getItem('ptb-theme');
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else if (window.matchMedia && !window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'light';
    }
  } catch (e) {}

  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  }
})();
