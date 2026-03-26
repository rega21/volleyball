const PlayersController = (() => {
  let allPlayers = [];
  let positions = [];

  // ── Búsqueda ──────────────────────────────────────────
  const filter = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return PlayersView.render(allPlayers);
    const filtered = allPlayers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.nickname || '').toLowerCase().includes(q)
    );
    filtered.length ? PlayersView.render(filtered) : PlayersView.renderEmpty();
  };

  // ── Toggle barra de búsqueda ──────────────────────────
  const initSearch = () => {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');

    document.getElementById('searchBtn').addEventListener('click', () => {
      const visible = searchBar.style.display !== 'none';
      searchBar.style.display = visible ? 'none' : 'block';
      if (!visible) searchInput.focus();
      else { searchInput.value = ''; PlayersView.render(allPlayers); }
    });

    searchInput.addEventListener('input', (e) => filter(e.target.value));
  };

  // ── Modal agregar jugador ─────────────────────────────
  const openModal = () => {
    document.getElementById('playerName').value = '';
    document.getElementById('playerNickname').value = '';
    document.querySelectorAll('#positionCheckboxes input').forEach(cb => cb.checked = false);
    document.getElementById('addPlayerModal').classList.add('open');
  };

  const closeModal = () => {
    document.getElementById('addPlayerModal').classList.remove('open');
  };

  const renderPositionCheckboxes = () => {
    const container = document.getElementById('positionCheckboxes');
    container.innerHTML = positions.map(p => `
      <label>
        <input type="checkbox" value="${p.id}" />
        ${p.name}
      </label>
    `).join('');
  };

  const initModal = () => {
    document.getElementById('addPlayerBtn').addEventListener('click', openModal);
    document.getElementById('addPlayerClose').addEventListener('click', closeModal);

    document.getElementById('savePlayerBtn').addEventListener('click', async () => {
      const name = document.getElementById('playerName').value.trim();
      if (!name) return;

      const nickname = document.getElementById('playerNickname').value.trim();
      const positionIds = [...document.querySelectorAll('#positionCheckboxes input:checked')]
        .map(cb => +cb.value);

      try {
        await PlayersService.create({ name, nickname, positionIds });
        allPlayers = await PlayersService.getAll();
        PlayersView.render(allPlayers);
        closeModal();
      } catch (err) {
        console.error('Error guardando jugador:', err);
      }
    });
  };

  // ── Init ──────────────────────────────────────────────
  const init = async () => {
    try {
      [allPlayers, positions] = await Promise.all([
        PlayersService.getAll(),
        PlayersService.getPositions(),
      ]);
      PlayersView.render(allPlayers);
      renderPositionCheckboxes();
    } catch (err) {
      console.error('Error cargando jugadores:', err);
      PlayersView.renderEmpty('Error al cargar jugadores');
    }

    initSearch();
    initModal();
  };

  return { init };
})();
