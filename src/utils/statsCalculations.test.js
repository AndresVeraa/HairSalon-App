import { describe, expect, it } from 'vitest'
import { calculateDateRangeStats } from './statsCalculations'

describe('date range statistics', () => {
  const services = [
    { date: '2026-10-01T10:00:00.000Z', price: 18000 },
    { date: '2026-10-02T10:00:00.000Z', price: 23000 },
    { date: '2026-09-30T10:00:00.000Z', price: 50000 },
  ]

  it('includes both boundary dates and totals the selected services', () => {
    const result = calculateDateRangeStats(services, '2026-10-01', '2026-10-02')

    expect(result.filteredServices).toHaveLength(2)
    expect(result.income).toBe(41000)
    expect(result.dailyData).toEqual([
      { day: '2026-10-01', total: 18000 },
      { day: '2026-10-02', total: 23000 },
    ])
  })

  it('returns an empty report when the range is invalid', () => {
    expect(calculateDateRangeStats(services, '2026-10-03', '2026-10-01')).toMatchObject({
      filteredServices: [],
      income: 0,
      maxDaily: 1,
    })
  })
})
