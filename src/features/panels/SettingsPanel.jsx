import { useState } from 'react'
import { dispatch, useGame, clearSave, writeSave, store } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { VERSION_INFO } from '../../version.js'

function Switch({ on, onChange, label, icon }) {
  return (
    <button type="button" className={`switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => { sfx.click(); onChange(!on) }}>
      <Icon name={icon} size={18} />
      <span>{label}</span>
      <i className="switch-knob" />
    </button>
  )
}

export function SettingsPanel({ onClose }) {
  const state = useGame()
  const [confirm, setConfirm] = useState(false)
  const set = (key, value) => dispatch({ type: 'SET_SETTING', key, value })
  return (
    <div className="settings">
      <Switch on={state.settings.sound} onChange={v => set('sound', v)} label="Efeitos e vozes" icon={state.settings.sound ? 'sound' : 'mute'} />
      <Switch on={state.settings.music} onChange={v => set('music', v)} label="Música" icon="music" />
      <label className="volume">
        <Icon name="headphones" size={18} />
        <input type="range" min="0" max="0.6" step="0.02" value={state.settings.musicVolume} onChange={event => set('musicVolume', Number(event.target.value))} aria-label="Volume da música" />
      </label>
      <p className="tip"><Icon name="info" size={14} />Arraste o escritório para girar. Role para dar zoom. Clique num boneco para ver o crachá.</p>
      <button type="button" className="btn" onClick={() => { writeSave(store.getState()); sfx.chime() }}><Icon name="check" size={16} />Salvar agora</button>
      {!confirm ? (
        <button type="button" className="btn btn-ghost danger" onClick={() => setConfirm(true)}><Icon name="refresh" size={16} />Nova carreira</button>
      ) : (
        <div className="confirm">
          <span>Apagar este save?</span>
          <button type="button" className="btn btn-small btn-tomato" onClick={() => { clearSave(); onClose(); dispatch({ type: 'LOAD', state: null }) }}>Apagar</button>
          <button type="button" className="btn btn-small" onClick={() => setConfirm(false)}>Não</button>
        </div>
      )}
      <p className="version">Gamebobo {VERSION_INFO.version} · {VERSION_INFO.codename}</p>
    </div>
  )
}
