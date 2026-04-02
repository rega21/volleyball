const HistorialController = (() => {
  let matches = [];

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTeamPlayersList = (match, team) => {
    const mp = Array.isArray(match.match_players) ? match.match_players : [];
    return mp.filter(p => p.team === team).map(p => p.players?.nickname || p.players?.name || '');
  };

  const hasScore = (m) => m.score_a !== null && m.score_b !== null;

  const renderCard = (m) => {
    const playersA = getTeamPlayersList(m, 'A');
    const playersB = getTeamPlayersList(m, 'B');
    const maxRows = Math.max(playersA.length, playersB.length);

    const rows = Array.from({ length: maxRows }, (_, i) => `
      <div class="hcard__row">
        <span class="hcard__name hcard__name--a">${playersA[i] || ''}</span>
        <span class="hcard__name hcard__name--b">${playersB[i] || ''}</span>
      </div>
    `).join('');

    const scoreHtml = hasScore(m)
      ? `<div class="hcard__score">${m.score_a} <span class="hcard__dash">–</span> ${m.score_b}</div>`
      : `<button class="hcard__score-btn historial-score-btn" data-id="${m.id}">Cargar<br>resultado</button>`;

    return `
      <div class="hcard" data-id="${m.id}">
        <div class="hcard__date">${formatDate(m.played_at)}</div>
        <div class="hcard__body">
          <div class="hcard__team-col">
            <div class="hcard__team-label hcard__team-label--a">● EQUIPO A</div>
            ${playersA.map(n => `<div class="hcard__player hcard__player--a">${n}</div>`).join('')}
          </div>
          <div class="hcard__center">
            ${scoreHtml}
          </div>
          <div class="hcard__team-col hcard__team-col--b">
            <div class="hcard__team-label hcard__team-label--b">EQUIPO B ●</div>
            ${playersB.map(n => `<div class="hcard__player hcard__player--b">${n}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const render = () => {
    const panel = document.getElementById('panel-historial');
    if (!matches.length) {
      panel.innerHTML = `<p class="historial-empty">No hay partidos registrados.</p>`;
      return;
    }

    panel.innerHTML = `
      <div class="historial-list">
        ${matches.map(renderCard).join('')}
      </div>

      <!-- Modal score -->
      <div class="modal" id="scoreModal">
        <div class="modal__content">
          <button class="modal__close" id="scoreClose">✕</button>
          <h2>Cargar resultado</h2>
          <div class="score-inputs">
            <label>Equipo A <input type="number" id="scoreA" min="0" max="99" class="score-input" /></label>
            <label>Equipo B <input type="number" id="scoreB" min="0" max="99" class="score-input" /></label>
          </div>
          <button class="btn btn--primary" id="scoreSubmit" style="margin-top:16px;width:100%">Guardar resultado</button>
        </div>
      </div>
    `;

    let editingMatchId = null;

    document.getElementById('scoreClose').addEventListener('click', () => {
      document.getElementById('scoreModal').classList.remove('open');
    });

    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('.historial-score-btn');
      if (!btn) return;
      editingMatchId = btn.dataset.id;
      document.getElementById('scoreA').value = '';
      document.getElementById('scoreB').value = '';
      document.getElementById('scoreModal').classList.add('open');
    });

    document.getElementById('scoreSubmit').addEventListener('click', async () => {
      const a = +document.getElementById('scoreA').value;
      const b = +document.getElementById('scoreB').value;
      if (isNaN(a) || isNaN(b)) return;
      const btn = document.getElementById('scoreSubmit');
      btn.disabled = true;
      btn.textContent = 'Guardando...';
      try {
        await MatchesService.updateScore(editingMatchId, a, b);
        document.getElementById('scoreModal').classList.remove('open');
        await load();
      } catch (err) {
        console.error('Error guardando resultado:', err);
        btn.disabled = false;
        btn.textContent = 'Guardar resultado';
      }
    });
  };

  const load = async () => {
    try {
      matches = await MatchesService.getAll();
      render();
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  return { load };
})();
