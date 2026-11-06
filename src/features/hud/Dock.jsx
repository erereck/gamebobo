import { useEffect, useState } from 'react'
import { useGame } from '../../app/store.js'
import { Icon } from '../../ui/Icon.jsx'
import { OFFICES, TECHS } from '../../game/data/economy.js'
import { localStaff } from '../../game/engine/teams.js'
import { allowsHiring } from '../../game/engine/modes.js'
import { almanacNews, nowWeek, weekStamp } from '../../game/engine/almanac.js'

export const DOCK_ITEMS = [
  { id: 'team', label: 'Equipe', icon: 'team' },
  { id: 'office', label: 'Escritório', icon: 'building' },
  { id: 'research', label: 'Pesquisa', icon: 'flask' },
  { id: 'charts', label: 'Paradas', icon: 'chart' },
  { id: 'almanac', label: 'Almanaque', icon: 'book' },
  { id: 'collection', label: 'Coleção', icon: 'cartridge' },
]

// Última semana em que o almanaque foi aberto, por carreira. Só conveniência deste navegador.
const SEEN_KEY = 'gamebobo-almanac-seen'
function readSeenAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}
const readSeen = id => {
  const value = readSeenAll()[id]
  return Number.isFinite(value) ? value : null
}
function writeSeen(id, week) {
  try {
    const all = readSeenAll()
    delete all[id]
    all[id] = week
    const keys = Object.keys(all)
    for (const key of keys.slice(0, Math.max(0, keys.length - 12))) delete all[key]
    localStorage.setItem(SEEN_KEY, JSON.stringify(all))
  } catch {
    // sem armazenamento: o aviso só volta a aparecer
  }
}

// Ponto no Almanaque quando um console chegou desde a última visita.
function useAlmanacBadge(state, open) {
  const [seen, setSeen] = useState(() => readSeen(state.id))
  useEffect(() => { setSeen(readSeen(state.id)) }, [state.id])
  useEffect(() => {
    if (!open) return
    const week = nowWeek(state)
    writeSeen(state.id, week)
    setSeen(week)
  }, [open, state.id])
  if (open) return false
  return almanacNews(state, seen ?? weekStamp(state.startYear ?? state.year)) > 0
}

export function Dock({ active, onOpen }) {
  const state = useGame()
  const almanacNew = useAlmanacBadge(state, active === 'almanac')
  const researchReady = TECHS.some(tech => !state.techs.includes(tech.id) && tech.year <= state.year && state.rp >= tech.rp)
  const badges = {
    research: researchReady,
    team: allowsHiring(state) && localStaff(state).length < OFFICES[state.office].cap && state.candidates.length > 0 && state.games.length > 0,
    almanac: almanacNew,
  }
  return (
    <nav className="dock" aria-label="Painéis">
      {DOCK_ITEMS.map(item => (
        <button key={item.id} type="button" className={`dock-btn ${active === item.id ? 'on' : ''}`} onClick={() => onOpen(item.id)} aria-pressed={active === item.id}>
          <span className="dock-icon"><Icon name={item.icon} size={22} /></span>
          <span className="dock-label">{item.label}</span>
          {badges[item.id] && <span className="dock-dot" aria-label="novidade" />}
        </button>
      ))}
    </nav>
  )
}
