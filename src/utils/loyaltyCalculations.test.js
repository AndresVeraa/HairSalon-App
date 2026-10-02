import { describe, expect, it } from 'vitest'
import {
  addPointsTransaction,
  calculateBarberPromotion,
  createCustomer,
  getMembershipTier,
  getPointsForService,
} from './loyaltyCalculations'

describe('loyalty calculations', () => {
  it('creates a customer with the welcome balance', () => {
    const customer = createCustomer({ name: ' Maria ', phone: '300123', email: 'maria@example.com' })
    expect(customer).toMatchObject({
      name: 'Maria',
      phone: '300123',
      total_points: 10,
      membership_tier: 'Plata',
      barber_visits: 0,
    })
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

  it('applies 5% only on the fourth barber visit', () => {
    const services = [
      { customerId: 'cust_1', staff: 'Jhon barber', type: 'Corte', price: 18000 },
      { customerId: 'cust_1', staff: 'Jhon barber', type: 'Corte', price: 18000 },
      { customerId: 'cust_1', staff: 'Jhon barber', type: 'Corte + barba', price: 23000 },
    ]
    expect(
      calculateBarberPromotion(services, 'cust_1', { staff: 'Jhon barber', type: 'Corte', price: 18000 }),
    ).toMatchObject({
      visitNumber: 4,
      originalPrice: 18000,
      discountPercentage: 5,
      discountAmount: 900,
      finalPrice: 17100,
    })
    expect(
      calculateBarberPromotion(services, 'cust_1', { staff: 'Nelly peluquera', type: 'Corte', price: 18000 })
        .discountAmount,
    ).toBe(0)
  })
})
