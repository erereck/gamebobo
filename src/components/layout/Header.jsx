import { VERSION_INFO as versionInfo } from '../../version.js'
import { dateLabel } from '../../game/engine/world.js'
import { CURRENCIES } from '../../game/engine/utils.js'
import { useGame } from '../../app/GameContext.jsx'
import { Icon } from '../ui/Icon.jsx'

export function Header() {
  const { state, dispatch, setSettingsModalOpen } = useGame()
  const currencyCodes = Object.keys(CURRENCIES)
  const currentCurrency = state.settings.currency ?? 'BRL'
  const nextCurrency = currencyCodes[(currencyCodes.indexOf(currentCurrency) + 1) % currencyCodes.length]
  const musicSilent = state.settings.musicMuted || (state.settings.musicVolume ?? .18) === 0
  const toggleMusicMute = () => state.settings.musicVolume === 0 && !state.settings.musicMuted
    ? dispatch({ type: 'SET_MUSIC_VOLUME', volume: .18 })
    : dispatch({ type: 'TOGGLE_MUSIC_MUTE' })
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
        <button type="button" className="header-icon-button" onClick={toggleMusicMute} aria-label={musicSilent ? 'Ativar música' : 'Mutar música'} title={musicSilent ? 'Ativar música' : 'Mutar música'}>
          <Icon name={musicSilent ? 'speakerOff' : 'speaker'} size={18} />
        </button>
        <button type="button" className="header-icon-button" onClick={() => setSettingsModalOpen(true)} aria-label="Abrir configurações" title="Configurações"><Icon name="settings" size={18} /></button>
      </div>
    </header>
  )
}
