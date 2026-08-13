import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { CURRENCIES } from '../../game/engine/utils.js'
import { MusicPlayer } from './MusicPlayer.jsx'

export function SettingsModal() {
  const { state, dispatch, settingsModalOpen, setSettingsModalOpen, setResetModalOpen } = useGame()
  const openNewCareer = () => {
    setSettingsModalOpen(false)
    setResetModalOpen(true)
  }
  return (
    <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} className="settings-modal" label="Configurações">
      <div className="settings-sheet">
        <span className="event-tag">PAINEL DO GABINETE</span>
        <p className="overline">CONFIGURAÇÕES</p>
        <h2 className="settings-title">Do seu jeito.</h2>
        <p className="settings-intro">Preferências ficam guardadas junto desta carreira neste navegador.</p>

        <div className="settings-list">
          <MusicPlayer settings={state.settings} dispatch={dispatch} />
          <label className="settings-row">
            <span><strong>Sons do gabinete</strong><small>Cliques, confirmações e eventos.</small></span>
            <input type="checkbox" checked={state.settings.sound} onChange={() => dispatch({ type: 'TOGGLE_SOUND' })} />
          </label>
          <label className="settings-row">
            <span><strong>Avisos da linha do tempo</strong><small>Marcos históricos, consoles e mudanças de era. Quando ativos, avançam em 8 segundos.</small></span>
            <input type="checkbox" checked={state.settings.timelineNotices !== false} onChange={event => dispatch({ type: 'SET_TIMELINE_NOTICES', enabled: event.target.checked })} />
          </label>
          <fieldset className="settings-currency">
            <legend>MOEDA DA INTERFACE</legend>
            <div>{Object.values(CURRENCIES).map(currency => <button key={currency.code} type="button" className={state.settings.currency === currency.code ? 'is-active' : ''} onClick={() => dispatch({ type: 'SET_CURRENCY', currency: currency.code })}><strong>{currency.short}</strong><span>{currency.label}</span></button>)}</div>
          </fieldset>
        </div>

        <div className="settings-actions"><Button onClick={openNewCareer}>COMEÇAR OUTRA CARREIRA</Button><Button variant="primary" onClick={() => setSettingsModalOpen(false)}>FECHAR</Button></div>
      </div>
    </Modal>
  )
}
