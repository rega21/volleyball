const RatingsController = (() => {
  const STATS = RatingsService.STATS;

  const STAT_LABELS = {
    remate:    'Ataque',
    defensa:   'Defensa',
    saque:     'Saque',
    recepcion: 'Armado',
    movilidad: 'Movilidad',
    tecnica:   'Técnica',
  };

  const STAT_COLORS = {
    remate:    '#FF4C4C',
    defensa:   '#00E5FF',
    saque:     '#2ECC71',
    recepcion: '#F1C40F',
    movilidad: '#F97316',
    tecnica:   '#9B59B6',
  };

  let radarInstance = null;
  let currentPlayerId = null;
  let onVoteCallback = null;
  let playersList = [];
  let currentIndex = 0;
  let currentVotesMap = {};

  // ── Slider helpers ────────────────────────────────────
  const getStatValues = () => {
    const vals = {};
    STATS.forEach(s => { vals[s] = +document.getElementById(`slider-${s}`).value; });
    return vals;
  };

  const getDominantColor = (vals) => {
    const dominant = STATS.reduce((a, b) => vals[a] >= vals[b] ? a : b);
    return STAT_COLORS[dominant];
  };

  const colorSlider = (stat, color) => {
    const el = document.getElementById(`slider-${stat}`);
    const pct = (el.value / el.max) * 100;
    el.style.background = `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`;
  };

  const updateRadar = (vals) => {
    const color = getDominantColor(vals);
    const data = STATS.map(s => vals[s]);

    STATS.forEach(s => colorSlider(s, STAT_COLORS[s]));

    if (radarInstance) {
      radarInstance.data.datasets[0].data = data;
      radarInstance.data.datasets[0].borderColor = color;
      radarInstance.data.datasets[0].backgroundColor = color + '33';
      radarInstance.update('none');
      return;
    }

    const ctx = document.getElementById('radarChart').getContext('2d');
    radarInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: STATS.map(s => STAT_LABELS[s]),
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color + '33',
          borderWidth: 2,
          pointBackgroundColor: color,
          pointRadius: 3,
        }],
      },
      options: {
        animation: false,
        scales: {
          r: {
            min: 0, max: 10,
            ticks: { display: false, stepSize: 2 },
            grid: { color: 'rgba(128,128,128,0.2)' },
            pointLabels: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
              font: { size: 11 },
            },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  // ── Render sliders ────────────────────────────────────
  const renderSliders = (existingVote = null) => {
    document.getElementById('ratingSliders').innerHTML = STATS.map(s => {
      const val = existingVote ? existingVote[s] : 0;
      return `
        <div class="slider-row">
          <span class="slider-label">${STAT_LABELS[s]}</span>
          <input type="range" id="slider-${s}" min="0" max="10" value="${val}" class="slider" />
          <span class="slider-value" id="val-${s}">${val}</span>
        </div>
      `;
    }).join('');

    STATS.forEach(s => {
      document.getElementById(`slider-${s}`).addEventListener('input', () => {
        document.getElementById(`val-${s}`).textContent = document.getElementById(`slider-${s}`).value;
        updateRadar(getStatValues());
      });
    });

    updateRadar(getStatValues());
  };

  // ── Abrir modal ───────────────────────────────────────
  const loadPlayer = (index) => {
    currentIndex = index;
    const player = playersList[index];
    const existingVote = currentVotesMap[player.id] || null;

    currentPlayerId = player.id;
    document.getElementById('ratingPlayerName').textContent = player.nickname || player.name;
    document.getElementById('ratingAlreadyVoted').style.display = 'none';
    document.getElementById('ratingSubmit').style.display = 'block';
    document.getElementById('ratingSliders').style.display = 'block';
    document.getElementById('ratingSubmit').textContent = existingVote ? 'Actualizar voto' : 'Enviar voto';

    if (radarInstance) { radarInstance.destroy(); radarInstance = null; }
    renderSliders(existingVote);
  };

  const open = (players, index, votesMap) => {
    playersList = players;
    currentIndex = index;
    currentVotesMap = votesMap;

    document.getElementById('ratingModal').classList.add('open');
    loadPlayer(index);
  };

  const close = () => {
    document.getElementById('ratingModal').classList.remove('open');
    currentPlayerId = null;
  };

  // ── Init ──────────────────────────────────────────────
  const init = (onVote) => {
    onVoteCallback = onVote;

    document.getElementById('ratingClose').addEventListener('click', close);

    document.getElementById('ratingPrev').addEventListener('click', () => {
      const prev = (currentIndex - 1 + playersList.length) % playersList.length;
      loadPlayer(prev);
    });

    document.getElementById('ratingNext').addEventListener('click', () => {
      const next = (currentIndex + 1) % playersList.length;
      loadPlayer(next);
    });

    // ── Swipe táctil (excluye sliders) ───────────────────
    let touchStartX = 0;
    const modalContent = document.querySelector('#ratingModal .modal__content');
    modalContent.addEventListener('touchstart', (e) => {
      if (e.target.closest('#ratingSliders')) return;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    modalContent.addEventListener('touchend', (e) => {
      if (e.target.closest('#ratingSliders')) return;
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      if (diff > 0) {
        loadPlayer((currentIndex + 1) % playersList.length);
      } else {
        loadPlayer((currentIndex - 1 + playersList.length) % playersList.length);
      }
    }, { passive: true });

    document.getElementById('ratingSubmit').addEventListener('click', async () => {
      if (!currentPlayerId) return;
      const btn = document.getElementById('ratingSubmit');
      try {
        const vals = getStatValues();
        await RatingsService.vote(currentPlayerId, vals);
        currentVotesMap[currentPlayerId] = vals;
        btn.textContent = '✓ Guardado';
        btn.style.background = '#059669';
        if (onVoteCallback) onVoteCallback();
        setTimeout(() => {
          btn.textContent = 'Actualizar voto';
          btn.style.background = '';
        }, 1500);
      } catch (err) {
        console.error('Error enviando voto:', err);
      }
    });
  };

  return { init, open };
})();
