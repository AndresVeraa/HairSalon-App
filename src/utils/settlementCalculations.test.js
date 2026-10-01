import { describe, expect, it } from 'vitest'
import { calculateDailyCash, calculateStaffSettlement } from './settlementCalculations'

const today = new Date(2026, 9, 1, 12)

describe('settlement calculations', () => {
  it('calculates total daily cash and separates payment methods', () => {
    const services = [
      { date: today.toISOString(), price: '25000', paymentMethod: 'Efectivo', staff: 'Jhon barber' },
      { date: today.toISOString(), price: 30000, paymentMethod: 'Nequi', staff: 'Nelly peluquera' },
      {
        date: new Date(2026, 8, 30, 12).toISOString(),
        price: 99999,
        paymentMethod: 'Efectivo',
        staff: 'Luz peluquera',
      },
    ]

    expect(calculateDailyCash(services, today)).toMatchObject({ total: 55000, cash: 25000, nequi: 30000 })
  })

  it('applies staff percentages and assigns the remainder to Luz', () => {
    const services = [
      { date: today.toISOString(), price: 100000, paymentMethod: 'Efectivo', staff: 'Jhon barber' },
      { date: today.toISOString(), price: 80000, paymentMethod: 'Nequi', staff: 'Nelly peluquera' },
      { date: today.toISOString(), price: 50000, paymentMethod: 'Efectivo', staff: 'Luz peluquera' },
    ]

    expect(calculateStaffSettlement(services, today)).toEqual([
      expect.objectContaining({ name: 'Jhon barber', total: 100000, commission: 60000, count: 1 }),
      expect.objectContaining({ name: 'Nelly peluquera', total: 80000, commission: 40000, count: 1 }),
      expect.objectContaining({ name: 'Luz peluquera', total: 50000, commission: 130000, count: 1 }),
    ])
  })

  it('rounds commission results consistently for both payment methods', () => {
    const services = [
      { date: today.toISOString(), price: 101, paymentMethod: 'Efectivo', staff: 'Jhon barber' },
      { date: today.toISOString(), price: 101, paymentMethod: 'Nequi', staff: 'Nelly peluquera' },
    ]

    expect(calculateDailyCash(services, today).total).toBe(202)
    expect(calculateStaffSettlement(services, today).map((staff) => staff.commission)).toEqual([61, 51, 90])
  })
})
