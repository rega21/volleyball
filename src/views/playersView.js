const PlayersView = (() => {
  const list = document.getElementById('playerList');

  const renderCard = (player) => {
    const positions = player.player_positions
      ?.map(p => `<span class="badge">${p.positions.name}</span>`)
      .join('') || '';

    return `
      <div class="player-card" data-id="${player.id}">
        <div class="player-card__name">${player.name}</div>
        ${player.nickname ? `<div class="player-card__nickname">"${player.nickname}"</div>` : ''}
        <div class="player-card__positions">${positions}</div>
      </div>
    `;
  };

  const render = (players) => {
    if (!players.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:32px 0">Sin jugadores</p>';
      return;
    }
    list.innerHTML = players.map(renderCard).join('');
  };

  const renderEmpty = (msg = 'Sin resultados') => {
    list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0">${msg}</p>`;
  };

  return { render, renderEmpty };
})();
