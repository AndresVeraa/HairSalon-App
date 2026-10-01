export const calculateMonthlyStats = (services, date = new Date()) => {
  const month = date.getMonth()
  const year = date.getFullYear()
  const monthlyServices = services.filter((service) => {
    const serviceDate = new Date(service.date)
    return serviceDate.getMonth() === month && serviceDate.getFullYear() === year
  })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dailyData = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const total = monthlyServices
      .filter((service) => new Date(service.date).getDate() === day)
      .reduce((sum, service) => sum + Math.round(Number.parseFloat(service.price || 0)), 0)
    return { day, total }
  })

  return {
    monthlyServices,
    dailyData,
    incomeMonthly: monthlyServices.reduce((sum, service) => sum + Math.round(Number.parseFloat(service.price || 0)), 0),
    maxDaily: Math.max(...dailyData.map((item) => item.total), 1),
    monthName: date.toLocaleString('es-ES', { month: 'long' }),
  }
}
