import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://mnsahfayfvlywgkunios.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc2FoZmF5ZnZseXdna3VuaW9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg4OTMxMSwiZXhwIjoyMTA3NDY1MzExfQ.8ZxfjVJAvTGsG7QU7mIN29tExjcdl-KBoA1TReIE7uM';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc2FoZmF5ZnZseXdna3VuaW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODkzMTEsImV4cCI6MjEwNzQ2NTMxMX0.7vrVdFOUZ9jjEeLY_fJ7E85SpisYhYOEnGa_DB7phiA';

let serverClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('your-project.supabase.co'));
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!serverClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const key = serviceRoleKey || anonKey;

    serverClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverClient;
}
