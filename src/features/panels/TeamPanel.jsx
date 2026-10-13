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
import { BadgeCard, SkillBars } from '../office/StaffBadge.jsx'

export function TeamPanel() {
  const state = useGame()
  const [open, setOpen] = useState(null)
  const [tab, setTab] = useState('team')
  const cap = OFFICES[state.office].cap
  const full = state.staff.length >= cap
  const scale = moneyScale(yearFloat(state))
  const payroll = state.staff.reduce((sum, p) => sum + (p.founder ? 0 : p.salary), 0) * scale

  return (
    <div className="team">
      <div className="seg">
        <button type="button" className={tab === 'team' ? 'on' : ''} onClick={() => { sfx.click(); setTab('team') }}>Time <b>{state.staff.length}/{cap}</b></button>
        <button type="button" className={tab === 'hire' ? 'on' : ''} onClick={() => { sfx.click(); setTab('hire') }}>Contratar {state.candidates.length > 0 && !full && <i className="dot" />}</button>
      </div>

      {tab === 'team' && (
        <>
          <div className="payroll"><Icon name="cash" size={14} />Folha {fmtMoney(Math.round(payroll))}/mês</div>
          <div className="roster">
            {state.staff.map(person => (
              <div key={person.id} className={`roster-row ${open === person.id ? 'open' : ''}`}>
                <button type="button" className="roster-head" onClick={() => { sfx.click(); setOpen(open === person.id ? null : person.id) }}>
                  <Avatar look={person.look} size={40} mood={person.energy < 20 ? 'sleep' : null} />
                  <span className="roster-name"><b>{person.name}</b><small><Icon name={roleOf(person).icon} size={11} stroke={2.6} />{roleOf(person).short} · nv {person.level}</small></span>
                  <span className="roster-energy" title="Energia"><i style={{ height: `${person.energy}%` }} /></span>
                  {person.status !== 'ok' && <Icon name={person.status === 'treino' ? 'graduation' : 'beach'} size={16} />}
                </button>
                {open === person.id && <BadgeCard person={person} state={state} onDone={() => setOpen(null)} />}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'hire' && (
        <div className="candidates">
          {full && <p className="note"><Icon name="lock" size={14} />Sem mesa livre. Mude de escritório.</p>}
          {state.candidates.map(candidate => {
            const trait = traitById(candidate.trait)
            const fee = Math.round(candidate.salary * scale)
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
                  <span>{fmtMoney(fee)}/mês</span>
                  <button type="button" className="btn btn-small btn-tomato" disabled={full || state.money < fee} onClick={() => { sfx.fanfare(); vibrate(16); dispatch({ type: 'HIRE', id: candidate.id }) }}>
                    <Icon name="plus" size={14} />Contratar
                  </button>
                </div>
              </article>
            )
          })}
          {!state.candidates.length && <p className="empty">Ninguém novo. Currículos chegam todo mês.</p>}
        </div>
      )}
    </div>
  )
}
