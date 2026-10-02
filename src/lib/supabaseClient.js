import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isLocalDemoEnabled = import.meta.env.VITE_ENABLE_LOCAL_DEMO === 'true'

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
