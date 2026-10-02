import { describe, expect, it } from 'vitest'
import { APPOINTMENT_STATUS, validateAppointmentRequest } from './appointmentRules'

describe('appointment rules', () => {
  const now = new Date('2026-10-02T12:00:00.000Z')

  it('exposes only the supported appointment states', () => {
    expect(Object.values(APPOINTMENT_STATUS)).toEqual([
      'Pendiente',
      'Confirmada',
      'Rechazada',
      'Cancelada',
      'Completada',
    ])
  })

  it('rejects invalid and past dates', () => {
    expect(validateAppointmentRequest('invalid-date', now)).toBe('Selecciona una fecha y hora válidas.')
    expect(validateAppointmentRequest('2026-10-02T11:00:00.000Z', now)).toBe('Selecciona una fecha y hora futuras.')
  })

  it('accepts a future appointment during business hours', () => {
    expect(validateAppointmentRequest('2026-10-03T15:00:00.000Z', now)).toBeNull()
  })

  it('rejects Sundays and times outside business hours in Colombia', () => {
    expect(validateAppointmentRequest('2026-10-04T15:00:00.000Z', now)).toContain('lunes a sábado')
    expect(validateAppointmentRequest('2026-10-03T12:00:00.000Z', now)).toContain('lunes a sábado')
  })
})
