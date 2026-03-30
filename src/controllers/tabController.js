const TabController = (() => {
  const navItems = document.querySelectorAll('.bottom-nav__item');
  const panels   = document.querySelectorAll('.tab-panel');
  const callbacks = {};

  const onActivate = (tab, fn) => { callbacks[tab] = fn; };

  const switchTab = (tab) => {
    navItems.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    panels.forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
    if (callbacks[tab]) callbacks[tab]();
  };

  const init = () => {
    navItems.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  };

  return { init, switchTab, onActivate };
})();
