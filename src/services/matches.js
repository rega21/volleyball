const MatchesService = (() => {
  const db = SupabaseClient.client;

  const getAll = async () => {
    const { data, error } = await db
      .from('matches')
      .select(`
        id, category, played_at, score_a, score_b, score_c,
        match_players ( player_id, team, players ( name, nickname ) )
      `)
      .order('played_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  const updateScore = async (id, score_a, score_b, score_c = null) => {
    const { error } = await db
      .from('matches')
      .update({ score_a, score_b, score_c })
      .eq('id', id);
    if (error) throw error;
  };

  const save = async (teamA, teamB, category = 'lawn') => {
    const { data: match, error } = await db
      .from('matches')
      .insert({ category })
      .select()
      .single();

    if (error) throw error;

    const rows = [
      ...teamA.map(p => ({ match_id: match.id, player_id: p.id, team: 'A' })),
      ...teamB.map(p => ({ match_id: match.id, player_id: p.id, team: 'B' })),
    ];

    const { error: mpError } = await db.from('match_players').insert(rows);
    if (mpError) throw mpError;

    return match;
  };

  return { save, getAll, updateScore };
})();
