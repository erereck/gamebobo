import { Button } from '../../components/ui/Button.jsx'
import { GAME_MODES, gameModeForId } from '../../game/engine/gameModes.js'

export function GameModeSelect({ value = 'traditional', onChange, onContinue, onCancel }) {
  const selected = gameModeForId(value)

  return (
    <div className="game-mode-select">
      <div className="game-mode-heading">
        <p className="overline">ANTES DO PRIMEIRO DIA</p>
        <h2>Que carreira você quer viver?</h2>
        <p>O modo é uma regra permanente deste save. Não é só dificuldade: ele muda o tipo de estúdio, as escolhas disponíveis e o jeito que essa linha do tempo pode crescer.</p>
      </div>

      <div className="game-mode-grid" role="radiogroup" aria-label="Modos de jogo">
        {GAME_MODES.map(mode => {
          const checked = mode.id === selected.id
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={checked}
              className={`game-mode-card ${checked ? 'is-selected' : ''}`}
              onClick={() => onChange(mode.id)}
            >
              <span className="mode-card-top"><b>{mode.kicker}</b><em>{mode.difficulty}</em></span>
              <strong>{mode.label}</strong>
              <p>{mode.description}</p>
              <div>{mode.rules.map(rule => <small key={rule}>{rule}</small>)}</div>
            </button>
          )
        })}
      </div>

      <section className="game-mode-receipt" aria-live="polite">
        <span>MODO ESCOLHIDO</span>
        <strong>{selected.label}</strong>
        <p>{selected.description}</p>
      </section>

      <div className="game-mode-actions">
        {onCancel && <Button type="button" onClick={onCancel}>VOLTAR AOS SAVES</Button>}
        <Button type="button" variant="primary" onClick={onContinue}>CONFIGURAR ESTA CARREIRA</Button>
      </div>
    </div>
  )
}
