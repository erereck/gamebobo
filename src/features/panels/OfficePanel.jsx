import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { fmtMoney } from '../../ui/format.js'
import { DECOR, OFFICES, SIZES, moneyScale } from '../../game/data/economy.js'
import { yearFloat } from '../../game/engine/state.js'

export function OfficePanel() {
  const state = useGame()
  const scale = moneyScale(yearFloat(state))
  const office = OFFICES[state.office]
  const next = OFFICES[state.office + 1]
  const nextCost = next ? Math.round(next.cost * scale) : 0
  const slotsUsed = state.decor.length
  return (
    <div className="officep">
      <div className="office-now">
        <div className="office-level">{OFFICES.map((_, i) => <i key={i} className={i <= state.office ? 'on' : ''} />)}</div>
        <b>{office.label}</b>
        <span><Icon name="users" size={14} />{office.cap} mesas</span>
        <span><Icon name="cash" size={14} />{fmtMoney(Math.round(office.rent * scale))}/mês</span>
      </div>
      {next && (
        <article className="move-card">
          <div className="move-to">
            <small>Próximo</small>
            <b>{next.label}</b>
            <span><Icon name="users" size={13} />{next.cap} mesas · <Icon name="cube" size={13} />{SIZES.filter(s => s.office === next.level).map(s => s.label).join(', ') || 'mais espaço'}</span>
            <span className="rent"><Icon name="cash" size={13} />{fmtMoney(Math.round(next.rent * scale))}/mês</span>
          </div>
          <button type="button" className="btn btn-tomato" disabled={state.money < nextCost} onClick={() => { sfx.fanfare(); vibrate([20, 40, 20]); dispatch({ type: 'UPGRADE_OFFICE' }) }}>
            <Icon name="building" size={16} />{fmtMoney(nextCost)}
          </button>
        </article>
      )}
      <div className="decor-head"><b>Decoração</b><span>{slotsUsed}/{office.slots}</span></div>
      <div className="decor-grid">
        {DECOR.map(item => {
          const owned = state.decor.includes(item.id)
          const cost = Math.round(item.cost * scale)
          const full = slotsUsed >= office.slots
          return (
            <button key={item.id} type="button" className={`decor ${owned ? 'owned' : ''}`} disabled={!owned && (full || state.money < cost)}
              onClick={() => {
                if (owned) { sfx.back(); dispatch({ type: 'SELL_DECOR', id: item.id }) } else { sfx.cash(); vibrate(10); dispatch({ type: 'BUY_DECOR', id: item.id }) }
              }}>
              <span className="decor-icon"><Icon name={item.icon} size={26} /></span>
              <b>{item.label}</b>
              <small>{item.desc}</small>
              <span className="decor-price">{owned ? <><Icon name="check" size={12} stroke={3} />no lugar</> : fmtMoney(cost)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
