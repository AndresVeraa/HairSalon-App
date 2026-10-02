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

export const calculateStaffSettlement = (services, date = new Date(), staffConfig = STAFF_CONFIG) => {
  const todayServices = services.filter((service) => new Date(service.date).toDateString() === date.toDateString())
  const totals = staffConfig.map((staff) => {
    const staffServices = todayServices.filter((service) => service.staff === staff.name)
    return {
      ...staff,
      percentage: staff.percentage > 1 ? staff.percentage / 100 : staff.percentage,
      total: staffServices.reduce((sum, service) => sum + toAmount(service.price), 0),
      count: staffServices.length,
    }
  })

  const nonOwners = totals.filter((staff) => !staff.isOwner)
  return totals.map((staff) => ({
    ...staff,
    commission: staff.isOwner
      ? staff.total +
        nonOwners.reduce((sum, member) => sum + member.total - Math.round(member.total * member.percentage), 0)
      : Math.round(staff.total * staff.percentage),
  }))
}
