import { useGame } from '../app/GameContext.jsx'
import { getCareerRecords, getFranchises } from '../game/engine/selectors.js'
import { formatCurrencyCopy, formatMoney, formatNumber } from '../game/engine/utils.js'

export function HistoryScreen() {
  const { state } = useGame()
  const records = getCareerRecords(state)
  const franchises = getFranchises(state)
  const years = state.date.year - 2003
  const careerTime = years === 0 ? 'menos de um ano' : years === 1 ? '1 ano' : `${years} anos`
  const worstProfit = records.failure ? records.failure.revenue - records.failure.costSpent : null
  return (
    <section className="screen" aria-labelledby="history-title">
      <header className="screen-heading"><div><p className="overline">O QUE FICOU</p><h2 id="history-title">História</h2></div><p>{state.games.length ? `${state.games.length} ${state.games.length === 1 ? 'jogo publicado' : 'jogos publicados'} em ${careerTime}.` : 'Ainda não há jogo publicado.'}</p></header>
      <div className="records-strip">
        <Record label="MAIOR NOTA" value={records.best ? `${records.best.title} · ${records.best.score}` : '—'} />
        <Record label="MAIS VENDIDO" value={records.seller ? `${records.seller.title} · ${formatNumber(records.seller.sales)}` : '—'} />
        <Record label="MAIOR PREJUÍZO" value={worstProfit < 0 ? `${records.failure.title} · ${formatMoney(worstProfit)}` : 'Nenhum até agora'} />
        <Record label="NOTA 92+" value={records.goty} />
      </div>
      <section className="trophy-cabinet"><header><p className="overline">PRÊMIOS</p><h3>{state.awards.trophies.length} troféus · {state.awards.nominations.length} indicações</h3></header>{state.awards.trophies.length ? <div>{state.awards.trophies.map(trophy => <article key={trophy.id}><span>{trophy.year}</span><strong>{trophy.category}</strong><small>{trophy.gameTitle}</small></article>)}</div> : <p>A estante ainda está livre.</p>}</section>
      {franchises.length > 0 && <section className="legacy-franchises"><p className="overline">FRANQUIAS</p>{franchises.map(item => <div key={item.id}><strong>{item.name}</strong><span>{item.games.length} {item.games.length === 1 ? 'jogo' : 'jogos'}</span><em>{formatNumber(item.sales)} cópias</em></div>)}</section>}
      <section className="leadership-chain"><header><p className="overline">QUEM CARREGOU A CHAVE</p><h3>{state.studio.leaders.length} {state.studio.leaders.length === 1 ? 'geração' : 'gerações'} em {state.studio.name}</h3></header><div>{state.studio.leaders.map((leader, index) => <article key={`${leader.name}-${leader.from}`} className={leader.to == null ? 'is-current' : ''}><span>G{leader.generation ?? index + 1}</span><strong>{leader.name}</strong><small>{leader.from}—{leader.to ?? 'agora'} · {leader.legacy}</small></article>)}</div></section>
      <section className="history-ledger">{[...state.history].reverse().map(item => <article key={item.id} className={item.highlight ? 'is-highlight' : ''}><time>{item.date}</time><span aria-hidden="true" /><div><h3>{item.title}</h3><p>{formatCurrencyCopy(item.body)}</p></div></article>)}</section>
    </section>
  )
}

function Record({ label, value }) {
  return <article><span>{label}</span><strong>{value}</strong></article>
}
