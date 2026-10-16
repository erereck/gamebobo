import { Icon } from './Icon.jsx'
import { fmtMoney, fmtSigned, fmtNum } from './format.js'

const META = {
  money: { icon: 'cash', good: v => v > 0, fmt: v => (v > 0 ? '+' : '') + fmtMoney(v) },
  fans: { icon: 'fans', good: v => v > 0 },
  rp: { icon: 'flask', good: v => v > 0 },
  hype: { icon: 'megaphone', good: v => v > 0 },
  bugs: { icon: 'bug', good: v => v < 0 },
  energy: { icon: 'bolt', good: v => v > 0 },
  mood: { icon: 'smile', good: v => v > 0 },
  weeks: { icon: 'clock', good: v => v < 0, fmt: v => `${v > 0 ? '+' : '−'}${Math.abs(v)} sem` },
  score: { icon: 'star', good: v => v > 0, fmt: v => `${v > 0 ? '+' : '−'}${Math.abs(v)} nota` },
  sales: { icon: 'chart', good: v => v > 0, fmt: v => `${v > 0 ? '+' : '−'}${Math.abs(v)}% vendas` },
  fun: { icon: 'gamepad', good: v => v > 0 },
  art: { icon: 'brush', good: v => v > 0 },
  sound: { icon: 'note', good: v => v > 0 },
  idea: { icon: 'bulb', good: v => v > 0 },
  copies: { icon: 'disc', good: () => true, fmt: v => `${fmtNum(v)} cópias` },
}

export function Chip({ k, value, big = false }) {
  const meta = META[k] ?? { icon: 'sparkle', good: v => v > 0 }
  const good = meta.good(value)
  return (
    <span className={`chip ${good ? 'chip-good' : 'chip-bad'} ${big ? 'chip-big' : ''}`}>
      <Icon name={meta.icon} size={big ? 18 : 14} stroke={2.4} />
      {meta.fmt ? meta.fmt(value) : fmtSigned(value)}
    </span>
  )
}

export function Chips({ items = [], big }) {
  if (!items.length) return null
  return <div className="chips">{items.map((chip, i) => <Chip key={`${chip.key}-${i}`} k={chip.key} value={chip.value} big={big} />)}</div>
}

// Resumo previsível de um pacote de efeitos, antes do clique.
export function effectsToChips(effects = {}) {
  const chips = []
  for (const [key, value] of Object.entries(effects)) {
    if (key === 'pts') for (const [p, v] of Object.entries(value)) chips.push({ key: p, value: v })
    else if (key === 'fansPct') chips.push({ key: 'fans', value: Math.round(value * 100), pct: true })
    else if (key === 'nextScore') chips.push({ key: 'score', value })
    else if (key === 'salesMult') chips.push({ key: 'sales', value: Math.round((value - 1) * 100) })
    else chips.push({ key, value })
  }
  return chips
}

const BIG = { money: 8000, fans: 8, hype: 15, bugs: 8, fun: 3, art: 3, sound: 3, idea: 3, energy: 20, mood: 20, rp: 25, weeks: 3, score: 4, sales: 20 }

// Antes do clique: ícone + setas. Uma seta é pouco, duas é muito.
export function PreviewChips({ effects }) {
  const chips = effectsToChips(effects)
  if (!chips.length) return null
  return (
    <div className="chips chips-preview">
      {chips.map((chip, i) => {
        const meta = META[chip.key] ?? { icon: 'sparkle', good: v => v > 0 }
        const good = meta.good(chip.value)
        const big = Math.abs(chip.value) >= (BIG[chip.key] ?? 99)
        const arrow = chip.value > 0 ? '▲' : '▼'
        return (
          <span key={i} className={`chip chip-mini ${good ? 'chip-good' : 'chip-bad'}`}>
            <Icon name={meta.icon} size={13} stroke={2.6} />
            <b>{big ? arrow + arrow : arrow}</b>
          </span>
        )
      })}
    </div>
  )
}
