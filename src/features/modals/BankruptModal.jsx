import { dispatch } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { fmtMoney } from '../../ui/format.js'

export function BankruptModal({ state }) {
  const canLoan = !state.usedLoan
  return (
    <div className="modal-backdrop">
      <article className="event-card bankrupt">
        <div className="event-head"><span className="event-icon danger"><Icon name="warning" size={40} /></span></div>
        <h2 className="event-title">Faliu.</h2>
        <p className="event-text">Três meses no vermelho. {fmtMoney(state.money)} no caixa.</p>
        <div className="choices">
          {canLoan && (
            <button type="button" className="choice" onClick={() => { sfx.cash(); dispatch({ type: 'BANKRUPT', choice: 'loan' }) }}>
              <span className="choice-label">Empréstimo</span>
              <span className="odds"><Icon name="cash" size={14} />24x</span>
            </button>
          )}
          <button type="button" className="choice" onClick={() => { sfx.sad(); dispatch({ type: 'BANKRUPT', choice: 'home' }) }}>
            <span className="choice-label">Voltar pro quarto</span>
            <span className="odds"><Icon name="home" size={14} /></span>
          </button>
        </div>
      </article>
    </div>
  )
}
