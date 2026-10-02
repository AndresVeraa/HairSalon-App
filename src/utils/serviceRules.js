export const SERVICE_DURATION_MINUTES = Object.freeze({
  Corte: 60,
  'Corte + barba': 75,
  Peinado: 60,
  Cepillado: 60,
  Coloración: 180,
  Tratamiento: 120,
  Keratina: 180,
  Alisado: 180,
})

export const getServiceDurationMinutes = (serviceType) => SERVICE_DURATION_MINUTES[serviceType] || 60
