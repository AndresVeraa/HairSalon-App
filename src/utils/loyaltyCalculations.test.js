import { describe, expect, it } from 'vitest'
import { addPointsTransaction, createCustomer, getMembershipTier, getPointsForService } from './loyaltyCalculations'

describe('loyalty calculations', () => {
  it('creates a customer with the welcome balance', () => {
    const customer = createCustomer({ name: ' Maria ', phone: '300123', email: 'maria@example.com' })
    expect(customer).toMatchObject({ name: 'Maria', phone: '300123', total_points: 20, membership_tier: 'Plata' })
    expect(customer.customer_id).toMatch(/^cust_/)
  })

  it('maps service categories to the configured point values', () => {
    expect(getPointsForService('Corte')).toBe(15)
    expect(getPointsForService('Coloración')).toBe(40)
    expect(getPointsForService('Keratina')).toBe(85)
  })

  it('updates customer tier and creates a ledger transaction', () => {
    const customer = { customer_id: 'cust_1', name: 'Maria', total_points: 140, membership_tier: 'Plata' }
    const result = addPointsTransaction(customer, { type: 'Coloración' }, 'Nelly peluquera')
    expect(result.customer).toMatchObject({ total_points: 180, membership_tier: 'Oro' })
    expect(result.transaction).toMatchObject({
      customer_id: 'cust_1',
      points_earned: 40,
      staff_name: 'Nelly peluquera',
    })
    expect(getMembershipTier(300)).toBe('Diamante')
  })
})
