import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { formatCurrencyCopy } from '../../game/engine/utils.js'

const signed = value => `${value > 0 ? '+' : '−'}${Math.abs(value)}`

function impactOf(effects = {}) {
  const impact = []
  const playerLabels = { money: 'CAIXA', energy: 'ENERGIA', stress: 'ESTRESSE', reputation: 'REPUTAÇÃO', followers: 'SEGUIDORES', health: 'SAÚDE' }
  Object.entries(effects.player ?? {}).forEach(([key, value]) => {
    if (playerLabels[key]) impact.push(`${signed(value)} ${playerLabels[key]}`)
  })
  const projectLabels = { quality: 'QUALIDADE', months: 'MÊS', hype: 'HYPE', pressure: 'PRESSÃO', innovation: 'INOVAÇÃO' }
  Object.entries(effects.project ?? {}).forEach(([key, value]) => {
    if (projectLabels[key] && typeof value === 'number') impact.push(`${signed(value)} ${projectLabels[key]}`)
  })
  if (effects.game?.salesRate) impact.push(`${signed(Math.round(effects.game.salesRate * 100))}% VENDAS`)
  if (effects.game?.trust) impact.push(`${signed(effects.game.trust)} CONFIANÇA`)
  if (effects.studio?.research) impact.push(`${signed(effects.studio.research)} PESQUISA`)
  return impact.slice(0, 3).join(' · ') || 'EFEITO INCERTO'
}

export function DecisionModal({ decision }) {
  const { dispatch } = useGame()
  return (
    <Modal open locked className="decision-modal" label={decision.title}>
      <div className="decision-sheet">
        <span className="event-tag">{decision.tag}</span>
        <p className="overline">{decision.source === 'postLaunch' ? 'DEPOIS DO LANÇAMENTO' : decision.source === 'personal' ? 'VIDA PESSOAL' : 'DURANTE O PROJETO'}</p>
        <h2>{decision.title}</h2>
        <p className="decision-body">{formatCurrencyCopy(decision.body)}</p>
        {decision.chat?.length > 0 && <section className="live-chat" aria-label="Chat da transmissão">
          <header><span>CHAT AO VIVO</span><strong>{decision.chatSentiment}% CURTINDO</strong></header>
          <div>{decision.chat.map((message, index) => <p key={`${message.name}-${index}`}><b className={message.color}>{message.name}</b><span>{message.text}</span></p>)}</div>
        </section>}
        <div className="decision-choices">{decision.choices.map(choice => (
          <Button key={choice.id} onClick={() => dispatch({ type: 'RESOLVE_DECISION', choiceId: choice.id })}>
            <span><strong>{choice.label}</strong><small>{formatCurrencyCopy(choice.detail ?? choice.hint)}</small></span><em>{impactOf(choice.effects)}</em>
          </Button>
        ))}</div>
      </div>
    </Modal>
  )
}
