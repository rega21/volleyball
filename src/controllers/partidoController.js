gsap.registerPlugin(Flip);

const PartidoController = (() => {
  let allPlayers = [];
  let ratingsMap = {};
  let selected = new Set();
  let modo = 'balanceado';
  let manualAssign = {}; // id → 'A' | 'B' | null

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

  // ── Render lista ──────────────────────────────────────
  const renderList = () => {
    document.getElementById('selectedCount').textContent = `${selected.size} / ${allPlayers.length}`;
    document.getElementById('playerChips').innerHTML = allPlayers.map(p => {
      const active = selected.has(p.id);
      const _pp = p.player_positions;
      const positions = (Array.isArray(_pp) ? _pp : (_pp ? [_pp] : []))
        .map(pos => pos.positions?.name.replace(/\s*\(.*?\)/, '') || '')
        .filter(Boolean)
        .join(' · ');
      return `
        <button class="partido-row ${active ? 'partido-row--active' : ''}" data-id="${p.id}">
          <span class="partido-row__name">
            ${p.nickname || p.name}
            ${positions ? `<span class="partido-row__pos"> · ${positions}</span>` : ''}
          </span>
          <span class="partido-row__check ${active ? 'partido-row__check--active' : ''}">
            ${active ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
          </span>
        </button>
      `;
    }).join('');
    const canGenerate = selected.size >= 2;
    document.getElementById('armarBalanceadoBtn').disabled = !canGenerate;
    document.getElementById('armarManualBtn').disabled = !canGenerate;
  };

  // ── Render manual ────────────────────────────────────
  const renderManual = () => {
    const players = allPlayers.filter(p => selected.has(p.id));
    manualAssign = {};
    players.forEach(p => manualAssign[p.id] = null);

    const updateCounter = () => {
      const a = Object.values(manualAssign).filter(v => v === 'A').length;
      const b = Object.values(manualAssign).filter(v => v === 'B').length;
      document.getElementById('manualCounter').textContent = `A: ${a} - B: ${b}`;
      const total = players.length;
      document.getElementById('confirmarManualBtn').disabled = (a + b) < total;
    };

    document.getElementById('manualList').innerHTML = players.map(p => `
      <div class="manual-row" data-id="${p.id}">
        <span class="manual-row__name">${p.nickname || p.name}</span>
        <div class="manual-row__btns">
          <button class="manual-btn" data-team="A" data-id="${p.id}">● A</button>
          <button class="manual-btn" data-team="B" data-id="${p.id}">● B</button>
        </div>
      </div>
    `).join('');

    document.getElementById('manualList').addEventListener('click', (e) => {
      const btn = e.target.closest('.manual-btn');
      if (!btn) return;
      const { id, team } = btn.dataset;
      manualAssign[id] = team;
      document.querySelectorAll(`.manual-btn[data-id="${id}"]`).forEach(b => {
        b.classList.toggle('manual-btn--active', b.dataset.team === team);
      });
      updateCounter();
    });

    updateCounter();
    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-manual').style.display = 'block';
    document.getElementById('partidoActions').style.display = 'none';
  };

  const confirmarManual = () => {
    const teamA = allPlayers.filter(p => manualAssign[p.id] === 'A');
    const teamB = allPlayers.filter(p => manualAssign[p.id] === 'B');

    const renderTeamList = (team) => team.map(p => {
      const rd = ratingsMap[p.id];
      const score = getScore(p).toFixed(1);
      const rating = rd?.avg ? `<span class="equipo__rating">⭐ ${score}</span>` : '';
      return `<li class="equipo__player">${p.nickname || p.name} ${rating}</li>`;
    }).join('');

    document.getElementById('equipoA').innerHTML = renderTeamList(teamA);
    document.getElementById('equipoB').innerHTML = renderTeamList(teamB);
    document.getElementById('equipos-aviso').style.display = 'none';
    document.getElementById('paso-manual').style.display = 'none';
    document.getElementById('paso-equipos').style.display = 'flex';
  };

  // ── Render equipos ────────────────────────────────────
  let teamA = [], teamB = [];
  let swapSelected = null; // { id, team }

  const renderTeamList = (team, teamName) => team.map(p => {
    const rd = ratingsMap[p.id];
    const score = getScore(p).toFixed(1);
    const rating = rd?.avg ? `<span class="equipo__rating">⭐ ${score}</span>` : '';
    const isSelected = swapSelected?.id === p.id;
    const _pp2 = p.player_positions;
    const pos = (Array.isArray(_pp2) ? _pp2 : (_pp2 ? [_pp2] : []))
      .map(pp => pp.positions?.name.replace(/\s*\(.*?\)/, '') || '')
      .filter(Boolean)[0] || '';
    return `<li class="equipo__player ${isSelected ? 'equipo__player--selected' : ''}"
               data-id="${p.id}" data-team="${teamName}" data-flip-id="${p.id}">
              <span class="equipo__name">${p.nickname || p.name}${pos ? `<span class="equipo__pos"> · ${pos}</span>` : ''}</span>
              ${rating}
            </li>`;
  }).join('');

  const renderEquipos = (animate = false, swappedIds = []) => {
    if (animate) {
      const listA = document.getElementById('equipoA');
      const listB = document.getElementById('equipoB');
      const state = Flip.getState([...listA.children, ...listB.children]);
      listA.innerHTML = renderTeamList(teamA, 'A');
      listB.innerHTML = renderTeamList(teamB, 'B');
      Flip.from(state, {
        targets: [...listA.children, ...listB.children],
        duration: 0.6,
        ease: 'power2.inOut',
        scale: true,
        onComplete: () => {
          swappedIds.forEach(pid => {
            const el = document.querySelector(`.equipo__player[data-id="${pid}"]`);
            if (el) {
              gsap.fromTo(el,
                { backgroundColor: 'rgba(16,185,129,0.35)' },
                { backgroundColor: 'transparent', duration: 0.8, ease: 'power2.out' }
              );
            }
          });
        }
      });
    } else {
      document.getElementById('equipoA').innerHTML = renderTeamList(teamA, 'A');
      document.getElementById('equipoB').innerHTML = renderTeamList(teamB, 'B');
    }
  };

  const renderTeams = () => {
    const players = allPlayers.filter(p => selected.has(p.id));

    if (players.length > 14) {
      document.getElementById('equipos-aviso').textContent =
        `⚠️ Son ${players.length} jugadores — se necesita tercer equipo (próximamente).`;
      document.getElementById('equipos-aviso').style.display = 'block';
    } else {
      document.getElementById('equipos-aviso').style.display = 'none';
    }

    const jugadoresPartido = players.slice(0, 14);
    const balanced = balanceTeams(jugadoresPartido);
    teamA = balanced.teamA;
    teamB = balanced.teamB;
    swapSelected = null;
    renderEquipos();

    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-equipos').style.display = 'flex';
    document.getElementById('partidoActions').style.display = 'none';
  };

  // ── Init ──────────────────────────────────────────────
  const init = (players, ratings) => {
    allPlayers = players;
    ratingsMap = ratings;
    renderList();

    document.getElementById('playerChips').addEventListener('click', (e) => {
      const row = e.target.closest('.partido-row');
      if (!row) return;
      const id = row.dataset.id;
      selected.has(id) ? selected.delete(id) : selected.add(id);
      renderList();
    });

    document.getElementById('modoToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('.modo-toggle__btn');
      if (!btn) return;
      modo = btn.dataset.modo;
      document.querySelectorAll('.modo-toggle__btn').forEach(b =>
        b.classList.toggle('modo-toggle__btn--active', b.dataset.modo === modo)
      );
      document.getElementById('armarBalanceadoBtn').style.display = modo === 'balanceado' ? 'block' : 'none';
      document.getElementById('armarManualBtn').style.display = modo === 'manual' ? 'block' : 'none';
    });

    // Swap de jugadores entre equipos
    document.getElementById('paso-equipos').addEventListener('click', (e) => {
      const li = e.target.closest('.equipo__player');
      if (!li) return;
      const id = li.dataset.id;
      const team = li.dataset.team;

      if (!swapSelected) {
        swapSelected = { id, team };
        renderEquipos();
        return;
      }

      if (swapSelected.id === id) {
        swapSelected = null;
        renderEquipos();
        return;
      }

      if (swapSelected.team !== team) {
        // Swap entre equipos distintos
        const srcList = swapSelected.team === 'A' ? teamA : teamB;
        const dstList = swapSelected.team === 'A' ? teamB : teamA;
        const srcIdx = srcList.findIndex(p => p.id === swapSelected.id);
        const dstIdx = dstList.findIndex(p => p.id === id);
        const tmp = srcList[srcIdx];
        srcList[srcIdx] = dstList[dstIdx];
        dstList[dstIdx] = tmp;
      }

      const swapId = swapSelected.id;
      swapSelected = null;
      renderEquipos(true, [id, swapId]);
    });

    document.getElementById('armarBalanceadoBtn').addEventListener('click', renderTeams);
    document.getElementById('armarManualBtn').addEventListener('click', renderManual);
    document.getElementById('confirmarManualBtn').addEventListener('click', confirmarManual);
    document.getElementById('manualBackBtn').addEventListener('click', () => {
      document.getElementById('paso-manual').style.display = 'none';
      document.getElementById('paso-seleccion').style.display = 'block';
      document.getElementById('partidoActions').style.display = 'flex';
    });

    document.getElementById('confirmarPartidoBtn').addEventListener('click', async () => {
      const btn = document.getElementById('confirmarPartidoBtn');
      btn.disabled = true;
      btn.textContent = 'Guardando...';
      try {
        await MatchesService.save(teamA, teamB);
        btn.textContent = '✓ Guardado';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.textContent = 'Confirmar partido';
          btn.style.background = '';
          btn.disabled = false;
          TabController.switchTab('historial');
        }, 1000);
      } catch (err) {
        console.error('Error guardando partido:', err);
        btn.textContent = 'Error al guardar';
        btn.disabled = false;
      }
    });

    document.getElementById('resetPartidoBtn').addEventListener('click', () => {
      document.getElementById('paso-seleccion').style.display = 'block';
      document.getElementById('paso-equipos').style.display = 'none';
      document.getElementById('paso-manual').style.display = 'none';
      document.getElementById('partidoActions').style.display = 'flex';
    });
  };

  const refresh = (players, ratings) => {
    allPlayers = players;
    ratingsMap = ratings;
    document.getElementById('partidoActions').style.display = 'flex';
    renderList();
  };

  const hide = () => {
    document.getElementById('partidoActions').style.display = 'none';
  };

  const startRevancha = (idsA, idsB) => {
    teamA = allPlayers.filter(p => idsA.includes(p.id));
    teamB = allPlayers.filter(p => idsB.includes(p.id));
    swapSelected = null;
    renderEquipos();
    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-manual').style.display = 'none';
    document.getElementById('paso-equipos').style.display = 'flex';
    document.getElementById('partidoActions').style.display = 'none';
    document.getElementById('equipos-aviso').style.display = 'none';
  };

  return { init, refresh, hide, startRevancha };
})();
