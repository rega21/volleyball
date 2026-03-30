if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          window.location.reload();
        }
      });
    });
  });
}

(() => {
  ThemeController.init();
  MenuController.init();
  TabController.init();
  PlayersController.init(PartidoController);
  lucide.createIcons();

  TabController.onActivate('partido', () => PartidoController.refresh(
    PlayersController.getAllPlayers(),
    PlayersController.getRatingsMap()
  ));

  // Feedback submit
  document.getElementById('feedbackSubmit').addEventListener('click', async () => {
    const text = document.getElementById('feedbackText').value.trim();
    if (!text) return;
    try {
      await FeedbackService.send(text);
      document.getElementById('feedbackText').value = '';
      document.getElementById('feedbackModal').classList.remove('open');
    } catch (err) {
      console.error('Error enviando feedback:', err);
    }
  });
})();
