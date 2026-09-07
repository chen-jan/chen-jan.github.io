(() => {
  const root = document.getElementById('jan-portfolio');
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = preference.matches ? 'dark' : 'light';
  function apply() {
    root.style.colorScheme = theme;
    document.documentElement.style.colorScheme = theme;
    root.querySelectorAll('.jp-theme').forEach(button => {
      const label = theme === 'dark' ? 'Light mode' : 'Dark mode';
      button.setAttribute('aria-label', 'Switch to ' + label.toLowerCase());
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.querySelector('.theme-label').textContent = label;
    });
  }
  root.querySelectorAll('.jp-theme').forEach(button => button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    apply();
  }));
  preference.addEventListener('change', event => {
    theme = event.matches ? 'dark' : 'light';
    apply();
  });
  apply();
})();
