import { useGame } from '../../app/GameContext.jsx'
import { PERSONALITIES, ROLES } from '../../game/data/team.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function TeamRoster() {
  const { state, dispatch } = useGame()
  return (
    <section className="team-roster">
      <header><div><p className="overline">EQUIPE</p><h3>{state.studio.team.length ? `${state.studio.team.length + 1} pessoas fazendo jogo` : 'Ainda é só você'}</h3></div><span>MORAL {state.studio.morale}%</span></header>
      <div className="team-list">
        <article className="team-member founder"><div className="person-avatar">EL</div><div><strong>{state.player.name}</strong><span>Fundador · Geral</span><small>Não recebe salário. Ainda.</small></div></article>
        {state.studio.team.map(person => {
          const role = ROLES.find(item => item.id === person.roleId)
          const personality = PERSONALITIES.find(item => item.id === person.personalityId)
          return <article className="team-member" key={person.id}><div className="person-avatar">{person.name.split(' ').map(part => part[0]).join('').slice(0,2)}</div><div><strong>{person.name}</strong><span>{role.label} · {person.skill}</span><small>{personality.name} · moral {person.morale}% · {formatMoney(person.salary)}/mês</small></div><Button size="small" onClick={() => dispatch({ type: 'FIRE_MEMBER', personId: person.id })}>DESLIGAR</Button></article>
        })}
      </div>
    </section>
  )
}
