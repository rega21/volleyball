const PlayersController = (() => {
  let allPlayers = [];
  let positions = [];
  let ratingsMap = {};
  let myVotedMap = {};
  let editingId = null;

  // ── Búsqueda ──────────────────────────────────────────
  const filter = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return PlayersView.render(allPlayers, ratingsMap, myVotedMap);
    const filtered = allPlayers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q)
    );
    filtered.length ? PlayersView.render(filtered, ratingsMap, myVotedMap) : PlayersView.renderEmpty();
  };

  const initSearch = () => {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');

    document.getElementById('searchBtn').addEventListener('click', () => {
      const visible = searchBar.style.display !== 'none';
      searchBar.style.display = visible ? 'none' : 'block';
      if (!visible) searchInput.focus();
      else { searchInput.value = ''; PlayersView.render(allPlayers, ratingsMap, myVotedMap); }
    });

    searchInput.addEventListener('input', (e) => filter(e.target.value));
  };

  // ── Modal editar jugador ──────────────────────────────
  const openModal = (player = null) => {
    editingId = player?.id || null;
    document.getElementById('addPlayerModal').querySelector('h2').textContent =
      player ? 'Editar jugador' : 'Agregar jugador';
    document.getElementById('playerName').value = player?.name || '';
    document.getElementById('playerNickname').value = player?.nickname || '';
    const currentPositionIds = player?.player_positions?.map(p => p.position_id) || [];
    document.querySelectorAll('#positionCheckboxes input').forEach(cb => {
      cb.checked = currentPositionIds.includes(+cb.value);
    });
    document.getElementById('addPlayerModal').classList.add('open');
  };

  const closeModal = () => {
    editingId = null;
    document.getElementById('addPlayerModal').classList.remove('open');
  };

  const renderPositionCheckboxes = () => {
    document.getElementById('positionCheckboxes').innerHTML = positions.map(p => `
      <label>
        <input type="checkbox" value="${p.id}" />
        ${p.name.replace(/\s*\(.*?\)/, '')}
      </label>
    `).join('');
  };

  const initModal = () => {
    document.getElementById('addPlayerBtn').addEventListener('click', () => openModal());
    document.getElementById('addPlayerClose').addEventListener('click', closeModal);

    document.getElementById('savePlayerBtn').addEventListener('click', async () => {
      const name = document.getElementById('playerName').value.trim();
      if (!name) return;
      const nickname = document.getElementById('playerNickname').value.trim();
      const positionIds = [...document.querySelectorAll('#positionCheckboxes input:checked')]
        .map(cb => +cb.value);
      try {
        if (editingId) {
          await PlayersService.update(editingId, { name, nickname, positionIds });
        } else {
          await PlayersService.create({ name, nickname, positionIds });
        }
        allPlayers = await PlayersService.getAll();
        PlayersView.render(allPlayers, ratingsMap, myVotedMap);
        closeModal();
      } catch (err) {
        console.error('Error guardando jugador:', err);
      }
    });
  };

  const refreshRatings = async () => {
    [ratingsMap, myVotedMap] = await Promise.all([
      RatingsService.getAllAverages(),
      RatingsService.getMyVotedIds(),
    ]);
    PlayersView.render(allPlayers, ratingsMap, myVotedMap);
  };

  // ── Init ──────────────────────────────────────────────
  let partidoCtrl = null;

  const init = async (partidoController = null) => {
    partidoCtrl = partidoController;
    try {
      [allPlayers, positions, ratingsMap, myVotedMap] = await Promise.all([
        PlayersService.getAll(),
        PlayersService.getPositions(),
        RatingsService.getAllAverages(),
        RatingsService.getMyVotedIds(),
      ]);
      PlayersView.render(allPlayers, ratingsMap, myVotedMap);
      renderPositionCheckboxes();
      if (partidoCtrl) partidoCtrl.init(allPlayers, ratingsMap);
    } catch (err) {
      console.error('Error cargando jugadores:', err);
      PlayersView.renderEmpty('Error al cargar jugadores');
    }

    initSearch();
    initModal();

    // Delegación para VOTAR y EDITAR voto
    document.getElementById('playerList').addEventListener('click', (e) => {
      const infoArea = e.target.closest('.player-card__info');
      if (infoArea) {
        const player = allPlayers.find(p => p.id === infoArea.dataset.editId);
        if (player) openModal(player);
        return;
      }
      const btn = e.target.closest('.btn-card');
      if (!btn) return;
      const player = allPlayers.find(p => p.id === btn.dataset.id);
      if (player) RatingsController.open(player, myVotedMap[player.id]);
    });

    RatingsController.init(refreshRatings);
  };

  return { init, getAllPlayers: () => allPlayers, getRatingsMap: () => ratingsMap };
})();
