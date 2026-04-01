const PlayersService = (() => {
  const db = SupabaseClient.client;

  const getAll = async () => {
    const { data, error } = await db
      .from('players')
      .select(`
        id, name, nickname, created_at,
        player_positions ( position_id, positions ( name, slug ) )
      `)
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return data;
  };

  const getById = async (id) => {
    const { data, error } = await db
      .from('players')
      .select(`
        id, name, nickname, created_at,
        player_positions ( position_id, positions ( name, slug ) )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  };

  const create = async ({ name, nickname, positionIds }) => {
    const { data: player, error } = await db
      .from('players')
      .insert({ name, nickname: nickname || null })
      .select()
      .single();

    if (error) throw error;

    if (positionIds?.length) {
      const rows = positionIds.map(position_id => ({ player_id: player.id, position_id }));
      const { error: posError } = await db.from('player_positions').insert(rows);
      if (posError) throw posError;
    }

    return player;
  };

  const update = async (id, { name, nickname, positionIds }) => {
    const { error } = await db
      .from('players')
      .update({ name, nickname: nickname || null })
      .eq('id', id);
    if (error) throw error;

    // Actualiza posición con upsert (atómico, sin DELETE intermedio)
    if (positionIds?.length) {
      const { error: posError } = await db.from('player_positions').upsert(
        { player_id: id, position_id: positionIds[0] },
        { onConflict: 'player_id' }
      );
      if (posError) throw posError;
    }
  };

  const getPositions = async () => {
    const { data, error } = await db.from('positions').select('id, name, slug').order('id');
    if (error) throw error;
    return data;
  };

  return { getAll, getById, create, update, getPositions };
})();
