import { useCallback, useEffect, useRef, useState } from 'react'

/** Seconds left until an ISO timestamp; re-renders every second. */
export function useCountdown(until: string | null): number {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return until ? Math.max(0, Math.round((Date.parse(until) - now) / 1000)) : 0
}

/** Loads data now and every `ms`, so both screens see each other's actions live. */
export function usePolling<T>(load: () => Promise<T>, ms = 2000) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loadRef = useRef(load)

  useEffect(() => {
    loadRef.current = load
  })

  const reload = useCallback(async () => {
    try {
      setData(await loadRef.current())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  useEffect(() => {
    void reload()
    const id = setInterval(reload, ms)
    return () => clearInterval(id)
  }, [reload, ms])

  return { data, error, reload }
}
