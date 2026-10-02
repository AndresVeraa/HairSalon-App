import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado. Define las variables del archivo .env.')
  }
  return supabase
}

export async function signIn({ email, password }) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function requestClientMagicLink(email) {
  const client = requireSupabase()
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function claimCustomerAccount({ qrNfcToken, name, email }) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('claim_customer_account', {
    p_qr_nfc_token: qrNfcToken,
    p_name: name?.trim() || null,
    p_email: email?.trim() || null,
  })
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

export async function signOut() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentProfile() {
  const client = requireSupabase()
  const { data, error } = await client.from('profiles').select('role, customer_id').single()
  if (error) throw error
  return data
}

export function subscribeToAuthChanges(onChange) {
  const client = requireSupabase()
  const { data } = client.auth.onAuthStateChange((_event, session) => onChange(session))
  return () => data.subscription.unsubscribe()
}
