export const LOYALTY_STORAGE_KEYS = {
  customers: 'hairsalon_v7_customers',
  points: 'hairsalon_v7_points',
}

export const POINT_RULES = {
  Corte: 15,
  'Corte + barba': 15,
  Peinado: 15,
  Cepillado: 15,
  Coloración: 40,
  Rayitos: 40,
  Tratamiento: 40,
  Keratina: 85,
  Alisado: 85,
  Otro: 10,
}

export const BARBER_SERVICE_TYPES = ['Corte', 'Corte + barba']
export const BARBER_DISCOUNT_VISIT = 4
export const BARBER_DISCOUNT_PERCENTAGE = 0.05
export const WELCOME_POINTS = 10

export const getPointsForService = (serviceType) => POINT_RULES[serviceType] || POINT_RULES.Otro

export const isBarberService = (service) =>
  service.staff === 'Jhon barber' && BARBER_SERVICE_TYPES.includes(service.type)

export const calculateBarberPromotion = (services, customerId, service) => {
  const previousVisits = services.filter((item) => item.customerId === customerId && isBarberService(item)).length
  const visitNumber = previousVisits + 1
  const qualifies = isBarberService(service) && visitNumber === BARBER_DISCOUNT_VISIT
  const originalPrice = Math.round(Number.parseFloat(service.price || 0))
  const discountAmount = qualifies ? Math.round(originalPrice * BARBER_DISCOUNT_PERCENTAGE) : 0

  return {
    visitNumber,
    originalPrice,
    discountPercentage: qualifies ? BARBER_DISCOUNT_PERCENTAGE * 100 : 0,
    discountAmount,
    finalPrice: originalPrice - discountAmount,
  }
}

export const getMembershipTier = (totalPoints) => {
  if (totalPoints >= 300) return 'Diamante'
  if (totalPoints >= 150) return 'Oro'
  return 'Plata'
}

export const createCustomer = ({ name, phone, email }) => {
  const id = `cust_${Date.now()}`
  return {
    customer_id: id,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    nfc_qr_token: `qr_${crypto.randomUUID?.() || id}`,
    total_points: WELCOME_POINTS,
    membership_tier: 'Plata',
    barber_visits: 0,
    created_at: new Date().toISOString(),
  }
}

export const addPointsTransaction = (customer, service, staffName) => {
  const points = getPointsForService(service.type)
  const transaction = {
    transaction_id: `tx_${Date.now()}`,
    customer_id: customer.customer_id,
    service_type: service.type,
    staff_name: staffName,
    points_earned: points,
    date: new Date().toISOString(),
  }
  const totalPoints = customer.total_points + points
  return {
    customer: {
      ...customer,
      total_points: totalPoints,
      membership_tier: getMembershipTier(totalPoints),
      barber_visits: (customer.barber_visits || 0) + (isBarberService(service) ? 1 : 0),
    },
    transaction,
  }
}
