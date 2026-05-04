const WA_NUMBER = "916307922085"
const WA_BASE = `https://wa.me/${WA_NUMBER}`

function waLink(message: string): string {
  return `${WA_BASE}?text=${encodeURIComponent(message)}`
}

export function whatsappOrderConfirmed(orderId: string): string {
  return waLink(`Hi Auberon Pharmaceuticals! I just placed Order #${orderId}. Please confirm my order details.`)
}

export function whatsappOrderShipped(orderId: string): string {
  return waLink(`Hi! I'd like to track my Order #${orderId}. Could you share the delivery update?`)
}

export function whatsappOrderCancelled(orderId: string): string {
  return waLink(`Hi Auberon Pharmaceuticals, my Order #${orderId} was cancelled. I'd like to know more about my refund status.`)
}

export function whatsappAppointment(patientName: string, date: string): string {
  return waLink(`Hi! I'm ${patientName} and I have an appointment on ${date}. I'd like to confirm my booking.`)
}

export function whatsappSupport(): string {
  return waLink(`Hi Auberon Pharmaceuticals! I need help with something. Could you assist me?`)
}
