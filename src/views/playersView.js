const PlayersView = (() => {
  const list = document.getElementById('playerList');

  const renderRating = (ratingData, playerId) => {
    if (!ratingData?.avg) return '<span class="rating-badge">★ Pendiente</span>';
    const overall = +(RatingsService.STATS.reduce((sum, s) => sum + ratingData.avg[s], 0) / RatingsService.STATS.length).toFixed(1);
    const trend = overall >= 5
      ? '<span class="rating-trend rating-trend--up">▲</span>'
      : '<span class="rating-trend rating-trend--down">▼</span>';
    return `<button class="rating-badge rating-badge--active rating-badge--btn" data-view-id="${playerId}">★ ${overall} ${trend}</button>`;
  };

  const renderCard = (player, ratingData, myVote) => {
    const actionBtn = myVote
      ? `<button class="btn-card btn-card--edit" data-id="${player.id}" aria-label="Editar voto">
           ACTUALIZAR
         </button>`
      : `<button class="btn-card btn-card--vote" data-id="${player.id}" aria-label="Votar">
           CALIFICAR
         </button>`;

    const deleteBtn = AdminController.isAuthenticated()
      ? `<button class="btn-delete-player" data-id="${player.id}" aria-label="Borrar jugador">🗑️</button>`
      : '';

    return `
      <div class="player-card" data-id="${player.id}">
        <div class="player-card__info" data-edit-id="${player.id}">
          <div class="player-card__name">${player.name}
            ${player.nickname ? `<span class="player-card__nickname">"${player.nickname}"</span>` : ''}
          </div>
          <div class="player-card__meta">
            ${renderRating(ratingData, player.id)}
          </div>
        </div>
        <div class="player-card__actions">
          ${actionBtn}
          ${deleteBtn}
        </div>
      </div>
    `;
  };

  const render = (players, ratingsMap = {}, myVotedMap = {}) => {
    if (!players.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:32px 0">Sin jugadores</p>';
      return;
    }
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    list.innerHTML = shuffled.map(p => renderCard(p, ratingsMap[p.id], myVotedMap[p.id])).join('');
  };

  const renderEmpty = (msg = 'Sin resultados') => {
    list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0">${msg}</p>`;
  };

  return { render, renderEmpty };
})();
