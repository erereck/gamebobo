import { useGame } from '../../app/GameContext.jsx'
import { SUBSIDIARY_STUDIOS, subsidiaryForId, subsidiaryPrice } from '../../game/data/subsidiaryStudios.js'
import { modeAllowsSubsidiaries, modeForState } from '../../game/engine/gameModes.js'
import { productionUnits, projectCapacity } from '../../game/engine/production.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function SubsidiaryBoard() {
  const { state, dispatch } = useGame()
  const owned = state.studio.subsidiaries ?? []
  const units = productionUnits(state)
  const acquisitionAllowed = modeAllowsSubsidiaries(state)
  const mode = modeForState(state)
  const available = acquisitionAllowed ? SUBSIDIARY_STUDIOS.filter(studio => state.date.year >= studio.fromYear && !owned.some(item => item.studioId === studio.id)) : []
  return (
    <section className="subsidiary-board">
      <header><div><p className="overline">GRUPO DE ESTÚDIOS</p><h3>Compre capacidade, não só prédio.</h3></div><span>{owned.length} CONTROLADO{owned.length === 1 ? '' : 'S'} · {projectCapacity(state)} FRENTES ATIVAS</span></header>
      {owned.length > 0 && <div className="subsidiary-owned">{owned.map(item => {
        const studio = subsidiaryForId(item.studioId)
        if (!studio) return null
        const studioUnits = units.filter(unit => unit.subsidiaryId === studio.id)
        const reinforcements = studioUnits.reduce((sum, unit) => sum + unit.assignedMembers, 0)
        const fastest = studioUnits.reduce((max, unit) => Math.max(max, unit.pace), 0)
        return <article key={item.id}><span>DESDE {item.acquiredYear}</span><strong>{studio.name}</strong><p>{studio.description}</p><small>{studio.capacity} frente{studio.capacity > 1 ? 's' : ''} · força-base {studio.skill} · {reinforcements} reforço{reinforcements === 1 ? '' : 's'} seu{reinforcements === 1 ? '' : 's'} · até ×{fastest.toFixed(2)} · {formatMoney(studio.monthly)}/mês</small></article>
      })}</div>}
      {acquisitionAllowed ? <details className="subsidiary-market" open={!owned.length}><summary>Estúdios disponíveis para aquisição</summary><div>{available.length ? available.map(studio => {
        const price = subsidiaryPrice(state, studio)
        return <article key={studio.id}><div><span>ESPECIALIDADE · {studio.specialty.toUpperCase()}</span><strong>{studio.name}</strong><p>{studio.description}</p><small>{studio.capacity} frente{studio.capacity > 1 ? 's' : ''} · força {studio.skill} · burn {formatMoney(studio.monthly)}/mês</small></div><Button variant="primary" size="small" disabled={state.player.money < price} onClick={() => dispatch({ type: 'ACQUIRE_SUBSIDIARY', studioId: studio.id })}>COMPRAR · {formatMoney(price)}</Button></article>
      }) : <p>Nenhum alvo novo nesta época.</p>}</div></details> : <div className="subsidiary-mode-lock"><span>MODO {mode.label.toUpperCase()}</span><strong>Aquisições bloqueadas nesta carreira.</strong><p>{mode.id === 'solo' ? 'A proposta aqui é depender apenas do fundador: nenhum funcionário e nenhum estúdio comprado pode virar atalho.' : 'O estúdio pode crescer por contratação, mas não absorve outras empresas. A produção precisa continuar pequena por escolha.'}</p></div>}
    </section>
  )
}
