type IconName = 'shield' | 'arrow' | 'transfer' | 'chart' | 'grid' | 'headset' | 'lock' | 'phone' | 'clock' | 'check'

const paths: Record<IconName, string> = {
  shield: 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z M8.5 12l2.5 2.5 4.5-5',
  arrow: 'M5 12h14 M14 7l5 5-5 5',
  transfer: 'M4 8h15 M15 4l4 4-4 4 M20 16H5 M9 12l-4 4 4 4',
  chart: 'M4 3v17h17 M8 15v-4 M13 15V7 M18 15v-6',
  grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  headset: 'M4 13v-1a8 8 0 0 1 16 0v1 M4 12H3v6h4v-6H4 M20 12h1v6h-4v-6h3 M18 18v3h-6',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z M12 14v3',
  phone: 'M7 2h10v20H7z M10 18h4',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  check: 'm5 12 4 4L19 6',
}

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
