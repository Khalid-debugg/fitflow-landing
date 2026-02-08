import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing env.SUPABASE_URL')
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing env.SUPABASE_ANON_KEY')
}

// Server-side Supabase client for API routes only
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
