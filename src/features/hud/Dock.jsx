import { useGame } from '../../app/store.js'
import { Icon } from '../../ui/Icon.jsx'
import { OFFICES, TECHS } from '../../game/data/economy.js'
import { localStaff } from '../../game/engine/teams.js'
import { allowsHiring } from '../../game/engine/modes.js'

export const DOCK_ITEMS = [
  { id: 'team', label: 'Equipe', icon: 'team' },
  { id: 'office', label: 'Escritório', icon: 'building' },
  { id: 'research', label: 'Pesquisa', icon: 'flask' },
  { id: 'charts', label: 'Paradas', icon: 'chart' },
  { id: 'collection', label: 'Coleção', icon: 'cartridge' },
]

export function Dock({ active, onOpen }) {
  const state = useGame()
  const researchReady = TECHS.some(tech => !state.techs.includes(tech.id) && tech.year <= state.year && state.rp >= tech.rp)
  const badges = {
    research: researchReady,
    team: allowsHiring(state) && localStaff(state).length < OFFICES[state.office].cap && state.candidates.length > 0 && state.games.length > 0,
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
