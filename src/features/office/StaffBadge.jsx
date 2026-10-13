import { useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { fmtMoney } from '../../ui/format.js'
import { PILLARS, traitById } from '../../game/data/staff.js'
import { roleOf, xpForLevel } from '../../game/engine/staff.js'
import { trainCost } from '../../game/engine/reducer.js'
import { moneyScale } from '../../game/data/economy.js'
import { yearFloat } from '../../game/engine/state.js'

export function SkillBars({ person }) {
  const max = Math.max(60, ...PILLARS.map(p => person.skills[p.id]))
  return (
    <div className="skills">
      {PILLARS.map(p => (
        <div key={p.id} className="skill" style={{ '--c': p.color }}>
          <Icon name={p.icon} size={13} stroke={2.4} />
          <div className="skill-bar"><i style={{ width: `${person.skills[p.id] / max * 100}%` }} /></div>
          <b>{person.skills[p.id]}</b>
        </div>
      ))}
    </div>
  )
}

export function Meter({ icon, value, color }) {
  return (
    <div className="meter" style={{ '--c': color }}>
      <Icon name={icon} size={13} stroke={2.4} />
      <div className="meter-bar"><i style={{ width: `${value}%` }} /></div>
    </div>
  )
}

export function BadgeCard({ person, state, actions = true, onDone }) {
  const [train, setTrain] = useState(false)
  const trait = traitById(person.trait)
  const role = roleOf(person)
  const cost = trainCost(state, person)
  return (
    <div className="badge-card">
      <div className="badge-clip" aria-hidden="true" />
      <div className="badge-top">
        <Avatar look={person.look} size={56} mood={person.energy < 20 ? 'sleep' : person.mood < 35 ? 'sad' : null} />
        <div>
          <div className="badge-name">{person.name}{person.founder && <Icon name="crown" size={14} stroke={2.6} />}</div>
          <div className="badge-role"><Icon name={role.icon} size={12} stroke={2.6} />{role.label} · nv {person.level}</div>
          <div className="xp"><i style={{ width: `${Math.min(100, person.xp / xpForLevel(person.level) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="trait" title={trait?.desc}><Icon name={trait?.icon} size={14} stroke={2.4} />{trait?.label}<small>{trait?.desc}</small></div>
      <SkillBars person={person} />
      <div className="meters">
        <Meter icon="bolt" value={person.energy} color="#ffd23f" />
        <Meter icon="smile" value={person.mood} color="#52d977" />
      </div>
      {person.status !== 'ok' && <div className="away"><Icon name={person.status === 'treino' ? 'graduation' : 'beach'} size={14} />{person.status === 'treino' ? 'No curso' : 'Fora'} · {person.away} sem</div>}
      {actions && person.status === 'ok' && !train && (
        <div className="badge-actions">
          <button type="button" className="btn btn-small" onClick={() => { sfx.click(); setTrain(true) }}><Icon name="graduation" size={15} />Curso</button>
          <button type="button" className="btn btn-small" onClick={() => { sfx.click(); dispatch({ type: 'VACATION', id: person.id }); onDone?.() }}><Icon name="beach" size={15} />Folga</button>
          {!person.founder && <button type="button" className="btn btn-small btn-ghost danger" onClick={() => { sfx.back(); dispatch({ type: 'FIRE', id: person.id }); onDone?.() }}><Icon name="door" size={15} /></button>}
        </div>
      )}
      {train && (
        <div className="train-pick">
          <span className="train-cost">{fmtMoney(cost)} · 3 sem</span>
          <div className="train-row">
            {PILLARS.map(p => (
              <button key={p.id} type="button" className="train-btn" style={{ '--c': p.color }} disabled={state.money < cost} title={p.label}
                onClick={() => { sfx.select(); dispatch({ type: 'TRAIN', id: person.id, pillar: p.id }); setTrain(false); onDone?.() }}>
                <Icon name={p.icon} size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
      {!person.founder && <div className="salary"><Icon name="cash" size={12} stroke={2.4} />{fmtMoney(Math.round(person.salary * moneyScale(yearFloat(state))))}/mês</div>}
    </div>
  )
}

export function StaffBadge({ id, screen, onClose }) {
  const state = useGame()
  const person = state.staff.find(item => item.id === id)
  if (!person) return null
  const style = screen ? { left: Math.min(window.innerWidth - 270, Math.max(10, screen.x - 125)), top: Math.max(70, Math.min(window.innerHeight - 380, screen.y - 330)) } : {}
  return (
    <div className="staff-badge" style={style} onPointerDown={event => event.stopPropagation()}>
      <button type="button" className="icon-btn badge-x" aria-label="Fechar" onClick={onClose}><Icon name="close" size={16} /></button>
      <BadgeCard person={person} state={state} onDone={onClose} />
    </div>
  )
}
