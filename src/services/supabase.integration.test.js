import { describe, expect, it } from 'vitest'
/* global process */
import { createClient } from '@supabase/supabase-js'

const runIntegration = process.env.RUN_SUPABASE_INTEGRATION === 'true'
const describeIntegration = runIntegration ? describe : describe.skip

describeIntegration('Supabase integration', () => {
  it('does not expose services to an anonymous client', async () => {
    const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    const { data, error } = await client.from('services').select('id').limit(1)
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('blocks anonymous appointment creation through RLS', async () => {
    const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    const { error } = await client.from('appointments').insert({
      client_name: 'RLS test',
      service_type: 'Corte',
      appointment_date: new Date(Date.now() + 86_400_000).toISOString(),
    })
    expect(error).not.toBeNull()
  })
})
