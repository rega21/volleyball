if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

(() => {
  ThemeController.init();
  MenuController.init();
  TabController.init();
  PlayersController.init();

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
