import { useGame } from '../../app/GameContext.jsx'
import { formatMoney, formatNumber } from '../../game/engine/utils.js'
import { reputationLabel } from '../../game/engine/selectors.js'

export function StatStrip() {
  const { state } = useGame()
  const { player } = state
  return (
    <section className="stat-strip" aria-label="Estado da carreira">
      <div className="identity-stat">
        <span className="status-light" aria-hidden="true" />
        <div><strong>{player.name}, {player.age}</strong><span>DEV SOLO · QUARTO DOS FUNDOS</span></div>
      </div>
      <StripStat label="CAIXA" value={formatMoney(player.money)} danger={player.money < 0} />
      <StripStat label="ENERGIA" value={`${player.energy}%`} danger={player.energy < 20} />
      <StripStat label="ESTRESSE" value={`${player.stress}%`} danger={player.stress > 70} />
      <StripStat label="SAÚDE" value={`${player.health}%`} danger={player.health < 35} />
      <StripStat label="SEGUIDORES" value={formatNumber(player.followers)} />
      <StripStat label="NOME NA PRAÇA" value={reputationLabel(player.reputation)} />
    </section>
  )
}

function StripStat({ label, value, danger }) {
  return <div className={`strip-stat ${danger ? 'is-danger' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}
