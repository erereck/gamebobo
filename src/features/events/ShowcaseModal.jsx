import { useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { GAME_EVENTS } from '../../game/data/gameEvents.js'
import { showcaseTargets } from '../../game/engine/expansionTick.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function ShowcaseModal({ item }) {
  const { state, dispatch } = useGame()
  const event = GAME_EVENTS.find(candidate => candidate.id === item.eventId)
  const targets = showcaseTargets(state)
  const [targetId, setTargetId] = useState(targets[0]?.id ?? '')
  if (!event) return null
  const locked = state.player.reputation < event.minReputation
  const broke = state.player.money < event.cost
  const exhausted = state.player.energy < 8
  const canAttend = Boolean(targetId && !locked && !broke && !exhausted)
  return (
    <Modal open locked className="showcase-modal" label={event.name}>
      <div className="showcase-sheet">
        <p className="overline">{event.tier} · {state.date.year}</p>
        <h2>{item.title}</h2>
        <p>{event.copy}</p>
        <div className="showcase-metrics"><div><span>CUSTO</span><strong>{formatMoney(event.cost)}</strong></div><div><span>ALCANCE</span><strong>+{event.followers}</strong></div><div><span>HYPE</span><strong>+{event.hype}</strong></div><div><span>REP. MÍNIMA</span><strong>{event.minReputation}</strong></div></div>
        <section className="showcase-targets"><span>QUAL JOGO VAI PARA O PALCO?</span>{targets.length ? <div>{targets.map(target => <label key={target.id} className={targetId === target.id ? 'is-selected' : ''}><input type="radio" name="showcaseTarget" checked={targetId === target.id} onChange={() => setTargetId(target.id)} /><span><strong>{target.title}</strong><small>{target.kind === 'project' ? 'EM PRODUÇÃO' : 'LANÇADO'} · {target.meta}</small></span></label>)}</div> : <p>Você não tem projeto ativo nem jogo lançado neste ano ou no anterior.</p>}</section>
        {(locked || broke || exhausted) && <p className="showcase-warning">{locked ? `O evento exige reputação ${event.minReputation}.` : broke ? `Faltam recursos para montar o estande (${formatMoney(event.cost)}).` : 'A equipe principal está sem energia para representar o estúdio.'}</p>}
        <footer><Button onClick={() => dispatch({ type: 'SKIP_SHOWCASE' })}>DEIXAR PASSAR</Button><Button variant="primary" disabled={!canAttend} onClick={() => dispatch({ type: 'ATTEND_SHOWCASE', eventId: event.id, targetId })}>LEVAR ESTE JOGO</Button></footer>
      </div>
    </Modal>
  )
}
