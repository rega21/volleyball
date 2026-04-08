// ── PWA Install prompt ────────────────────────────────
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById('installBtn').style.display = 'flex';
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installBtn').style.display = 'none';
    deferredInstallPrompt = null;
  }
});

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
  AdminController.init();
  TabController.init();
  PlayersController.init(PartidoController);
  lucide.createIcons();

  TabController.onActivate('partido', () => PartidoController.refresh(
    PlayersController.getAllPlayers(),
    PlayersController.getRatingsMap()
  ));

  TabController.onActivate('jugadores', () => PartidoController.hide());
  TabController.onActivate('historial', () => {
    PartidoController.hide();
    HistorialController.load();
  });

  TabController.switchTab('jugadores');

  // Cerrar modales al hacer click fuera del contenido
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

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
