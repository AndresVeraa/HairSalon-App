export const mapRemoteService = (service) => ({
  ...service,
  client: service.client_name,
  customerId: service.customer_id || '',
  staff: service.staff?.name || 'Sin asignar',
  type: service.service_type,
  paymentMethod: service.payment_method,
  date: service.created_at,
})

export const mapRemoteAppointment = (appointment) => ({
  ...appointment,
  client: appointment.client_name,
  type: appointment.service_type,
  date: appointment.appointment_date,
})

export const mapRemoteCustomer = (customer, getMembershipTier) => ({
  ...customer,
  customer_id: customer.id,
  membership_tier: getMembershipTier(customer.total_points),
  barber_visits:
    customer.points_transactions?.filter((transaction) =>
      transaction.description?.toLowerCase().includes('corte'),
    ).length || 0,
})
