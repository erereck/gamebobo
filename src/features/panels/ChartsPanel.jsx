import { useGame } from '../../app/store.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtNum, fmtScore, scoreColor } from '../../ui/format.js'
import { genreById, themeById } from '../../game/data/genres.js'

export function ChartsPanel() {
  const state = useGame()
  const trend = state.market.trend
  const onMarket = state.games.filter(game => game.onMarket)
  return (
    <div className="charts">
      <div className="trend-card">
        <Icon name="fire" size={22} />
        <div><small>Em alta</small><b>{genreById(trend.genre)?.label} · {themeById(trend.theme)?.label}</b></div>
      </div>
      <ol className="chart">
        {state.chart.map(entry => (
          <li key={entry.id} className={`chart-row ${entry.mine ? 'mine' : ''}`} style={{ '--rc': entry.color }}>
            <span className="chart-rank">{entry.rank}</span>
            <span className="chart-title"><b>{entry.title}</b><small>{entry.studio}</small></span>
            <span className="chart-score" style={{ color: scoreColor(entry.score) }}>{fmtScore(entry.score)}</span>
            <span className="chart-sales">{fmtNum(entry.weekly)}<small>/sem</small></span>
          </li>
        ))}
        {!state.chart.length && <li className="empty">A loja ainda está vazia.</li>}
      </ol>
      {onMarket.length > 0 && (
        <div className="shelf">
          <b className="shelf-title">Nas lojas</b>
          {onMarket.map(game => (
            <div key={game.id} className="shelf-row">
              <Cover game={game} width={38} />
              <span className="shelf-name"><b>{game.title}</b><small>{fmtNum(game.sold)} cópias · {fmtMoney(game.revenue)}</small></span>
              <span className="shelf-week">{fmtNum(game.weekly)}<small>/sem</small></span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
