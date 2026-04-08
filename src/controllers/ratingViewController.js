const RatingViewController = (() => {
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
    recepcion: '#F97316',
    movilidad: '#F1C40F',
    tecnica:   '#9B59B6',
  };

  let radarInstance = null;
  let playersList = []; // solo jugadores con avg
  let ratingsMap = {};
  let currentIndex = 0;

  const getDominantColor = (avg) => {
    const dominant = STATS.reduce((a, b) => avg[a] >= avg[b] ? a : b);
    return STAT_COLORS[dominant];
  };

  const renderDots = (total, active) => {
    return Array.from({ length: total }, (_, i) =>
      `<span class="ratingview-dot ${i === active ? 'ratingview-dot--active' : ''}"></span>`
    ).join('');
  };

  const loadPlayer = (index) => {
    currentIndex = index;
    const player = playersList[index];
    const avg = ratingsMap[player.id].avg;
    const overall = +(STATS.reduce((sum, s) => sum + avg[s], 0) / STATS.length).toFixed(1);

    document.getElementById('ratingViewScore').textContent = `⭐ ${overall}`;

    const trendEl = document.getElementById('ratingViewTrend');
    if (overall >= 5) {
      trendEl.textContent = '▲';
      trendEl.className = 'ratingview-trend ratingview-trend--up';
    } else {
      trendEl.textContent = '▼';
      trendEl.className = 'ratingview-trend ratingview-trend--down';
    }

    document.getElementById('ratingViewName').textContent = player.nickname || player.name;
    document.getElementById('ratingViewDots').innerHTML = renderDots(playersList.length, index);

    const data = STATS.map(s => avg[s]);
    const color = getDominantColor(avg);

    if (radarInstance) {
      radarInstance.data.datasets[0].data = data;
      radarInstance.data.datasets[0].borderColor = color;
      radarInstance.data.datasets[0].backgroundColor = color + '33';
      radarInstance.data.datasets[0].pointBackgroundColor = color;
      radarInstance.update('none');
      return;
    }

    const ctx = document.getElementById('radarViewChart').getContext('2d');
    radarInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: STATS.map(s => STAT_LABELS[s]),
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color + '33',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: color,
        }],
      },
      options: {
        animation: false,
        scales: {
          r: {
            min: 0, max: 10,
            ticks: { display: false, stepSize: 1 },
            grid: { color: 'rgba(128,128,128,0.2)' },
            pointLabels: {
              color: '#cccccc',
              font: { size: 13 },
            },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  const open = (allPlayers, map, startPlayerId) => {
    ratingsMap = map;
    playersList = allPlayers.filter(p => map[p.id]?.avg);
    if (!playersList.length) return;
    const idx = playersList.findIndex(p => p.id === startPlayerId);
    currentIndex = idx >= 0 ? idx : 0;
    document.getElementById('ratingViewModal').classList.add('open');
    if (radarInstance) { radarInstance.destroy(); radarInstance = null; }
    document.getElementById('ratingViewDots').innerHTML = renderDots(playersList.length, currentIndex);
    loadPlayer(currentIndex);
  };

  const close = () => {
    document.getElementById('ratingViewModal').classList.remove('open');
    if (radarInstance) { radarInstance.destroy(); radarInstance = null; }
  };

  const init = () => {
    document.getElementById('ratingViewClose').addEventListener('click', close);

    document.getElementById('ratingViewPrev').addEventListener('click', () => {
      loadPlayer((currentIndex - 1 + playersList.length) % playersList.length);
    });
    document.getElementById('ratingViewNext').addEventListener('click', () => {
      loadPlayer((currentIndex + 1) % playersList.length);
    });

    // Swipe táctil
    const content = document.querySelector('#ratingViewModal .modal__content');
    let touchStartX = 0;
    content.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    content.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      if (diff > 0) loadPlayer((currentIndex + 1) % playersList.length);
      else loadPlayer((currentIndex - 1 + playersList.length) % playersList.length);
    }, { passive: true });
  };

  return { init, open };
})();
