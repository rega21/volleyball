const PlayersView = (() => {
  const list = document.getElementById('playerList');

  const renderRating = (ratingData) => {
    if (!ratingData) return '<span class="rating-badge">☆ Pendiente</span>';
    if (!ratingData.avg) return '<span class="rating-badge">☆ Pendiente</span>';
    const overall = +(Object.values(ratingData.avg).reduce((a, b) => a + b, 0) / RatingsService.STATS.length).toFixed(1);
    return `<span class="rating-badge rating-badge--active">⭐ ${overall}</span>`;
  };

  const renderCard = (player, ratingData, myVote) => {
    const actionBtn = myVote
      ? `<button class="btn-card btn-card--edit" data-id="${player.id}" aria-label="Editar voto">
           ACTUALIZAR
         </button>`
      : `<button class="btn-card btn-card--vote" data-id="${player.id}" aria-label="Votar">
           CALIFICAR
         </button>`;

    return `
      <div class="player-card" data-id="${player.id}">
        <div class="player-card__info" data-edit-id="${player.id}">
          <div class="player-card__name">${player.name}
            ${player.nickname ? `<span class="player-card__nickname">"${player.nickname}"</span>` : ''}
          </div>
          <div class="player-card__meta">
            ${renderRating(ratingData)}
          </div>
        </div>
        <div class="player-card__actions">
          ${actionBtn}
        </div>
      </div>
    `;
  };

  const render = (players, ratingsMap = {}, myVotedMap = {}) => {
    if (!players.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:32px 0">Sin jugadores</p>';
      return;
    }
    list.innerHTML = players.map(p => renderCard(p, ratingsMap[p.id], myVotedMap[p.id])).join('');
  };

  const renderEmpty = (msg = 'Sin resultados') => {
    list.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0">${msg}</p>`;
  };

  return { render, renderEmpty };
})();
