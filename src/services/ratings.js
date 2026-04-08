const RatingsService = (() => {
  const db = SupabaseClient.client;
  const STATS = ['remate', 'defensa', 'saque', 'recepcion', 'movilidad', 'tecnica'];
  const MIN_VOTES = 1;

  // Obtiene o genera el voter_id anónimo
  const getVoterId = () => {
    let id = localStorage.getItem('voter_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('voter_id', id);
    }
    return id;
  };

  // Promedio de ratings para un jugador (solo si tiene >= MIN_VOTES)
  const getAverages = async (playerId) => {
    const { data, error } = await db
      .from('ratings')
      .select('remate, defensa, saque, recepcion, movilidad, tecnica')
      .eq('player_id', playerId);

    if (error) throw error;
    if (data.length < MIN_VOTES) return null;

    const avg = {};
    STATS.forEach(stat => {
      avg[stat] = Math.round(data.reduce((sum, r) => sum + r[stat], 0) / data.length);
    });
    avg.voteCount = data.length;
    return avg;
  };

  // Trae todos los player_ids que ya votó este voter
  const getMyVotedIds = async () => {
    const voterId = getVoterId();
    const { data, error } = await db
      .from('ratings')
      .select('player_id, remate, defensa, saque, recepcion, movilidad, tecnica')
      .eq('voter_id', voterId);
    if (error) throw error;
    const map = {};
    data.forEach(r => { map[r.player_id] = r; });
    return map;
  };

  // Verifica si el voter ya votó a este jugador
  const hasVoted = async (playerId) => {
    const voted = await getMyVotedIds();
    return !!voted[playerId];
  };

  // Envía o actualiza un voto (upsert)
  const vote = async (playerId, stats) => {
    const voterId = getVoterId();
    const { error } = await db.from('ratings').upsert({
      player_id: playerId,
      voter_id: voterId,
      ...stats
    }, { onConflict: 'player_id,voter_id' });
    if (error) throw error;
  };

  // Promedios de todos los jugadores en una sola query
  const getAllAverages = async () => {
    const { data, error } = await db
      .from('ratings')
      .select('player_id, remate, defensa, saque, recepcion, movilidad, tecnica');
    if (error) throw error;

    const grouped = {};
    data.forEach(r => {
      if (!grouped[r.player_id]) grouped[r.player_id] = [];
      grouped[r.player_id].push(r);
    });

    const result = {};
    Object.entries(grouped).forEach(([playerId, votes]) => {
      if (votes.length < MIN_VOTES) {
        result[playerId] = { voteCount: votes.length, avg: null };
        return;
      }
      const avg = {};
      STATS.forEach(stat => {
        avg[stat] = +(votes.reduce((sum, r) => sum + r[stat], 0) / votes.length).toFixed(1);
      });
      result[playerId] = { voteCount: votes.length, avg };
    });

    return result;
  };

  return { getAverages, getAllAverages, getMyVotedIds, hasVoted, vote, STATS, MIN_VOTES };
})();
