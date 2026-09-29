export type Incident = {
  id: string
  payment_id: string
  customer_id: string
  payee: string
  amount: number
  signals: string[]
  reason: string
  created_at: string
}
