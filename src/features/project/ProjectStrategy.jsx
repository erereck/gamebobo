import { useGame } from '../../app/GameContext.jsx'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'
import { WorkbenchCard } from '../../components/ui/WorkbenchCard.jsx'

const plans = [
  { id: 'shadow', name: 'Lançamento surpresa', cost: 0, copy: 'Sem campanha. Menos expectativa e menos alcance.' },
  { id: 'standard', name: 'Lançamento normal', cost: 1200, copy: 'Uma página de loja, screenshots e alguma divulgação.' },
  { id: 'campaign', name: 'Campanha grande', cost: 8000, copy: 'Compra atenção. A cobrança vem junto.' },
  { id: 'early', name: 'Acesso antecipado', cost: 500, copy: 'Vende antes de terminar e transforma jogador em testador.' },
]

export function ProjectStrategy() {
  const { state, dispatch } = useGame()
  const project = state.currentProject
  if (!project) return null
  const offer = state.opportunities.publisherOffers.find(item => item.projectId === project.id)
  return (
    <WorkbenchCard kicker="PLANO DE LANÇAMENTO" meta={project.announced ? `HYPE ${project.hype}` : 'NÃO ANUNCIADO'} className="strategy-card">
      <div className="strategy-body">
        <section>
          <h3>{project.announced ? 'O público já sabe.' : 'Ainda dá para trabalhar em silêncio.'}</h3>
          <p>{project.announced ? `Anunciado em ${project.announcementDate}. Cada atraso agora acontece em público.` : 'Anunciar aumenta hype e pressão. Também abre conversa com editoras.'}</p>
          {!project.announced && <Button variant="primary" size="small" onClick={() => dispatch({ type: 'ANNOUNCE_PROJECT' })}>ANUNCIAR JOGO</Button>}
        </section>
        <section className="launch-plans">{plans.map(plan => <button key={plan.id} type="button" className={project.launchPlan === plan.id ? 'is-active' : ''} onClick={() => dispatch({ type: 'SET_LAUNCH_PLAN', plan: plan.id })} disabled={state.player.money < plan.cost}><strong>{plan.name}</strong><small>{plan.copy}</small><em>{plan.cost ? formatMoney(plan.cost) : 'SEM CUSTO'}</em></button>)}</section>
        <section className="publisher-slot">
          {project.publisher ? <><span>EDITORA</span><h3>{project.publisher.name}</h3><p>Mais alcance. {Math.round(project.publisher.royalty * 100)}% da sua parte fica com a editora.</p></> : offer ? <><span>PROPOSTA NA MESA</span><h3>{offer.name}</h3><p>{offer.demand}</p><div><strong>Adiantamento {formatMoney(offer.advance)}</strong><small>{Math.round(offer.royalty * 100)}% de participação · alcance ×{offer.reach}</small></div><Button variant="primary" size="small" onClick={() => dispatch({ type: 'ACCEPT_PUBLISHER', offerId: offer.id })}>ASSINAR CONTRATO</Button></> : project.announced ? <><span>EDITORA</span><h3>Sem proposta</h3><p>Você pode procurar uma. A primeira conversa nem sempre é boa.</p><Button size="small" onClick={() => dispatch({ type: 'REQUEST_PUBLISHER' })}>PROCURAR EDITORA</Button></> : null}
        </section>
      </div>
    </WorkbenchCard>
  )
}
