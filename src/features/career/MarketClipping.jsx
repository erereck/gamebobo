import { useGame } from '../../app/GameContext.jsx'
import { MARKET_ANGLES, labelOf } from '../../game/data/catalog.js'
import { WorkbenchCard } from '../../components/ui/WorkbenchCard.jsx'
import { marketAngleCopy, marketClippingLabel } from '../../game/data/eraLanguage.js'

export function MarketClipping() {
  const { state } = useGame()
  const angle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  return (
    <WorkbenchCard kicker={marketClippingLabel(state.date.year)} meta={state.date.year} className="trend-card">
      <span className="trend-label">MERCADO ↗</span>
      <h2>{labelOf(state.world.knownGenres, state.market.genre)} vende bem</h2>
      <p>{marketAngleCopy(angle, state.date.year)}</p>
      <small>Janela estimada: {state.market.monthsLeft} meses</small>
      <i className="paper-tape" aria-hidden="true" />
    </WorkbenchCard>
  )
}
