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

const startOfDay = (value) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export const calculateDateRangeStats = (services, startDate, endDate) => {
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)

  if (!start || !end || start > end) {
    return { filteredServices: [], income: 0, dailyData: [], maxDaily: 1 }
  }

  const endExclusive = new Date(end)
  endExclusive.setDate(endExclusive.getDate() + 1)
  const filteredServices = services.filter((service) => {
    const serviceDate = new Date(service.date)
    return serviceDate >= start && serviceDate < endExclusive
  })
  const dailyData = []
  for (const service of filteredServices) {
    const day = service.date.slice(0, 10)
    const existing = dailyData.find((item) => item.day === day)
    const total = Math.round(Number.parseFloat(service.price || 0))
    if (existing) existing.total += total
    else dailyData.push({ day, total })
  }
  dailyData.sort((first, second) => first.day.localeCompare(second.day))

  return {
    filteredServices,
    income: filteredServices.reduce((sum, service) => sum + Math.round(Number.parseFloat(service.price || 0)), 0),
    dailyData,
    maxDaily: Math.max(...dailyData.map((item) => item.total), 1),
  }
}
