import { VERSION_INFO as versionInfo } from '../../version.js'
import { dateLabel } from '../../game/engine/world.js'
import { useGame } from '../../app/GameContext.jsx'
import { Icon } from '../ui/Icon.jsx'

export function Header() {
  const { state, setSettingsModalOpen } = useGame()
  return (
    <header className="masthead">
      <div className="brand-lockup" aria-label="Gamebobo">
        <div className="brand-disk" aria-hidden="true"><span>GB</span></div>
        <div>
          <h1>GAMEBOBO</h1>
          <p>um jogo sobre fazer jogos</p>
        </div>
      </div>
      <div className="date-block" aria-live="polite">
        <span>EDIÇÃO DO MÊS</span>
        <strong>{dateLabel(state.date)}</strong>
      </div>
      <div className="header-tools">
        <span className="version-chip" title={versionInfo.codename}>v{versionInfo.version}</span>
        <button type="button" className="header-icon-button" onClick={() => setSettingsModalOpen(true)} aria-label="Abrir configurações" title="Configurações"><Icon name="settings" size={18} /></button>
      </div>
    </header>
  )
}
