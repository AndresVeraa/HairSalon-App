export const SETTINGS_STORAGE_KEY = 'hairsalon_v7_settings'

export const DEFAULT_SETTINGS = {
  staff: [
    { name: 'Jhon barber', percentage: 60, note: '40% para Luz', isOwner: false },
    { name: 'Nelly peluquera', percentage: 50, note: '50% para Luz', isOwner: false },
    { name: 'Luz peluquera', percentage: 100, note: 'Dueña (+ comisiones)', isOwner: true },
  ],
  serviceTypes: ['Corte', 'Corte + barba', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'],
}

export const normalizeSettings = (value) => ({
  staff: Array.isArray(value?.staff) && value.staff.length ? value.staff : DEFAULT_SETTINGS.staff,
  serviceTypes:
    Array.isArray(value?.serviceTypes) && value.serviceTypes.length
      ? value.serviceTypes
      : DEFAULT_SETTINGS.serviceTypes,
})

export const readSettings = (storage = window.localStorage) => {
  try {
    const value = JSON.parse(storage.getItem(SETTINGS_STORAGE_KEY) || 'null')
    return normalizeSettings(value)
  } catch (error) {
    console.error('No se pudo leer la configuración del salón.', error)
    return DEFAULT_SETTINGS
  }
}
