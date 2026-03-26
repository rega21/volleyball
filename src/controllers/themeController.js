const ThemeController = (() => {
  const btn = document.getElementById('themeBtn');
  const html = document.documentElement;

  const ICON_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg>`;
  const ICON_SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`;

  const apply = (theme) => {
    html.setAttribute('data-theme', theme);
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    localStorage.setItem('theme', theme);
  };

  const init = () => {
    const saved = localStorage.getItem('theme') || 'light';
    apply(saved);
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  };

  return { init };
})();
