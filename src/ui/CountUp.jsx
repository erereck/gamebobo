import { useEffect, useRef, useState } from 'react'

// Número que corre até o valor novo e desacelera no fim.
export function CountUp({ value, format = v => Math.round(v), duration = 650 }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const frame = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    const b = value
    if (a === b) return undefined
    cancelAnimationFrame(frame.current)
    const step = now => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 4
      const v = a + (b - a) * eased
      setShown(v)
      from.current = v
      if (t < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])
  return <>{format(shown)}</>
}
