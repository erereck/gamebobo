import { useGame } from '../../app/GameContext.jsx'
import { PERSONALITIES, ROLES } from '../../game/data/team.js'
import { modeAllowsHiring, modeForState } from '../../game/engine/gameModes.js'
import { productionUnits } from '../../game/engine/production.js'
import { teamAssignmentUnits } from '../../game/engine/teamManagement.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function TeamRoster() {
  const { state, dispatch } = useGame()
  const founderInitials = state.player.name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const assignments = teamAssignmentUnits(state)
  const units = productionUnits(state)
  const unitMap = Object.fromEntries(units.map(unit => [unit.id, unit]))
  const teamExpansionAllowed = modeAllowsHiring(state)
  const mode = modeForState(state)

  return (
    <section className="team-roster team-roster-managed">
      <header>
        <div><p className="overline">EQUIPE</p><h3>{state.studio.team.length ? `${state.studio.team.length + 1} pessoas fazendo jogo` : 'Ainda é só você'}</h3></div>
        <div className="team-roster-head-actions"><span>MORAL {state.studio.morale}%</span>{teamExpansionAllowed ? <Button size="small" variant="primary" onClick={() => dispatch({ type: 'CREATE_PRODUCTION_TEAM' })}>CRIAR NOVA EQUIPE</Button> : <span>MODO {mode.label.toUpperCase()}</span>}</div>
      </header>

      <div className="production-team-overview">
        {units.map(unit => (
          <article key={unit.id} className={`${unit.canWork ? '' : 'is-empty'} ${unit.subsidiaryId ? 'is-subsidiary' : ''}`}>
            <span>{unit.subsidiaryId ? 'EQUIPE COMPRADA' : unit.main ? 'EQUIPE INICIAL' : 'EQUIPE INTERNA'}</span>
            <strong>{unit.name}</strong>
            <small>{unit.subsidiaryId ? `${unit.assignedMembers} reforço${unit.assignedMembers === 1 ? '' : 's'} seu${unit.assignedMembers === 1 ? '' : 's'} · força ${unit.skill}` : `${unit.memberCount} pessoa${unit.memberCount === 1 ? '' : 's'} · força ${unit.skill || '—'}`}</small>
            <b>{unit.canWork ? `RITMO ×${unit.pace.toFixed(2)}` : 'SEM MEMBROS · PAUSADA'}</b>
          </article>
        ))}
      </div>

      <p className="team-management-note">{teamExpansionAllowed ? 'Não existe limite por equipe. Quanto mais gente você concentrar numa frente, mais rápido ela anda — com retorno decrescente. Funcionários novos começam na Equipe principal.' : 'Autor Solo: esta carreira não pode contratar, criar equipes paralelas ou comprar estúdios. O ritmo extra do modo aparece diretamente na Equipe principal.'}</p>

      <div className="team-list">
        <article className="team-member founder">
          <div className="person-avatar">{founderInitials}</div>
          <div><strong>{state.player.name}</strong><span>Fundador · Geral</span><small>Fixo na Equipe principal. Não recebe salário. Ainda.</small></div>
          <div className="team-member-actions"><select value="founder" disabled aria-label="Equipe do fundador"><option value="founder">Equipe principal</option></select></div>
        </article>
        {state.studio.team.map(person => {
          const role = ROLES.find(item => item.id === person.roleId)
          const personality = PERSONALITIES.find(item => item.id === person.personalityId)
          const productionTeamId = person.productionTeamId ?? 'founder'
          const currentUnit = unitMap[productionTeamId]
          return (
            <article className="team-member" key={person.id}>
              <div className="person-avatar">{person.name.split(' ').map(part => part[0]).join('').slice(0,2)}</div>
              <div><strong>{person.name}</strong><span>{role.label} · {person.skill}</span><small>{personality.name} · moral {person.morale}% · {formatMoney(person.salary)}/mês{currentUnit ? ` · ${currentUnit.name}` : ''}</small></div>
              <div className="team-member-actions">
                <select value={productionTeamId} aria-label={`Equipe de ${person.name}`} onChange={event => dispatch({ type: 'ASSIGN_TEAM_MEMBER', personId: person.id, productionTeamId: event.target.value })}>
                  {assignments.map(unit => <option key={unit.id} value={unit.id}>{unit.name}{unit.subsidiaryId ? ' · comprada' : ''}</option>)}
                </select>
                <Button size="small" onClick={() => dispatch({ type: 'FIRE_MEMBER', personId: person.id })}>DESLIGAR</Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
