import { http } from '@/shared/api'
import type { HoldWarning, Lang, Payment } from '../model/types'

export const fetchPayment = (id: string) => http<Payment>(`/payments/${id}`)

export const fetchPayments = () => http<Payment[]>('/agent/payments')

export const fetchWarning = (id: string, lang?: Lang) =>
  http<HoldWarning>(`/payments/${id}/warning${lang ? `?lang=${lang}` : ''}`)
