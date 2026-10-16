import { useEffect, useRef, useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { CountUp } from '../../ui/CountUp.jsx'
import { fmtMoney, fmtNum } from '../../ui/format.js'
import { MONTHS, eraAt } from '../../game/data/economy.js'
import { legacyTitle, nextLegacyTitle } from '../../game/engine/progress.js'
import { TICKER } from '../../game/data/content/ticker.js'
import { isBlocked } from '../../game/engine/tick.js'
import { activeRivals, historicWeek } from '../../game/engine/market.js'
import { ALL_HISTORIC_GAMES, MILESTONES } from '../../game/data/history.js'
import { PLATFORMS } from '../../game/data/platforms.js'

// "em 3 meses", "no mês que vem", "em 1 ano e 2 meses"
const inMonths = months => {
  if (months <= 1) return 'no mês que vem'
  if (months < 12) return `em ${months} meses`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return `em ${years} ano${years > 1 ? 's' : ''}${rest ? ` e ${rest} ${rest > 1 ? 'meses' : 'mês'}` : ''}`
}

// Contagem regressiva de consoles e dos jogos mais esperados: o calendário de verdade no letreiro.
function upcomingNews(state) {
  const nowMonth = state.year * 12 + Math.floor(state.week / 4)
  const news = []
  for (const platform of PLATFORMS) {
    const months = platform.year * 12 + platform.month - nowMonth
    if (months > 0 && months <= 18 && platform.year > 1980) news.push({ text: `${platform.label} chega ${inMonths(months)}`, soon: months })
  }
  const tw = (state.year - 1980) * 48 + state.week
  for (const entry of ALL_HISTORIC_GAMES) {
    const weeks = historicWeek(entry) - tw
    if (weeks <= 0 || weeks > 40 || /^(fifa|pes|cod)-/.test(entry.id)) continue
    if (!entry.trend && entry.copies < 8) continue
    news.push({ text: `Aguardado: ${entry.title} sai ${inMonths(Math.max(1, Math.round(weeks / 4)))}`, soon: weeks / 4 })
  }
  const top = state.chart?.[0]
  if (top) news.push({ text: top.mine ? `${top.title} é o nº 1 das paradas!` : `Nº 1 das paradas: ${top.title} (${top.studio})` })
  return news.sort((a, b) => (a.soon ?? 99) - (b.soon ?? 99)).slice(0, 5)
}

function Delta({ value }) {
  const [shown, setShown] = useState(null)
  const prev = useRef(value)
  useEffect(() => {
    const diff = value - prev.current
    prev.current = value
    if (Math.abs(diff) < 1) return undefined
    setShown(diff)
    const id = setTimeout(() => setShown(null), 1100)
    return () => clearTimeout(id)
  }, [value])
  if (shown === null) return null
  return <span key={shown} className={`delta ${shown > 0 ? 'up' : 'down'}`}>{shown > 0 ? '+' : '−'}{fmtMoney(Math.abs(shown)).replace('$', '$')}</span>
}

function Ticker({ state }) {
  const [index, setIndex] = useState(0)
  const real = [
    ...MILESTONES.filter(item => item.year === state.year),
    ...state.rivalGames.filter(game => game.historic && !game.annual && game.age < 16).map(game => ({ text: `${game.studio} lança ${game.title}` })),
    ...upcomingNews(state),
  ]
  const pool = [...real, ...real, ...TICKER.filter(item => (item.minYear ?? 0) <= state.year && (item.maxYear ?? 9999) >= state.year)]
  useEffect(() => {
    const id = setInterval(() => setIndex(i => i + 1), 7000)
    return () => clearInterval(id)
  }, [])
  if (!pool.length) return null
  const item = pool[(index + state.year) % pool.length]
  const text = item.text.replaceAll('{studio}', state.studio.name).replaceAll('{rival}', activeRivals(state.year)[(index + state.year) % Math.max(1, activeRivals(state.year).length)]?.name ?? 'a concorrência')
  const source = state.year < 1996 ? 'REVISTA' : state.year < 2008 ? 'PORTAL' : state.year < 2016 ? 'FEED' : 'CLIPE'
  return (
    <div className="ticker" aria-live="off">
      <span className="ticker-src">{source}</span>
      <span key={item.text} className="ticker-text">{text}</span>
    </div>
  )
}

const KEYS = [
  { speed: 0, icon: 'pause', label: 'Pausar' },
  { speed: 1, icon: 'play', label: 'Normal' },
  { speed: 2, icon: 'ff', label: 'Rápido' },
  { speed: 3, icon: 'fff', label: 'Turbo' },
]

export function TopBar({ onSettings, paused }) {
  const state = useGame()
  const title = legacyTitle(state.legacy)
  const next = nextLegacyTitle(state.legacy)
  const progress = next ? (state.legacy - title.min) / (next.min - title.min) : 1
  const blocked = isBlocked(state)
  const speed = state.settings.speed
  return (
    <header className="topbar">
      <div className="plaque">
        <div className="plaque-name">{state.studio.name}</div>
        <div className="plaque-title"><Icon name="crown" size={12} stroke={2.6} />{title.label}</div>
        <div className="plaque-bar" title={next ? `Próximo: ${next.label}` : 'Topo'}><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      </div>
      <div className="calendar" title={eraAt(state.year).label}>
        <span className="cal-month">{MONTHS[Math.floor(state.week / 4)]}</span>
        <span className="cal-year">{state.year}</span>
        <span className="cal-week">{'●'.repeat((state.week % 4) + 1)}{'○'.repeat(3 - (state.week % 4))}</span>
      </div>
      <Ticker state={state} />
      <div className="stats">
        <div className={`stat stat-money ${state.money < 0 ? 'neg' : ''}`}>
          <Icon name="cash" size={18} stroke={2.2} />
          <b><CountUp value={state.money} format={fmtMoney} /></b>
          <Delta value={state.money} />
        </div>
        <div className="stat" title="Fãs">
          <Icon name="fans" size={18} stroke={2.2} />
          <b><CountUp value={state.fans} format={fmtNum} /></b>
        </div>
        <div className="stat" title="Pontos de pesquisa">
          <Icon name="flask" size={18} stroke={2.2} />
          <b>{fmtNum(Math.floor(state.rp))}</b>
        </div>
      </div>
      <div className={`deck ${paused || blocked ? 'deck-held' : ''}`} role="group" aria-label="Velocidade">
        {KEYS.map(key => (
          <button key={key.speed} type="button" className={`deck-key ${speed === key.speed ? 'on' : ''}`} aria-label={key.label} title={key.label} aria-pressed={speed === key.speed}
            onClick={() => { sfx.click(); dispatch({ type: 'SET_SETTING', key: 'speed', value: key.speed }) }}>
            <Icon name={key.icon} size={16} stroke={2.4} />
          </button>
        ))}
      </div>
      <button type="button" className="icon-btn settings-btn" aria-label="Configurações" title="Configurações" onClick={onSettings}>
        <Icon name="gear" size={20} />
      </button>
    </header>
  )
}
