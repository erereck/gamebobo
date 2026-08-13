import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { formatCurrencyCopy } from '../../game/engine/utils.js'

export function InfoModal({ item }) {
  const { dispatch } = useGame()
  return (
    <Modal open locked className="info-modal" label={item.title}>
      <div className="info-sheet">
        <span className="event-tag">{item.tag}</span>
        <p className="overline">A LINHA DO TEMPO ANDOU</p>
        <h2>{item.title}</h2>
        <p>{formatCurrencyCopy(item.body)}</p>
        {item.details?.length > 0 && <div className="info-details">{item.details.map(detail => <span key={detail}>{formatCurrencyCopy(detail)}</span>)}</div>}
        <Button variant="primary" onClick={() => dispatch({ type: 'ACK_QUEUE' })}>CONTINUAR</Button>
      </div>
    </Modal>
  )
}
