const MenuController = (() => {
  const menuBtn   = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const sideMenu  = document.getElementById('sideMenu');
  const overlay   = document.getElementById('overlay');
  const feedbackLink = document.getElementById('feedbackLink');

  const open  = () => {
    const ratingsMap = PlayersController.getRatingsMap();
    const allPlayers = PlayersController.getAllPlayers();
    const hasRated = allPlayers.some(p => ratingsMap[p.id]?.avg);
    document.getElementById('menuRatingGlobal').classList.toggle('disabled', !hasRated);
    sideMenu.classList.add('open');
    overlay.classList.add('visible');
  };
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

    document.getElementById('menuRatingGlobal').addEventListener('click', (e) => {
      e.preventDefault();
      close();
      const allPlayers = PlayersController.getAllPlayers();
      const ratingsMap = PlayersController.getRatingsMap();
      const withRating = allPlayers.filter(p => ratingsMap[p.id]?.avg);
      if (!withRating.length) return;
      const random = withRating[Math.floor(Math.random() * withRating.length)];
      RatingViewController.open(allPlayers, ratingsMap, random.id);
    });

    document.getElementById('menuInfoApp').addEventListener('click', (e) => {
      e.preventDefault();
      close();
      document.getElementById('infoModal').classList.add('open');
      lucide.createIcons();
    });

    document.getElementById('infoClose').addEventListener('click', () => {
      document.getElementById('infoModal').classList.remove('open');
    });
  };

  return { init };
})();
