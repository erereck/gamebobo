import { VERSION_INFO as versionInfo } from '../../version.js'
import { dateLabel } from '../../game/engine/world.js'
import { CURRENCIES } from '../../game/engine/utils.js'
import { useGame } from '../../app/GameContext.jsx'

export function Header() {
  const { state, dispatch, setSettingsModalOpen } = useGame()
  const currencyCodes = Object.keys(CURRENCIES)
  const currentCurrency = state.settings.currency ?? 'BRL'
  const nextCurrency = currencyCodes[(currencyCodes.indexOf(currentCurrency) + 1) % currencyCodes.length]
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
        <button type="button" className="currency-toggle" onClick={() => dispatch({ type: 'SET_CURRENCY', currency: nextCurrency })} aria-label={`Moeda: ${CURRENCIES[currentCurrency].label}. Alternar para ${CURRENCIES[nextCurrency].label}`} title="Alternar moeda">
          {CURRENCIES[currentCurrency].short}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} aria-label="Alternar sons">
          SOM {state.settings.sound ? '✓' : '—'}
        </button>
        <button type="button" onClick={() => setSettingsModalOpen(true)} aria-label="Abrir configurações">CFG</button>
      </div>
    </header>
  )
}
