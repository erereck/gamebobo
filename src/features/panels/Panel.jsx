import { Icon } from '../../ui/Icon.jsx'
import { sfx } from '../../app/audio.js'
import { TeamPanel } from './TeamPanel.jsx'
import { OfficePanel } from './OfficePanel.jsx'
import { ResearchPanel } from './ResearchPanel.jsx'
import { ChartsPanel } from './ChartsPanel.jsx'
import { CollectionPanel } from './CollectionPanel.jsx'
import { SettingsPanel } from './SettingsPanel.jsx'
import { AlmanacPanel } from './AlmanacPanel.jsx'

const PANELS = {
  team: { title: 'Equipe', icon: 'team', Component: TeamPanel, tint: '#ffd23f' },
  office: { title: 'Escritório', icon: 'building', Component: OfficePanel, tint: '#52d977' },
  research: { title: 'Pesquisa', icon: 'flask', Component: ResearchPanel, tint: '#b57bff' },
  charts: { title: 'Paradas', icon: 'chart', Component: ChartsPanel, tint: '#3fb8ff' },
  almanac: { title: 'Almanaque', icon: 'book', Component: AlmanacPanel, tint: '#ff9b84' },
  collection: { title: 'Coleção', icon: 'cartridge', Component: CollectionPanel, tint: '#ff6bd6' },
  settings: { title: 'Ajustes', icon: 'gear', Component: SettingsPanel, tint: '#c9c2d6' },
}

export function Panel({ name, onClose }) {
  const panel = PANELS[name]
  if (!panel) return null
  const { Component } = panel
  return (
    <div className="panel-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
      <aside className={`panel panel-${name}`} style={{ '--tint': panel.tint }} aria-label={panel.title}>
        <header className="panel-head">
          <span className="panel-tab"><Icon name={panel.icon} size={20} />{panel.title}</span>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => { sfx.back(); onClose() }}><Icon name="close" size={20} /></button>
        </header>
        <div className="panel-body">
          <Component onClose={onClose} />
        </div>
      </aside>
    </div>
  )
}
