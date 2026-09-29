export const formatMoney = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
