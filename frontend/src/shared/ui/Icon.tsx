export type IconName =
  | 'shield'
  | 'arrow'
  | 'transfer'
  | 'chart'
  | 'grid'
  | 'headset'
  | 'lock'
  | 'phone'
  | 'clock'
  | 'check'
  | 'alert-triangle'
  | 'refresh'
  | 'download'
  | 'sun'
  | 'moon'
  | 'info'
  | 'user'
  | 'search'
  | 'x'
  | 'check-circle'
  | 'activity'
  | 'sliders'
  | 'zap'
  | 'sparkles'
  | 'external-link'
  | 'database'
  | 'file-text'
  | 'filter'
  | 'smartphone'
  | 'calendar'

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
  'alert-triangle': 'M12 9v4 M12 17h.01 M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  sun: 'M12 3v2 M12 19v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M3 12h2 M19 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  info: 'M12 16v-4 M12 8h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  x: 'M18 6 6 18 M6 6l12 12',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  sparkles: 'M12 3v3m0 12v3m-9-9h3m12 0h3m-2.5-6.5l-2 2m-10 10l-2 2m0-14l2 2m10 10l2 2',
  'external-link': 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
  database: 'M21 5c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 M21 19c0 1.66-4 3-9 3s-9-1.34-9-3 M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  smartphone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18',
}

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`icon ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
