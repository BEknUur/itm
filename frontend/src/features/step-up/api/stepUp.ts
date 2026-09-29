import type { Payment } from '@/entities/payment'
import { http } from '@/shared/api'

export const approveStepUp = (paymentId: string, deviceId: string) =>
  http<Payment>(`/payments/${paymentId}/step-up/approve`, { body: { device_id: deviceId } })

export const denyStepUp = (paymentId: string) =>
  http<Payment>(`/payments/${paymentId}/step-up/deny`, { method: 'POST' })
