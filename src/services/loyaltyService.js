import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export async function registerCustomer({ name, phone, email, qrNfcToken }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('customers')
    .insert({ name: name.trim(), phone: phone.trim(), email: email?.trim() || null, qr_nfc_token: qrNfcToken })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCustomerByToken(qrNfcToken) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('customers')
    .select('*, points_transactions(*)')
    .eq('qr_nfc_token', qrNfcToken)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getCustomerById(customerId) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('customers')
    .select('*, points_transactions(*)')
    .eq('id', customerId)
    .single()
  if (error) throw error
  return data
}

export async function listCustomers() {
  const client = requireSupabase()
  const { data, error } = await client
    .from('customers')
    .select('*, points_transactions(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listActiveRewards() {
  const client = requireSupabase()
  const { data, error } = await client.from('rewards').select('*').eq('active', true).order('points_cost')
  if (error) throw error
  return data
}

export async function redeemReward(rewardId) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('redeem_reward', { p_reward_id: rewardId })
  if (error) throw error
  return data
}

export async function listCustomerRedemptions(customerId) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('reward_redemptions')
    .select('*, rewards(name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAppointment({
  customerId,
  clientName,
  serviceType,
  appointmentDate,
  staffId = null,
  durationMinutes = 60,
}) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('appointments')
    .insert({
      customer_id: customerId || null,
      client_name: clientName.trim(),
      service_type: serviceType,
      appointment_date: appointmentDate,
      staff_id: staffId,
      duration_minutes: durationMinutes,
      source: 'Web',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listAppointments() {
  const client = requireSupabase()
  const { data, error } = await client.from('appointments').select('*').order('appointment_date', { ascending: true })
  if (error) throw error
  return data
}

export async function updateAppointmentStatus(appointmentId, status) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function adjustCustomerPoints(customerId, pointsDelta, reason) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('adjust_customer_points', {
    p_customer_id: customerId,
    p_points_delta: pointsDelta,
    p_reason: reason,
  })
  if (error) throw error
  return data
}

export async function listAdminAuditLog() {
  const client = requireSupabase()
  const { data, error } = await client.from('admin_audit_log').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listServices() {
  const client = requireSupabase()
  const { data, error } = await client
    .from('services')
    .select('*, staff(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createService({
  clientName,
  customerId,
  staffName,
  serviceType,
  price,
  paymentMethod,
  notes,
  date,
}) {
  const client = requireSupabase()
  const { data: staff, error: staffError } = await client.from('staff').select('id').eq('name', staffName).single()
  if (staffError) throw staffError
  const { data, error } = await client
    .from('services')
    .insert({
      client_name: clientName.trim(),
      customer_id: customerId || null,
      staff_id: staff.id,
      service_type: serviceType,
      price,
      payment_method: paymentMethod,
      notes: notes || null,
      created_at: date,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateService(serviceId, values) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('services')
    .update({
      client_name: values.clientName.trim(),
      service_type: values.serviceType,
      price: values.price,
      payment_method: values.paymentMethod,
      notes: values.notes || null,
      created_at: values.date,
    })
    .eq('id', serviceId)
    .select()
    .single()
  if (error) throw error
  return data
}

export function subscribeToCustomerPoints(customerId, onUpdate) {
  const client = requireSupabase()
  const channel = client
    .channel(`customer_points_${customerId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'customers', filter: `id=eq.${customerId}` },
      (payload) => onUpdate(payload.new),
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}
