import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function AwardsModal({ item }) {
  const { dispatch } = useGame()
  const results = useMemo(() => [...item.results].sort((a, b) => (a.categoryId === 'goty') - (b.categoryId === 'goty')), [item.results])
  const [revealed, setRevealed] = useState(0)
  const complete = revealed >= results.length
  const current = results[Math.max(0, revealed - 1)]

  useEffect(() => {
    if (complete) return undefined
    const delay = revealed === results.length - 1 ? 1500 : revealed === 0 ? 900 : 1120
    const timer = window.setTimeout(() => setRevealed(value => Math.min(results.length, value + 1)), delay)
    return () => window.clearTimeout(timer)
  }, [complete, revealed, results.length])

  const advance = () => {
    if (complete) dispatch({ type: 'ACK_QUEUE' })
    else setRevealed(value => Math.min(results.length, value + 1))
  }

  return (
    <Modal open locked className="awards-modal" label={`Prêmios de ${item.year}`}>
      <div className="awards-sheet">
        <p className="overline">PRÊMIOS CONTROLE · {item.year}</p>
        <h2>{complete ? 'As luzes acenderam.' : 'Uma noite de roupa emprestada.'}</h2>
        <div className="award-progress" aria-label={`${revealed} de ${results.length} categorias reveladas`}><span style={{ width: `${results.length ? revealed / results.length * 100 : 100}%` }} /></div>

        {revealed === 0 ? <section className="award-envelope is-closed" aria-live="polite"><span>PRIMEIRO ENVELOPE</span><strong>A banca ainda está conferindo o nome.</strong><i aria-hidden="true" /></section> : (
          <section key={current.categoryId} className={`award-envelope is-open ${current.won ? 'is-winner' : ''} ${current.categoryId === 'goty' ? 'is-goty' : ''}`} aria-live="polite">
            <span>{current.categoryId === 'goty' ? 'ÚLTIMO ENVELOPE · A NOITE TERMINA AQUI' : `ENVELOPE ${revealed} DE ${results.length}`}</span>
            <small>{current.won ? 'E O TROFÉU VAI PARA' : 'ENTRE OS INDICADOS'}</small>
            <h3>{current.category}</h3>
            <strong>{current.gameTitle}</strong>
            {current.won && <div className="award-confetti" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>}
          </section>
        )}

        <ol className="award-receipts" aria-label="Resultados já anunciados">{results.slice(0, Math.max(0, revealed - 1)).map(result => <li key={result.categoryId} className={result.won ? 'is-winner' : ''}><span>{result.won ? 'LEVOU' : 'INDICADO'}</span><strong>{result.category}</strong><small>{result.gameTitle}</small></li>)}</ol>
        {complete && <p className="award-note">{results.some(result => result.won) ? 'Pelo menos um troféu vai voltar no banco de trás.' : 'Não levou troféu. O crachá ficou de lembrança.'}</p>}
        <Button variant="primary" onClick={advance}>{complete ? 'VOLTAR AO TRABALHO' : `ABRIR AGORA · ${Math.min(results.length, revealed + 1)}/${results.length}`}</Button>
      </div>
    </Modal>
  )
}
