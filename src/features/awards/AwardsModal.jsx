import { useEffect, useMemo, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'

export function AwardsModal({ item }) {
  const { dispatch } = useGame()
  const results = useMemo(() => [...item.results].sort((a, b) => (a.categoryId === 'goty') - (b.categoryId === 'goty')), [item.results])
  const [revealed, setRevealed] = useState(0)
  const [settling, setSettling] = useState(false)
  const complete = revealed === results.length
  const current = results[Math.max(0, revealed - 1)]

  useEffect(() => {
    if (revealed === 0) return undefined
    setSettling(true)
    const timer = window.setTimeout(() => setSettling(false), 900)
    return () => window.clearTimeout(timer)
  }, [revealed])

  const advance = () => {
    if (complete) dispatch({ type: 'ACK_QUEUE' })
    else setRevealed(value => Math.min(results.length, value + 1))
  }

  const isGoty = current?.categoryId === 'goty'
  const displayedTitle = isGoty ? current.winnerTitle : current?.gameTitle

  return (
    <Modal open locked className="awards-modal" label={`Prêmios de ${item.year}`}>
      <div className="awards-sheet">
        <p className="overline">PRÊMIOS CONTROLE · {item.year}</p>
        <h2>Todo ano termina com um nome.</h2>

        {revealed === 0 ? <section className="award-envelope is-closed" aria-live="polite"><span>PRIMEIRO ENVELOPE</span><strong>A banca ainda está conferindo o nome.</strong><i aria-hidden="true" /></section> : (
          <section key={current.categoryId} className={`award-envelope is-open ${current.won ? 'is-winner' : ''} ${isGoty ? 'is-goty' : ''}`} aria-live="polite">
            <span>ENVELOPE DA BANCA</span>
            <small>{isGoty ? 'JOGO DO ANO' : current.won ? 'E O TROFÉU VAI PARA' : 'ENTRE OS INDICADOS'}</small>
            <h3>{current.category}</h3>
            <strong>{displayedTitle}</strong>
            {isGoty && <p>{current.winnerStudio}{current.won ? ' · É SEU.' : current.nominated && current.gameTitle ? ` · seu indicado foi ${current.gameTitle}.` : ' · venceu a indústria neste ano.'}</p>}
            {current.won && <div className="award-confetti" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>}
          </section>
        )}

        <ol className="award-receipts" aria-label="Resultados já anunciados">{results.slice(0, Math.max(0, revealed - 1)).map(result => <li key={result.categoryId} className={result.won ? 'is-winner' : ''}><span>{result.categoryId === 'goty' ? 'GOTY' : result.won ? 'LEVOU' : 'INDICADO'}</span><strong>{result.category}</strong><small>{result.categoryId === 'goty' ? `${result.winnerTitle} · ${result.winnerStudio}` : result.gameTitle}</small></li>)}</ol>
        {complete && <p className="award-note">{results.some(result => result.won) ? 'Tem troféu seu voltando no banco de trás.' : `Você não levou troféu. Ainda assim, ${results.find(result => result.categoryId === 'goty')?.winnerTitle} ficou registrado como o jogo do ano.`}</p>}
        <Button variant="primary" onClick={advance} disabled={settling}>CONTINUAR</Button>
      </div>
    </Modal>
  )
}
