import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney } from '../../ui/format.js'
import { EXPOS } from '../../game/data/modes.js'
import { moneyScale } from '../../game/data/economy.js'
import { yearFloat } from '../../game/engine/state.js'

// Feira do ano: um jogo sobe ao palco. Em produção ganha hype; à venda ganha cópias.
export function ExpoModal({ item, state }) {
  const expo = EXPOS.find(entry => entry.id === item.expoId)
  if (!expo) return null
  const cost = Math.round(expo.cost * moneyScale(yearFloat(state)))
  const targets = [
    ...state.projects.filter(project => project.kind === 'game').map(project => ({ id: project.id, game: project, tag: 'em produção', icon: 'megaphone' })),
    ...state.games.filter(game => game.onMarket).slice(-3).map(game => ({ id: game.id, game, tag: 'nas lojas', icon: 'chart' })),
  ]
  const broke = state.money < cost
  return (
    <div className="modal-backdrop">
      <article className="event-card expo-card">
        <div className="event-head"><span className="event-icon expo-icon"><Icon name="users" size={40} /></span></div>
        <h2 className="event-title">{expo.name} {item.year}</h2>
        <p className="event-text">Qual jogo sobe ao palco? <b>{fmtMoney(cost)}</b></p>
        <div className="expo-targets">
          {targets.map(target => (
            <button key={target.id} type="button" className="expo-target" disabled={broke} onClick={() => { sfx.fanfare(); vibrate(20); dispatch({ type: 'EXPO_PICK', targetId: target.id }) }}>
              <Cover game={target.game} width={58} />
              <b>{target.game.title}</b>
              <small><Icon name={target.icon} size={11} stroke={2.6} />{target.tag}</small>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => { sfx.back(); dispatch({ type: 'EXPO_PICK', targetId: null }) }}>Deixar passar</button>
      </article>
    </div>
  )
}
