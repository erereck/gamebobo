import { useGame } from '../../app/GameContext.jsx'
import { LOANS } from '../../game/data/business.js'
import { formatMoney } from '../../game/engine/utils.js'
import { Button } from '../../components/ui/Button.jsx'

export function BusinessDesk() {
  const { state, dispatch } = useGame()
  const committed = Math.round((state.studio.equity ?? 0) * 100)
  return (
    <section className="business-desk">
      <header><div><p className="overline">TRABALHO DE FORA</p><h3>Dinheiro que não depende de acertar um hit.</h3></div><span>{state.studio.debt.length} DÍVIDAS · {committed}% VENDIDO</span></header>
      {state.currentContract ? <article className="active-contract"><span>CONTRATO ATIVO</span><h4>{state.currentContract.title}</h4><p>{state.currentContract.client} · {state.currentContract.monthsLeft} meses · {formatMoney(state.currentContract.pay)} ao entregar</p></article> : <div className="contract-grid">{state.opportunities.contracts.map(contract => <article key={contract.id}><span>{contract.client}</span><h4>{contract.title}</h4><p>{contract.description}</p><div><strong>{formatMoney(contract.pay)}</strong><small>{contract.months} meses</small></div><Button size="small" onClick={() => dispatch({ type: 'ACCEPT_CONTRACT', contractId: contract.id })} disabled={Boolean(state.currentProject)}>ACEITAR</Button></article>)}</div>}
      <details className="loan-drawer"><summary>Crédito, parcelas e participação</summary><div>{state.studio.debt.map(debt => <article className="debt-active" key={`active-${debt.id}`}><div><strong>EM ABERTO · {debt.name}</strong><span>{formatMoney(debt.payment)}/mês · faltam {debt.monthsLeft} meses</span></div><em>PARCELA AUTOMÁTICA</em></article>)}{LOANS.map(loan => <article key={loan.id}><div><strong>{loan.name}</strong><span>{formatMoney(loan.amount)} · {loan.months} parcelas</span></div><Button size="small" onClick={() => dispatch({ type: 'TAKE_LOAN', loanId: loan.id })} disabled={state.studio.debt.some(item => item.id === loan.id)}>CONTRATAR</Button></article>)}</div></details>
    </section>
  )
}
