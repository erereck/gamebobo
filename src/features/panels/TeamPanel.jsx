import { useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { fmtMoney } from '../../ui/format.js'
import { OFFICES, moneyScale } from '../../game/data/economy.js'
import { traitById } from '../../game/data/staff.js'
import { roleOf } from '../../game/engine/staff.js'
import { yearFloat } from '../../game/engine/state.js'
import { hireFee } from '../../game/engine/reducer.js'
import { acquisitionPrice, buyableStudios, localStaff, projectOfTeam, teamMembers, teamOf } from '../../game/engine/teams.js'
import { allowsAcquire, allowsHiring, allowsTeams } from '../../game/engine/modes.js'
import { rivalTierAt } from '../../game/data/content/rivals.js'
import { BadgeCard, SkillBars } from '../office/StaffBadge.jsx'

function Roster({ state }) {
  const [open, setOpen] = useState(null)
  const scale = moneyScale(yearFloat(state))
  const payroll = state.staff.reduce((sum, p) => sum + (p.founder ? 0 : p.salary), 0) * scale
  return (
    <>
      <div className="payroll"><Icon name="cash" size={14} />Folha {fmtMoney(Math.round(payroll))}/mês</div>
      {state.teams.map(team => {
        const members = teamMembers(state, team.id, false)
        const project = projectOfTeam(state, team.id)
        return (
          <section key={team.id} className={`team-block ${team.remote ? 'remote' : ''}`} style={team.color ? { '--tc': team.color } : undefined}>
            <header className="team-head">
              <Icon name={team.remote ? 'building' : 'team'} size={16} />
              <b>{team.name}</b>
              <span className="team-count">{members.length}</span>
              {project && <span className="team-busy"><Icon name={project.kind === 'freela' ? 'briefcase' : 'cartridge'} size={12} stroke={2.6} />{project.title}</span>}
            </header>
            <div className="roster">
              {members.map(person => (
                <div key={person.id} className={`roster-row ${open === person.id ? 'open' : ''}`}>
                  <div className="roster-line">
                    <button type="button" className="roster-head" onClick={() => { sfx.click(); setOpen(open === person.id ? null : person.id) }}>
                      <Avatar look={person.look} size={36} mood={person.energy < 20 ? 'sleep' : null} />
                      <span className="roster-name"><b>{person.name}</b><small><Icon name={roleOf(person).icon} size={11} stroke={2.6} />{roleOf(person).short} · nv {person.level}</small></span>
                      <span className="roster-energy" title="Energia"><i style={{ height: `${person.energy}%` }} /></span>
                    </button>
                    {state.teams.length > 1 && (
                      <select className="team-select" value={teamOf(person)} aria-label="Equipe" onChange={event => { sfx.click(); dispatch({ type: 'MOVE_STAFF', staffId: person.id, teamId: event.target.value }) }}>
                        {state.teams.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                      </select>
                    )}
                  </div>
                  {open === person.id && <BadgeCard person={person} state={state} onDone={() => setOpen(null)} />}
                </div>
              ))}
              {!members.length && <p className="empty small">Equipe vazia. Mova alguém para cá.</p>}
            </div>
          </section>
        )
      })}
      {allowsTeams(state) && (
        <button type="button" className="btn new-team" onClick={() => { sfx.select(); dispatch({ type: 'CREATE_TEAM' }) }}>
          <Icon name="plus" size={16} />Nova equipe
        </button>
      )}
    </>
  )
}

function Hiring({ state }) {
  const full = localStaff(state).length >= OFFICES[state.office].cap
  const scale = moneyScale(yearFloat(state))
  if (!allowsHiring(state)) return <p className="note"><Icon name="user" size={14} />Autor Solo: ninguém mais entra.</p>
  return (
    <div className="candidates">
      {full && <p className="note"><Icon name="lock" size={14} />Sem mesa livre. Mude de escritório.</p>}
      {state.candidates.map(candidate => {
        const trait = traitById(candidate.trait)
        const fee = hireFee(state, candidate)
        return (
          <article key={candidate.id} className="cand">
            <div className="cand-top">
              <Avatar look={candidate.look} size={48} />
              <div>
                <b>{candidate.name}</b>
                <small><Icon name={roleOf(candidate).icon} size={11} stroke={2.6} />{roleOf(candidate).label}</small>
              </div>
              <span className="cand-trait" title={trait.desc}><Icon name={trait.icon} size={14} stroke={2.4} />{trait.label}</span>
            </div>
            <SkillBars person={candidate} />
            <div className="cand-foot">
              <span>{fmtMoney(Math.round(candidate.salary * scale))}/mês</span>
              <button type="button" className="btn btn-small btn-tomato" disabled={full || state.money < fee} onClick={() => { sfx.fanfare(); vibrate(16); dispatch({ type: 'HIRE', id: candidate.id }) }}>
                <Icon name="plus" size={14} />{fmtMoney(fee)}
              </button>
            </div>
          </article>
        )
      })}
      {!state.candidates.length && <p className="empty">Ninguém novo. Currículos chegam todo mês.</p>}
    </div>
  )
}

function Studios({ state }) {
  if (!allowsAcquire(state)) return <p className="note"><Icon name="lock" size={14} />Seu modo não compra estúdios.</p>
  const list = buyableStudios(state)
  return (
    <div className="studios">
      {list.map(rival => {
        const price = acquisitionPrice(state, rival)
        return (
          <article key={rival.id} className="studio-card" style={{ '--tc': rival.color }}>
            <span className="studio-logo">{rival.name.slice(0, 2).toUpperCase()}</span>
            <div className="studio-body">
              <b>{rival.name}</b>
              <small>desde {rival.foundedYear} · porte {rivalTierAt(rival, state.year)}</small>
            </div>
            <button type="button" className="btn btn-small btn-tomato" disabled={state.money < price} onClick={() => { sfx.fanfare(); vibrate([20, 40, 20]); dispatch({ type: 'ACQUIRE', rivalId: rival.id }) }}>
              {fmtMoney(price)}
            </button>
          </article>
        )
      })}
      {!list.length && <p className="empty">Ninguém à venda agora.</p>}
    </div>
  )
}

export function TeamPanel() {
  const state = useGame()
  const [tab, setTab] = useState('team')
  const cap = OFFICES[state.office].cap
  const local = localStaff(state).length
  return (
    <div className="team">
      <div className="seg seg-3">
        <button type="button" className={tab === 'team' ? 'on' : ''} onClick={() => { sfx.click(); setTab('team') }}>Times <b>{local}/{cap}</b></button>
        <button type="button" className={tab === 'hire' ? 'on' : ''} onClick={() => { sfx.click(); setTab('hire') }}>Contratar {state.candidates.length > 0 && local < cap && allowsHiring(state) && <i className="dot" />}</button>
        <button type="button" className={tab === 'studios' ? 'on' : ''} onClick={() => { sfx.click(); setTab('studios') }}>Estúdios</button>
      </div>
      {tab === 'team' && <Roster state={state} />}
      {tab === 'hire' && <Hiring state={state} />}
      {tab === 'studios' && <Studios state={state} />}
    </div>
  )
}
