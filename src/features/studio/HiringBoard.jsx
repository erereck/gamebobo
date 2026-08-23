import { useGame } from '../../app/GameContext.jsx'
import { OFFICES, PERSONALITIES, ROLES } from '../../game/data/team.js'
import { hiringSearchCost } from '../../game/engine/studio.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function HiringBoard() {
  const { state, dispatch } = useGame()
  const office = OFFICES[state.studio.officeLevel]
  const isFull = state.studio.team.length >= office.capacity - 1
  const searchCost = hiringSearchCost(state)
  const headhuntCost = hiringSearchCost(state, true)
  return (
    <section className="hiring-board">
      <div className="card-kicker"><span>CANDIDATOS</span><span>{state.studio.team.length + 1}/{office.capacity}</span></div>
      <div className="hiring-market-note"><strong>Mercado de trabalho · {state.date.year}</strong><p>Buscar gente fica mais caro conforme os anos passam e o estúdio cresce. Caça-talentos ignora a lista atual e procura perfis melhores, mas cobra caro.</p></div>
      {state.studio.candidates.length ? <div>{state.studio.candidates.map(person => {
        const role = ROLES.find(item => item.id === person.roleId)
        const personality = PERSONALITIES.find(item => item.id === person.personalityId)
        return <article key={person.id}><div><strong>{person.name}{person.headhunted ? ' · CAÇA-TALENTOS' : ''}</strong><span>{role.label} {person.skill} · potencial {person.potential}</span><small>{personality.name}: {personality.effect}</small></div><div><em>{formatMoney(person.salary)}/mês</em><Button variant="primary" size="small" onClick={() => dispatch({ type: 'HIRE_CANDIDATE', candidateId: person.id })} disabled={isFull || state.player.money < person.salary * 2}>CONTRATAR</Button></div></article>})}</div> : <div className="hiring-empty"><p>{isFull ? 'Não cabe outra mesa neste endereço.' : 'Nenhum currículo na mesa.'}</p></div>}
      <div className="hiring-actions"><Button onClick={() => dispatch({ type: 'REFRESH_CANDIDATES' })} disabled={isFull || state.player.money < searchCost}>{isFull ? 'MUDE DE ESCRITÓRIO' : `BUSCAR CURRÍCULOS · ${formatMoney(searchCost)}`}</Button><Button variant="primary" onClick={() => dispatch({ type: 'HEADHUNT_CANDIDATES' })} disabled={isFull || state.player.money < headhuntCost}>IGNORAR LISTA / CAÇA-TALENTOS · {formatMoney(headhuntCost)}</Button></div>
    </section>
  )
}
