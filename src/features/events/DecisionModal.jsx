import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function DecisionModal({ decision }) {
  const { dispatch } = useGame()
  return (
    <Modal open locked className="decision-modal" label={decision.title}>
      <div className="decision-sheet">
        <span className="event-tag">{decision.tag}</span>
        <p className="overline">{decision.source === 'postLaunch' ? 'DEPOIS DO LANÇAMENTO' : decision.source === 'personal' ? 'VIDA PESSOAL' : 'DURANTE O PROJETO'}</p>
        <h2>{decision.title}</h2>
        <p className="decision-body">{decision.body}</p>
        <div className="decision-choices">{decision.choices.map(choice => (
          <Button key={choice.id} onClick={() => dispatch({ type: 'RESOLVE_DECISION', choiceId: choice.id })}>
            <span><strong>{choice.label}</strong><small>{choice.detail}</small></span><em>ESCOLHER</em>
          </Button>
        ))}</div>
      </div>
    </Modal>
  )
}
