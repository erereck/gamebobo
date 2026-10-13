import { useEffect } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Chips, PreviewChips } from '../../ui/Chips.jsx'
import { fmtMoney } from '../../ui/format.js'
import { CAMELO_ITEMS } from '../../game/data/content/camelo.js'
import { moneyScale } from '../../game/data/economy.js'
import { yearFloat } from '../../game/engine/state.js'

export function CameloShop({ onClose }) {
  const state = useGame()
  const visitor = state.visitor
  useEffect(() => {
    if (!visitor) onClose()
  }, [visitor, onClose])
  if (!visitor) return null
  const scale = moneyScale(yearFloat(state))
  const items = visitor.items.map(id => CAMELO_ITEMS.find(item => item.id === id)).filter(Boolean)
  return (
    <div className="sheet-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
      <section className="sheet camelo" aria-label="Camelô">
        <header className="camelo-head">
          <span className="camelo-tarp" aria-hidden="true" />
          <div className="camelo-line">“{visitor.line}”</div>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}><Icon name="close" size={20} /></button>
        </header>
        <div className="camelo-items">
          {items.map(item => {
            const price = Math.round(item.price * scale)
            const sold = visitor.sold.includes(item.id)
            return (
              <article key={item.id} className={`ware ${sold ? 'sold' : ''}`}>
                <span className="ware-tag">{fmtMoney(price)}</span>
                <span className="ware-icon"><Icon name={item.icon} size={34} /></span>
                <b>{item.label}</b>
                <small>{item.text}</small>
                {item.gamble ? <span className="odds"><Icon name="dice" size={13} stroke={2.6} />{Math.round(item.gamble.chance * 100)}%</span> : <PreviewChips effects={item.effects} />}
                <button type="button" className="btn btn-small btn-sun" disabled={sold || state.money < price}
                  onClick={() => { sfx.cash(); vibrate(14); dispatch({ type: 'BUY_CAMELO', id: item.id }) }}>
                  {sold ? 'Vendido' : 'Comprar'}
                </button>
              </article>
            )
          })}
        </div>
        {visitor.last && (
          <div className={`camelo-result ${visitor.last.win === false ? 'bad' : 'good'}`}>
            <b>{visitor.last.text}</b>
            <Chips items={visitor.last.chips} />
          </div>
        )}
        <footer className="camelo-foot">
          <button type="button" className="btn btn-ghost" onClick={() => { sfx.back(); dispatch({ type: 'SHOO_VISITOR' }); onClose() }}>Mandar embora</button>
        </footer>
      </section>
    </div>
  )
}
