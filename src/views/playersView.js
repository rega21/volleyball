const PlayersView = (() => {
  const list = document.getElementById('playerList');

  const renderRating = (ratingData) => {
    if (!ratingData) return '<span class="rating-badge">⭐ xx</span>';
    if (!ratingData.avg) return `<span class="rating-badge">⭐ xx <small>(${ratingData.voteCount}/${RatingsService.MIN_VOTES})</small></span>`;
    const overall = +(Object.values(ratingData.avg).reduce((a, b) => a + b, 0) / RatingsService.STATS.length).toFixed(1);
    return `<span class="rating-badge rating-badge--active">⭐ ${overall}</span>`;
  };

  const renderCard = (player, ratingData) => {
    const positions = player.player_positions
      ?.map(p => `<span class="badge">${p.positions.name}</span>`)
      .join('') || '';

    return `
      <div class="player-card" data-id="${player.id}">
        <div class="player-card__info">
          <div class="player-card__name">${player.name}
            ${player.nickname ? `<span class="player-card__nickname">"${player.nickname}"</span>` : ''}
          </div>
          <div class="player-card__meta">
            ${renderRating(ratingData)}
            ${positions}
          </div>
        </div>
        <div class="player-card__actions">
          <button class="btn-vote" data-id="${player.id}">VOTAR</button>
          <button class="btn-edit" data-id="${player.id}" aria-label="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
    `;
  };

  const render = (players, ratingsMap = {}) => {
    if (!players.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:32px 0">Sin jugadores</p>';
      return;
    }
    list.innerHTML = players.map(p => renderCard(p, ratingsMap[p.id])).join('');
  };

  const renderEmpty = (msg = 'Sin resultados') => {
    list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0">${msg}</p>`;
  };

  return { render, renderEmpty };
})();
