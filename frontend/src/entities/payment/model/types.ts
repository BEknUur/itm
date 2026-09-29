export type PaymentStatus = 'SENT' | 'HELD' | 'RELEASED' | 'CANCELLED'

export type Payment = {
  id: string
  customer_id: string
  payee: string
  amount: number
  device_id: string
  score: number
  signals: string[]
  status: PaymentStatus
  hold_until: string | null
  step_up_attempts: number
  created_at: string
}

export type Lang = 'ru' | 'kk' | 'uz' | 'ky'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'kk', label: 'Қазақша' },
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ky', label: 'Кыргызча' },
]

export type HoldWarning = {
  language: Lang
  title: string
  body: string
  action: string
  confirm_label: string
  deny_label: string
  reasons: string[]
}
