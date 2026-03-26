const MenuController = (() => {
  const menuBtn   = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const sideMenu  = document.getElementById('sideMenu');
  const overlay   = document.getElementById('overlay');
  const feedbackLink = document.getElementById('feedbackLink');

  const open  = () => { sideMenu.classList.add('open'); overlay.classList.add('visible'); };
  const close = () => { sideMenu.classList.remove('open'); overlay.classList.remove('visible'); };

  const init = () => {
    menuBtn.addEventListener('click', open);
    menuClose.addEventListener('click', close);
    overlay.addEventListener('click', close);

    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      close();
      document.getElementById('feedbackModal').classList.add('open');
    });

    document.getElementById('feedbackClose').addEventListener('click', () => {
      document.getElementById('feedbackModal').classList.remove('open');
    });
  };

  return { init };
})();
