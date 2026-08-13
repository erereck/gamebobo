import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function AwardsModal({ item }) {
  const { dispatch } = useGame()
  return (
    <Modal open locked className="awards-modal" label={`Prêmios de ${item.year}`}>
      <div className="awards-sheet">
        <p className="overline">PRÊMIOS CONTROLE · {item.year}</p>
        <h2>Uma noite de roupa emprestada.</h2>
        <div className="award-results">{item.results.map(result => (
          <article key={result.categoryId} className={result.won ? 'is-winner' : ''}>
            <span>{result.won ? 'VENCEU' : 'INDICADO'}</span><h3>{result.category}</h3><p>{result.gameTitle}</p>
          </article>
        ))}</div>
        <p className="award-note">{item.results.some(result => result.won) ? 'Pelo menos um troféu vai voltar no banco de trás.' : 'Não levou troféu. O crachá ficou de lembrança.'}</p>
        <Button variant="primary" onClick={() => dispatch({ type: 'ACK_QUEUE' })}>VOLTAR AO TRABALHO</Button>
      </div>
    </Modal>
  )
}
