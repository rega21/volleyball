const AdminController = (() => {
  const db = SupabaseClient.client;
  let authenticated = false;
  const isAuthenticated = () => authenticated;

  const verifyPin = async (pin) => {
    const { data, error } = await db.functions.invoke('bright-endpoint', {
      body: { pin }
    });
    if (error) throw error;
    return data.ok;
  };

  // ── PIN Modal ─────────────────────────────────────────
  const openPin = () => {
    document.getElementById('adminPinInput').value = '';
    document.getElementById('adminPinError').style.display = 'none';
    document.getElementById('adminPinModal').classList.add('open');
  };

  const closePin = () => {
    document.getElementById('adminPinModal').classList.remove('open');
  };

  // ── Feedback Modal ────────────────────────────────────
  const openFeedback = async () => {
    document.getElementById('adminFeedbackItems').innerHTML = '<p class="admin-loading">Cargando...</p>';
    document.getElementById('adminFeedbackModal').classList.add('open');

    const { data, error } = await db
      .from('feedback')
      .select('message, created_at')
      .order('created_at', { ascending: false });

    if (error || !data?.length) {
      document.getElementById('adminFeedbackItems').innerHTML =
        '<p class="admin-empty">Sin sugerencias todavía.</p>';
      return;
    }

    document.getElementById('adminFeedbackItems').innerHTML = data.map(f => `
      <div class="admin-feedback-item">
        <p class="admin-feedback-msg">${f.message}</p>
        <span class="admin-feedback-date">${new Date(f.created_at).toLocaleDateString('es-AR')}</span>
      </div>
    `).join('');
  };

  // ── Init ──────────────────────────────────────────────
  const init = () => {
    document.getElementById('adminPinSubmit').addEventListener('click', async () => {
      const pin = document.getElementById('adminPinInput').value.trim();
      if (!pin) return;
      try {
        const ok = await verifyPin(pin);
        if (ok) {
          authenticated = true;
          closePin();
          document.getElementById('menuAdmin').textContent = 'Admin ✓';
          document.getElementById('menuFeedbackItem').style.display = 'block';
          document.getElementById('feedbackLink').closest('li').style.display = 'none';
          PlayersController.refreshView();
        } else {
          document.getElementById('adminPinError').style.display = 'block';
        }
      } catch (err) {
        console.error(err);
        document.getElementById('adminPinError').style.display = 'block';
      }
    });

    document.getElementById('adminPinInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('adminPinSubmit').click();
    });

    document.getElementById('adminPinClose').addEventListener('click', closePin);
    document.getElementById('adminFeedbackClose').addEventListener('click', () => {
      document.getElementById('adminFeedbackModal').classList.remove('open');
    });

    document.getElementById('menuFeedbackAdmin').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('sideMenu').classList.remove('open');
      document.getElementById('overlay').classList.remove('visible');
      openFeedback();
    });
  };

  return { init, openPin, isAuthenticated };
})();
