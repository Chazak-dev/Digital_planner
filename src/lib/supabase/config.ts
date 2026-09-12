const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether real Supabase credentials have been provided. Lets pages show a
 * setup notice instead of crashing before .env.local is filled in.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabaseUrl = url ?? "";
export const supabaseAnonKey = anonKey ?? "";
