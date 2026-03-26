const TabController = (() => {
  const navItems = document.querySelectorAll('.bottom-nav__item');
  const panels   = document.querySelectorAll('.tab-panel');

  const switchTab = (tab) => {
    navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  };

  const init = () => {
    navItems.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  };

  return { init, switchTab };
})();
