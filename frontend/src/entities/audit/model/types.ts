export type AuditEvent = {
  id: string
  payment_id: string
  action: string
  actor: string
  details: Record<string, unknown>
  created_at: string
}
