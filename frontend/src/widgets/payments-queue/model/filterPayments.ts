import type { Payment, PaymentStatus } from '@/entities/payment'

export type StatusFilter = PaymentStatus | 'ALL'

/** CR-01: beginning of either complete field, never substring/per-word search. */
export function filterPayments<T extends Pick<Payment, 'customer_id' | 'payee' | 'status'>>(
  payments: readonly T[], query: string, status: StatusFilter,
): T[] {
  const prefix = query.trim().toLowerCase()
  return payments.filter(payment =>
    (status === 'ALL' || payment.status === status) &&
    (!prefix || payment.customer_id.toLowerCase().startsWith(prefix) || payment.payee.toLowerCase().startsWith(prefix)),
  )
}
