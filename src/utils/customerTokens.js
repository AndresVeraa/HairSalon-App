export const createCustomerToken = () => `qr_${crypto.randomUUID()}`

export const getEnrollmentUrl = () => `${window.location.origin}/?registro=1`
