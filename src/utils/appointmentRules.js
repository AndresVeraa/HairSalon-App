export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
})

export const APPOINTMENT_STATUS_VALUES = Object.freeze(Object.values(APPOINTMENT_STATUS))
export const BUSINESS_TIME_ZONE = 'America/Bogota'
export const BUSINESS_OPEN_HOUR = 8
export const BUSINESS_CLOSE_HOUR = 20

const getBogotaParts = (date) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]))
  return { weekday: parts.weekday, hour: Number(parts.hour) }
}

export const validateAppointmentRequest = (appointmentDate, now = new Date()) => {
  const date = new Date(appointmentDate)
  if (Number.isNaN(date.getTime())) return 'Selecciona una fecha y hora válidas.'
  if (date <= now) return 'Selecciona una fecha y hora futuras.'

  const { weekday, hour } = getBogotaParts(date)
  if (weekday === 'Sun' || hour < BUSINESS_OPEN_HOUR || hour >= BUSINESS_CLOSE_HOUR) {
    return 'El horario de atención es de lunes a sábado entre 08:00 y 20:00.'
  }

  return null
}
