import { useEffect, useState } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { PLATFORMS, labelOf } from '../../game/data/catalog.js'
import { formatMoney, formatNumber } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { CountUp } from '../../components/ui/CountUp.jsx'
import { licenseFromState } from '../../game/engine/licensing.js'

export function ReleaseModal({ gameId }) {
  const { state, dispatch } = useGame()
  const game = state.games.find(item => item.id === gameId)
  const [stage, setStage] = useState('waiting')
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!game) return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setDisplayScore(game.score)
      setStage('consequences')
      return undefined
    }

    let frame
    let consequenceTimer
    const suspenseTimer = window.setTimeout(() => {
      setStage('counting')
      const startedAt = performance.now()
      const duration = 3200
      const count = now => {
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 4)
        setDisplayScore(Math.min(game.score, Math.floor(game.score * eased)))
        if (progress < 1) {
          frame = requestAnimationFrame(count)
          return
        }
        setDisplayScore(game.score)
        setStage('verdict')
        consequenceTimer = window.setTimeout(() => setStage('consequences'), 850)
      }
      frame = requestAnimationFrame(count)
    }, 700)

    return () => {
      window.clearTimeout(suspenseTimer)
      window.clearTimeout(consequenceTimer)
      cancelAnimationFrame(frame)
    }
  }, [game?.id, game?.score])

  if (!game) return null
  const stars = Math.round(game.score / 20)
  const verdictReady = stage === 'verdict' || stage === 'consequences'
  const consequencesReady = stage === 'consequences'

  return (
    <Modal open locked className="release-modal" label={`Lançamento de ${game.title}`}>
      <div className="review-strip">
        <span>BOLETIM DA IMPRENSA · {game.reviews?.length ?? 1} VEREDITOS</span>
        <span className={verdictReady ? 'is-revealed' : 'is-redacted'}>
          {verdictReady ? `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}` : 'EDIÇÃO EM FECHAMENTO'}
        </span>
      </div>
      <div className="release-sheet">
        <p className="overline">{labelOf(state.world.knownGenres, game.genre)} · {labelOf(PLATFORMS, game.platform)}</p>
        <h2>{game.title}</h2>
        {game.licenseIds?.length > 0 && <p className="release-license">COM {game.licenseIds.map(id => licenseFromState(state, id)?.name).join(' × ')}</p>}
        <div className={`score score--${stage}`} aria-live="polite" aria-atomic="true">
          {stage === 'waiting'
            ? <strong className="score-sealed" aria-label="Nota ainda escondida">?</strong>
            : <><strong>{displayScore}</strong><span>/ 100</span></>}
        </div>
        <p className="score-status">
          {stage === 'waiting' ? 'A banca ainda está fechando a nota.' : stage === 'counting' ? 'Contagem da redação…' : 'Veredito publicado.'}
        </p>
        {!game.reviews?.length && <blockquote className={verdictReady ? 'release-verdict is-visible' : 'release-verdict'} aria-hidden={!verdictReady}>“{game.quote}”</blockquote>}
        {game.reviews?.length > 0 && <section className={verdictReady ? 'press-board is-visible' : 'press-board'} aria-label="Notas da imprensa">
          {game.reviews.map(review => <article key={review.outletId}><header><strong>{review.outlet}</strong><b>{review.score}</b></header><p>“{review.quote}”</p><span>{review.format}</span></article>)}
        </section>}
        <div className={consequencesReady ? 'release-aftermath is-visible' : 'release-aftermath'} aria-hidden={!consequencesReady}>
          <div className="release-numbers">
            <div><span>PRIMEIRO MÊS</span><strong><CountUp value={game.sales} format={formatNumber} active={consequencesReady} /></strong></div>
            <div><span>RECEITA</span><strong><CountUp value={game.revenue} format={formatMoney} active={consequencesReady} duration={900} /></strong></div>
            <div><span>NOVOS SEGUIDORES</span><strong><CountUp value={game.newFollowers} format={formatNumber} prefix="+" active={consequencesReady} duration={1040} /></strong></div>
          </div>
          {game.breakout && <section className={game.phenomenon ? 'release-breakout is-phenomenon' : 'release-breakout'} aria-label={game.phenomenon ? 'Fenômeno histórico' : 'Sucesso inesperado'}>
            <span>{game.phenomenon ? 'A LINHA DO TEMPO MUDOU' : 'NINGUÉM VIU CHEGANDO'}</span>
            <strong>{game.phenomenon ? 'FENÔMENO' : 'ESTOURO'}</strong>
            <p>{game.phenomenon ? 'Não é só um lançamento grande. Este jogo virou referência para todo mundo que vem depois.' : 'O jogo atravessou a bolha do estúdio e encontrou gente demais para caber na previsão.'}</p>
          </section>}
          <p className="support-note">Nos próximos meses ainda podem aparecer bugs, vídeos e pedidos de reembolso.</p>
          <Button variant="primary" onClick={() => dispatch({ type: 'ACK_QUEUE' })}>VOLTAR PARA A CARREIRA</Button>
        </div>
      </div>
    </Modal>
  )
}
