export const LOYALTY_STORAGE_KEYS = {
  customers: 'hairsalon_v7_customers',
  points: 'hairsalon_v7_points',
}

export const POINT_RULES = {
  Corte: 15,
  Peinado: 15,
  Cepillado: 15,
  Coloración: 40,
  Rayitos: 40,
  Tratamiento: 40,
  Keratina: 85,
  Alisado: 85,
  Otro: 10,
}

export const getPointsForService = (serviceType) => POINT_RULES[serviceType] || POINT_RULES.Otro

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
    total_points: 20,
    membership_tier: 'Plata',
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
    customer: { ...customer, total_points: totalPoints, membership_tier: getMembershipTier(totalPoints) },
    transaction,
  }
}
