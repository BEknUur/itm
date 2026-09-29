import type { Payment } from '@/entities/payment'
import { http } from '@/shared/api'

export type HoldDecision = 'release' | 'cancel'

export const decideHold = (paymentId: string, decision: HoldDecision, agent: string, reason: string) =>
  http<Payment>(`/agent/holds/${paymentId}/${decision}`, { body: { agent, reason } })
