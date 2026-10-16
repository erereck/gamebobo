import { useGame } from '../../app/store.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtNum, fmtScore, scoreColor } from '../../ui/format.js'
import { genreById, themeById } from '../../game/data/genres.js'
import { activeShock } from '../../game/engine/project.js'

// ▲3 / ▼1 / NOVO / = : o movimento da semana numa etiqueta só.
function Move({ entry }) {
  if (entry.move === null || entry.move === undefined) return <span className="chart-move new">novo</span>
  if (entry.move === 0) return <span className="chart-move same">{entry.topWeeks > 1 ? `${entry.topWeeks} sem` : '='}</span>
  return <span className={`chart-move ${entry.move > 0 ? 'up' : 'down'}`}>{entry.move > 0 ? '▲' : '▼'}{Math.abs(entry.move)}</span>
}

export function ChartsPanel() {
  const state = useGame()
  const trend = state.market.trend
  const onMarket = state.games.filter(game => game.onMarket)
  const shock = activeShock(state)
  return (
    <div className="charts">
      <div className="trend-card">
        <Icon name="fire" size={22} />
        <div><small>{state.market.trendSource ? `Em alta por causa de ${state.market.trendSource}` : 'Em alta'}</small><b>{genreById(trend.genre)?.label} · {themeById(trend.theme)?.label}</b></div>
      </div>
      {shock && (
        <div className="shock-card">
          <Icon name={shock.icon} size={20} />
          <b>{shock.title}</b>
          <span className="shock-mods">{Object.entries(shock.mods).map(([key, value]) => <span key={key} className={value >= 1 ? 'up' : 'down'}>{{ console: 'consoles', pc: 'PC', arcade: 'fliper', mobile: 'celular', global: 'tudo' }[key] ?? genreById(key)?.label ?? key} {value >= 1 ? '▲' : '▼'}</span>)}</span>
        </div>
      )}
      <ol className="chart">
        {state.chart.map(entry => (
          <li key={entry.id} className={`chart-row ${entry.mine ? 'mine' : ''}`} style={{ '--rc': entry.color }}>
            <span className="chart-rank">{entry.rank}<Move entry={entry} /></span>
            <span className="chart-title"><b>{entry.title}</b><small>{entry.studio}{entry.weeks > 1 ? ` · ${entry.weeks} sem` : ''}</small></span>
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
