import { useGame } from '../app/GameContext.jsx'
import { MARKET_ANGLES, PLATFORMS, labelOf } from '../game/data/catalog.js'
import { formatNumber } from '../game/engine/utils.js'
import { marketAngleCopy } from '../game/data/eraLanguage.js'

export function MarketScreen() {
  const { state } = useGame()
  const angle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  return (
    <section className="screen" aria-labelledby="market-title">
      <header className="screen-heading"><div><p className="overline">O MUNDO LÁ FORA</p><h2 id="market-title">Mercado</h2></div><p>Nenhuma combinação fica certa para sempre.</p></header>
      <div className="market-grid">
        <section className="market-hero"><p className="overline">TENDÊNCIA ATUAL</p><span className="market-arrow">↗</span><h3>{labelOf(state.world.knownGenres, state.market.genre)}</h3><strong>{angle.label}</strong><p>{marketAngleCopy(angle, state.date.year)}</p><div className="heat-meter"><span style={{ width: `${state.market.heat}%` }} /></div><small>Mais {state.market.monthsLeft} meses, se a previsão estiver certa.</small></section>
        <section className="platform-board"><div className="card-kicker"><span>PLATAFORMAS</span><span>PARTICIPAÇÃO</span></div>{PLATFORMS.filter(platform => state.date.year >= platform.unlockYear).map(platform => <div key={platform.id}><strong>{platform.label}</strong><span><i style={{ width: `${state.market.platforms[platform.id] ?? 0}%` }} /></span><em>{state.market.platforms[platform.id] ?? 0}%</em></div>)}</section>
      </div>
      <section className="competitor-section"><header><p className="overline">OUTROS ESTÚDIOS</p><h3>Eles também estão lançando.</h3></header><div className="competitor-grid">{state.competitors.map(studio => <article key={studio.id}><span>{studio.relation === 'rival' ? 'RIVAL' : studio.relation === 'friendly' ? 'AMIGÁVEL' : 'NEUTRO'}</span><h4>{studio.name}</h4><p>Especialidade: {labelOf(state.world.knownGenres, studio.specialty)}</p><div className="relation-meter" aria-label={`Relação ${studio.relationScore ?? 0}`}><i style={{ left: `${Math.max(0, Math.min(100, (studio.relationScore ?? 0) / 2 + 50))}%` }} /></div>{studio.games[0] ? <div><strong>{studio.games[0].title}</strong><small>Nota {studio.games[0].score} · {formatNumber(studio.games[0].sales)} cópias</small></div> : <small>Nenhum lançamento recente.</small>}</article>)}</div></section>
    </section>
  )
}
