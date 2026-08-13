import { useEffect, useState } from 'react'

export function CountUp({ value, format = Math.round, active = true, duration = 760, prefix = '', suffix = '' }) {
  const [displayed, setDisplayed] = useState(active ? 0 : value)
  useEffect(() => {
    if (!active) { setDisplayed(0); return undefined }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplayed(value); return undefined }
    const start = performance.now()
    let frame
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration)
      setDisplayed(value * (1 - Math.pow(1 - progress, 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, duration, value])
  return <>{prefix}{format(displayed)}{suffix}</>
}
