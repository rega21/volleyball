const SupabaseClient = (() => {
  const SUPABASE_URL = 'https://kpwathaltidbgowvgzma.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd2F0aGFsdGlkYmdvd3Znem1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjkzMTIsImV4cCI6MjA5MDA0NTMxMn0.GVK1AozXTTbcxoQ-GLV7PAxZjG-2sF1qYMNaoUH--Pw';

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  return { client };
})();
