import { useGame } from '../../app/GameContext.jsx'
import { PLATFORMS, labelOf } from '../../game/data/catalog.js'
import { formatMoney, formatNumber } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { licenseFromState } from '../../game/engine/licensing.js'

export function ReleaseModal({ gameId }) {
  const { state, dispatch } = useGame()
  const game = state.games.find(item => item.id === gameId)
  if (!game) return null
  const stars = Math.round(game.score / 20)
  return (
    <Modal open locked className="release-modal" label={`Lançamento de ${game.title}`}>
      <div className="review-strip"><span>ANÁLISE · REVISTA CONTROLE</span><span>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span></div>
      <div className="release-sheet">
        <p className="overline">{labelOf(state.world.knownGenres, game.genre)} · {labelOf(PLATFORMS, game.platform)}</p>
        <h2>{game.title}</h2>
        {game.licenseIds?.length > 0 && <p className="release-license">COM {game.licenseIds.map(id => licenseFromState(state, id)?.name).join(' × ')}</p>}
        <div className="score"><strong>{game.score}</strong><span>/ 100</span></div>
        <blockquote>“{game.quote}”</blockquote>
        <div className="release-numbers">
          <div><span>PRIMEIRO MÊS</span><strong>{formatNumber(game.sales)}</strong></div>
          <div><span>RECEITA</span><strong>{formatMoney(game.revenue)}</strong></div>
          <div><span>NOVOS SEGUIDORES</span><strong>+{formatNumber(game.newFollowers)}</strong></div>
        </div>
        <p className="support-note">Nos próximos meses ainda podem aparecer bugs, vídeos e pedidos de reembolso.</p>
        <Button variant="primary" onClick={() => dispatch({ type: 'ACK_QUEUE' })}>VOLTAR PARA A CARREIRA</Button>
      </div>
    </Modal>
  )
}
