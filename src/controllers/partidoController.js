const PartidoController = (() => {
  let allPlayers = [];
  let ratingsMap = {};
  let selected = new Set();

  // ── Balanceo snake draft ──────────────────────────────
  const getScore = (player) => {
    const rd = ratingsMap[player.id];
    if (!rd?.avg) return 5;
    const vals = Object.values(rd.avg);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const balanceTeams = (players) => {
    const sorted = [...players].sort((a, b) => getScore(b) - getScore(a));
    const teamA = [], teamB = [];
    sorted.forEach((p, i) => {
      // Snake: A, B, B, A, A, B, B, A...
      const round = Math.floor(i / 2);
      const isA = round % 2 === 0 ? i % 2 === 0 : i % 2 !== 0;
      isA ? teamA.push(p) : teamB.push(p);
    });
    return { teamA, teamB };
  };

  // ── Render chips ──────────────────────────────────────
  const renderChips = () => {
    document.getElementById('playerChips').innerHTML = allPlayers.map(p => `
      <button class="player-chip ${selected.has(p.id) ? 'player-chip--active' : ''}"
              data-id="${p.id}">
        ${p.name}${p.nickname ? ` <span>"${p.nickname}"</span>` : ''}
      </button>
    `).join('');
    updateFooter();
  };

  const updateFooter = () => {
    const footer = document.getElementById('partidoFooter');
    const count = document.getElementById('selectedCount');
    footer.style.display = selected.size >= 2 ? 'flex' : 'none';
    count.textContent = `${selected.size} jugadores`;
  };

  // ── Render equipos ────────────────────────────────────
  const renderTeams = () => {
    const players = allPlayers.filter(p => selected.has(p.id));
    const { teamA, teamB } = balanceTeams(players);

    const renderList = (team) => team.map(p => {
      const score = getScore(p).toFixed(1);
      const rd = ratingsMap[p.id];
      const rating = rd?.avg ? `<span class="equipo__rating">⭐ ${score}</span>` : '';
      return `<li class="equipo__player">${p.name} ${rating}</li>`;
    }).join('');

    document.getElementById('equipoA').innerHTML = renderList(teamA);
    document.getElementById('equipoB').innerHTML = renderList(teamB);

    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-equipos').style.display = 'block';
  };

  // ── Init ──────────────────────────────────────────────
  const init = (players, ratings) => {
    allPlayers = players;
    ratingsMap = ratings;
    renderChips();

    document.getElementById('playerChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.player-chip');
      if (!chip) return;
      const id = chip.dataset.id;
      selected.has(id) ? selected.delete(id) : selected.add(id);
      chip.classList.toggle('player-chip--active');
      updateFooter();
    });

    document.getElementById('armarEquiposBtn').addEventListener('click', renderTeams);

    document.getElementById('resetPartidoBtn').addEventListener('click', () => {
      document.getElementById('paso-seleccion').style.display = 'block';
      document.getElementById('paso-equipos').style.display = 'none';
    });
  };

  const refresh = (players, ratings) => {
    allPlayers = players;
    ratingsMap = ratings;
    renderChips();
  };

  return { init, refresh };
})();
