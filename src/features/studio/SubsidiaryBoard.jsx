import { useGame } from '../../app/GameContext.jsx'
import { SUBSIDIARY_STUDIOS, subsidiaryForId, subsidiaryPrice } from '../../game/data/subsidiaryStudios.js'
import { projectCapacity } from '../../game/engine/production.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function SubsidiaryBoard() {
  const { state, dispatch } = useGame()
  const owned = state.studio.subsidiaries ?? []
  const available = SUBSIDIARY_STUDIOS.filter(studio => state.date.year >= studio.fromYear && !owned.some(item => item.studioId === studio.id))
  return (
    <section className="subsidiary-board">
      <header><div><p className="overline">GRUPO DE ESTÚDIOS</p><h3>Compre capacidade, não só prédio.</h3></div><span>{owned.length} CONTROLADO{owned.length === 1 ? '' : 'S'} · {projectCapacity(state)} FRENTES</span></header>
      {owned.length > 0 && <div className="subsidiary-owned">{owned.map(item => {
        const studio = subsidiaryForId(item.studioId)
        if (!studio) return null
        return <article key={item.id}><span>DESDE {item.acquiredYear}</span><strong>{studio.name}</strong><p>{studio.description}</p><small>{studio.capacity} frente{studio.capacity > 1 ? 's' : ''} · força {studio.skill} · {formatMoney(studio.monthly)}/mês</small></article>
      })}</div>}
      <details className="subsidiary-market" open={!owned.length}><summary>Estúdios disponíveis para aquisição</summary><div>{available.length ? available.map(studio => {
        const price = subsidiaryPrice(state, studio)
        return <article key={studio.id}><div><span>ESPECIALIDADE · {studio.specialty.toUpperCase()}</span><strong>{studio.name}</strong><p>{studio.description}</p><small>{studio.capacity} frente{studio.capacity > 1 ? 's' : ''} · força {studio.skill} · burn {formatMoney(studio.monthly)}/mês</small></div><Button variant="primary" size="small" disabled={state.player.money < price} onClick={() => dispatch({ type: 'ACQUIRE_SUBSIDIARY', studioId: studio.id })}>COMPRAR · {formatMoney(price)}</Button></article>
      }) : <p>Nenhum alvo novo nesta época.</p>}</div></details>
    </section>
  )
}
