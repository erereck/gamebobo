import { useEffect, useRef, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { formatMoney, formatNumber } from '../../game/engine/utils.js'
import { reputationLabel } from '../../game/engine/selectors.js'

export function StatStrip() {
  const { state } = useGame()
  const { player } = state
  return (
    <section className="stat-strip" aria-label="Estado da carreira">
      <div className="identity-stat"><span className="status-light" aria-hidden="true" /><div><strong><b>{player.name}</b><i>, {player.age}</i></strong><span>DEV SOLO · {state.studio.name.toUpperCase()}</span></div></div>
      <PulseStat label="CAIXA" value={player.money} format={formatMoney} danger={player.money < 0} />
      <PulseStat label="ENERGIA" value={player.energy} suffix="%" danger={player.energy < 20} />
      <PulseStat label="ESTRESSE" value={player.stress} suffix="%" danger={player.stress > 70} inverse />
      <PulseStat label="SAÚDE" value={player.health} suffix="%" danger={player.health < 35} />
      <PulseStat label="SEGUIDORES" value={player.followers} format={formatNumber} />
      <div className="strip-stat"><span>NOME NA PRAÇA</span><strong>{reputationLabel(player.reputation)}</strong></div>
    </section>
  )
}

function PulseStat({ label, value, format = Math.round, suffix = '', danger, inverse = false }) {
  const previous = useRef(value)
  const [displayed, setDisplayed] = useState(value)
  const [delta, setDelta] = useState(0)
  useEffect(() => {
    const from = previous.current
    previous.current = value
    if (from === value) return undefined
    const difference = value - from
    setDelta(difference)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setDisplayed(value); return undefined }
    const start = performance.now()
    let frame
    const tick = now => {
      const progress = Math.min(1, (now - start) / 682)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayed(from + difference * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const clear = window.setTimeout(() => setDelta(0), 1500)
    return () => { cancelAnimationFrame(frame); window.clearTimeout(clear) }
  }, [value])
  const good = inverse ? delta < 0 : delta > 0
  return <div className={`strip-stat ${danger ? 'is-danger' : ''} ${delta !== 0 ? 'is-changing' : ''}`}><span>{label}</span><strong>{format(displayed)}{suffix}</strong>{delta !== 0 && <em className={good ? 'delta-good' : 'delta-bad'}>{delta > 0 ? '+' : '−'}{format(Math.abs(delta))}{suffix}</em>}</div>
}
