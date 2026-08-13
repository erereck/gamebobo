import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { formatCurrencyCopy } from '../../game/engine/utils.js'

export function InfoModal({ item }) {
  const { dispatch } = useGame()
  const duration = 8000
  const remainingRef = useRef(duration)
  const pausedRef = useRef(false)
  const [remaining, setRemaining] = useState(duration)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!item.autoAdvance) return undefined
    remainingRef.current = duration
    pausedRef.current = false
    setRemaining(duration)
    setPaused(false)
    let previous = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      if (!pausedRef.current && !document.hidden) {
        remainingRef.current = Math.max(0, remainingRef.current - (now - previous))
        setRemaining(remainingRef.current)
        if (remainingRef.current <= 0) {
          window.clearInterval(timer)
          dispatch({ type: 'ACK_QUEUE' })
        }
      }
      previous = now
    }, 100)
    return () => window.clearInterval(timer)
  }, [dispatch, item.id, item.autoAdvance])

  const setTimerPaused = value => {
    pausedRef.current = value
    setPaused(value)
  }

  return (
    <Modal open locked className="info-modal" label={item.title}>
      <div className="info-sheet" onPointerDown={() => item.autoAdvance && setTimerPaused(true)} onPointerUp={() => item.autoAdvance && setTimerPaused(false)} onPointerCancel={() => item.autoAdvance && setTimerPaused(false)}>
        <span className="event-tag">{item.tag}</span>
        <p className="overline">A LINHA DO TEMPO ANDOU</p>
        <h2>{item.title}</h2>
        <p>{formatCurrencyCopy(item.body)}</p>
        {item.details?.length > 0 && <div className="info-details">{item.details.map(detail => <span key={detail}>{formatCurrencyCopy(detail)}</span>)}</div>}
        <Button variant="primary" onClick={() => dispatch({ type: 'ACK_QUEUE' })}>CONTINUAR</Button>
        {item.autoAdvance && <div className={`notice-timer ${paused ? 'is-paused' : ''}`}><div className="notice-timer-copy"><span>{paused ? 'LEITURA PAUSADA' : 'CONTINUA SOZINHO'}</span><strong>{Math.max(1, Math.ceil(remaining / 1000))}s</strong></div><div className="notice-timer-track" aria-hidden="true"><i style={{ transform: `scaleX(${remaining / duration})` }} /></div></div>}
      </div>
    </Modal>
  )
}
