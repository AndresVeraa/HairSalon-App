import { describe, expect, it } from 'vitest'
import { mapRemoteAppointment, mapRemoteCustomer, mapRemoteService } from './remoteMappers'

describe('remote mappers', () => {
  it('maps Supabase service fields for the UI', () => {
    expect(
      mapRemoteService({
        client_name: 'Maria',
        service_type: 'Corte',
        payment_method: 'Efectivo',
        created_at: '2026-10-02T12:00:00Z',
        staff: { name: 'Jhon barber' },
      }),
    ).toMatchObject({ client: 'Maria', type: 'Corte', staff: 'Jhon barber', paymentMethod: 'Efectivo' })
  })

  it('maps appointments and computes customer visits', () => {
    expect(mapRemoteAppointment({ client_name: 'Maria', service_type: 'Corte', appointment_date: '2026-10-03' }))
      .toMatchObject({ client: 'Maria', type: 'Corte', date: '2026-10-03' })
    expect(
      mapRemoteCustomer(
        { id: 'c1', total_points: 150, points_transactions: [{ description: 'Puntos por corte' }] },
        (points) => (points >= 150 ? 'Oro' : 'Plata'),
      ),
    ).toMatchObject({ customer_id: 'c1', membership_tier: 'Oro', barber_visits: 1 })
  })
})
