const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const isService = (value) => isObject(value) && value.id !== undefined && typeof value.client === 'string'
const isAppointment = (value) => isObject(value) && value.id !== undefined && typeof value.client === 'string'

export const readStorageArray = (storage, key, validator) => {
  const saved = storage.getItem(key)
  if (saved === null) return []

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) throw new Error(`El valor de ${key} no es un arreglo`)
    return parsed.filter(validator)
  } catch (error) {
    console.error(`No se pudieron leer los datos almacenados en ${key}. Se usará una lista vacía.`, error)
    return []
  }
}

export const readJsonArray = (storage, key) => readStorageArray(storage, key, () => true)

export const writeStorageArray = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`No se pudieron guardar los datos en ${key}.`, error)
  }
}

export const readServices = (storage = window.localStorage) =>
  readStorageArray(storage, 'hairsalon_v7_records', isService)
export const readAppointments = (storage = window.localStorage) =>
  readStorageArray(storage, 'hairsalon_v7_appointments', isAppointment)
export const serviceStorageKey = 'hairsalon_v7_records'
export const appointmentStorageKey = 'hairsalon_v7_appointments'
