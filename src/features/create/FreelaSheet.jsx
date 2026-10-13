import { dispatch, useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { fmtMoney, fmtNum } from '../../ui/format.js'
import { PILLARS } from '../../game/data/staff.js'
import { freelaNeed } from '../../game/engine/freelas.js'
import { activeStaff, personOutput } from '../../game/engine/staff.js'
import { PACES, moneyScale } from '../../game/data/economy.js'
import { yearFloat } from '../../game/engine/state.js'

export function FreelaSheet({ onClose }) {
  const state = useGame()
  const year = yearFloat(state)
  const teamOut = activeStaff(state).reduce((sum, person) => sum + personOutput(state, person, PACES.normal), 0)
  return (
    <div className="sheet-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
      <section className="sheet freela" aria-label="Freelas">
        <header className="sheet-head">
          <div className="sheet-title"><Icon name="briefcase" size={20} />Freelas</div>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}><Icon name="close" size={20} /></button>
        </header>
        <div className="freela-list">
          {state.freelas.map(item => {
            const need = freelaNeed(item, year)
            const total = Object.values(need).reduce((a, b) => a + b, 0)
            const weeksNeeded = teamOut > 0 ? total / teamOut : 99
            const risk = weeksNeeded > item.weeks ? 'hard' : weeksNeeded > item.weeks * .7 ? 'tight' : 'easy'
            return (
              <article key={item.id} className={`job job-${risk}`}>
                <span className="job-icon"><Icon name={item.icon} size={26} /></span>
                <div className="job-body">
                  <b>{item.client}</b>
                  <div className="job-needs">
                    {Object.entries(need).map(([key, value]) => {
                      const pillar = PILLARS.find(p => p.id === key)
                      return <span key={key} style={{ '--c': pillar.color }}><Icon name={pillar.icon} size={12} stroke={2.6} />{fmtNum(value)}</span>
                    })}
                  </div>
                </div>
                <div className="job-side">
                  <span className="job-pay">{fmtMoney(Math.round(item.pay * moneyScale(year)))}</span>
                  <span className="job-weeks"><Icon name="clock" size={12} stroke={2.6} />{item.weeks} sem</span>
                  <span className={`job-risk risk-${risk}`}>{risk === 'easy' ? 'tranquilo' : risk === 'tight' ? 'apertado' : 'puxado'}</span>
                </div>
                <button type="button" className="btn btn-small btn-tomato" onClick={() => { sfx.select(); dispatch({ type: 'START_FREELA', id: item.id }); onClose() }}>Pegar</button>
              </article>
            )
          })}
          {!state.freelas.length && <p className="empty">Sem pedidos agora. Volte mês que vem.</p>}
        </div>
      </section>
    </div>
  )
}
