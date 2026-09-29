import type { Payment } from '@/entities/payment'
import { http } from '@/shared/api'

export type ConfirmPaymentInput = {
  customer_id: string
  payee: string
  amount: number
  device_id: string
  failed_otp: number
}

export const confirmPayment = (input: ConfirmPaymentInput) =>
  http<Payment>('/payments/confirm', { body: input })
