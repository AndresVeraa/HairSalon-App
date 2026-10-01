export const STAFF_CONFIG = [
  { name: 'Jhon barber', percentage: 0.6, note: '40% para Luz' },
  { name: 'Nelly peluquera', percentage: 0.5, note: '50% para Luz' },
  { name: 'Luz peluquera', percentage: 1, note: 'Dueña (+ comisiones)', isOwner: true },
]

const toAmount = (value) => Math.round(Number.parseFloat(value || 0))

export const calculateDailyCash = (services, date = new Date()) => {
  const day = date.toDateString()
  const todayServices = services.filter((service) => new Date(service.date).toDateString() === day)

  return todayServices.reduce(
    (totals, service) => {
      const amount = toAmount(service.price)
      totals.total += amount
      if (service.paymentMethod === 'Nequi') totals.nequi += amount
      if (service.paymentMethod === 'Efectivo') totals.cash += amount
      return totals
    },
    { total: 0, nequi: 0, cash: 0, services: todayServices },
  )
}

export const calculateStaffSettlement = (services, date = new Date()) => {
  const todayServices = services.filter((service) => new Date(service.date).toDateString() === date.toDateString())
  const totals = STAFF_CONFIG.map((staff) => {
    const staffServices = todayServices.filter((service) => service.staff === staff.name)
    return {
      ...staff,
      total: staffServices.reduce((sum, service) => sum + toAmount(service.price), 0),
      count: staffServices.length,
    }
  })

  const jhon = totals.find((staff) => staff.name === 'Jhon barber')
  const nelly = totals.find((staff) => staff.name === 'Nelly peluquera')
  return totals.map((staff) => ({
    ...staff,
    commission: staff.isOwner
      ? staff.total +
        (jhon.total - Math.round(jhon.total * jhon.percentage)) +
        (nelly.total - Math.round(nelly.total * nelly.percentage))
      : Math.round(staff.total * staff.percentage),
  }))
}
