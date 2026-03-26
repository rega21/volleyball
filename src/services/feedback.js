const FeedbackService = (() => {
  const db = SupabaseClient.client;

  const send = async (message) => {
    const { error } = await db.from('feedback').insert({ message });
    if (error) throw error;
  };

  return { send };
})();
