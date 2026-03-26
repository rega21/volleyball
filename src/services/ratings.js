const RatingsService = (() => {
  const db = SupabaseClient.client;
  const STATS = ['remate', 'defensa', 'saque', 'recepcion', 'movilidad', 'tecnica'];
  const MIN_VOTES = 4;

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

  // Verifica si el voter ya votó a este jugador
  const hasVoted = async (playerId) => {
    const voterId = getVoterId();
    const { data } = await db
      .from('ratings')
      .select('id')
      .eq('player_id', playerId)
      .eq('voter_id', voterId)
      .maybeSingle();
    return !!data;
  };

  // Envía un voto
  const vote = async (playerId, stats) => {
    const voterId = getVoterId();
    const { error } = await db.from('ratings').insert({
      player_id: playerId,
      voter_id: voterId,
      ...stats
    });
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

  return { getAverages, getAllAverages, hasVoted, vote, STATS, MIN_VOTES };
})();
