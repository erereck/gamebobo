import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { fmtMoney, fmtNum } from '../../ui/format.js'
import { TECHS, moneyScale } from '../../game/data/economy.js'
import { PILLARS } from '../../game/data/staff.js'
import { genreById, themeById } from '../../game/data/genres.js'
import { yearFloat } from '../../game/engine/state.js'

function techEffect(tech) {
  const out = []
  if (tech.engine) out.push({ icon: 'bolt', text: `+${Math.round((tech.engine - 1) * 100)}% produção` })
  for (const [key, value] of Object.entries(tech.gen ?? {})) {
    const p = PILLARS.find(item => item.id === key)
    out.push({ icon: p.icon, text: `+${Math.round((value - 1) * 100)}%`, color: p.color })
  }
  if (tech.bugs) out.push({ icon: 'bug', text: `−${Math.round((1 - tech.bugs) * 100)}%` })
  if (tech.sales) out.push({ icon: 'chart', text: `+${Math.round((tech.sales - 1) * 100)}% vendas` })
  if (tech.hype) out.push({ icon: 'megaphone', text: `+${Math.round((tech.hype - 1) * 100)}% hype` })
  if (tech.reveal) out.push({ icon: 'eye', text: 'vê a próxima moda' })
  if (tech.id === 'online') out.push({ icon: 'globe', text: 'MMO, MOBA…' })
  return out
}

export function ResearchPanel() {
  const state = useGame()
  const scale = moneyScale(yearFloat(state))
  const available = TECHS.filter(tech => !state.techs.includes(tech.id) && tech.year <= state.year)
  const future = TECHS.filter(tech => tech.year > state.year).slice(0, 4)
  const done = TECHS.filter(tech => state.techs.includes(tech.id))
  const seesFuture = state.techs.includes('pesquisa')
  const next = state.market.nextTrend
  return (
    <div className="research">
      <div className="rp-big"><Icon name="flask" size={22} /><b>{fmtNum(Math.floor(state.rp))}</b><span>pontos</span></div>
      {seesFuture && next && (
        <div className="forecast"><Icon name="eye" size={16} />Próxima moda: <b>{genreById(next.genre)?.label}</b> · <b>{themeById(next.theme)?.label}</b></div>
      )}
      <div className="tech-list">
        {available.map(tech => {
          const cost = Math.round(tech.cost * scale)
          const can = state.rp >= tech.rp && state.money >= cost
          return (
            <article key={tech.id} className={`tech ${can ? 'can' : ''}`}>
              <span className="tech-icon"><Icon name={tech.icon} size={24} /></span>
              <div className="tech-body">
                <b>{tech.label}</b>
                <div className="tech-fx">{techEffect(tech).map((e, i) => <span key={i} style={e.color ? { color: e.color } : undefined}><Icon name={e.icon} size={12} stroke={2.6} />{e.text}</span>)}</div>
                <div className="tech-bar"><i style={{ width: `${Math.min(100, state.rp / tech.rp * 100)}%` }} /></div>
              </div>
              <button type="button" className="btn btn-small btn-grape" disabled={!can} onClick={() => { sfx.levelup(); vibrate(14); dispatch({ type: 'RESEARCH', id: tech.id }) }}>
                <span className="tech-cost"><Icon name="flask" size={12} stroke={2.6} />{tech.rp}</span>
                <span className="tech-cost">{fmtMoney(cost)}</span>
              </button>
            </article>
          )
        })}
        {!available.length && <p className="empty">Tudo pesquisado. O futuro ainda não chegou.</p>}
      </div>
      {future.length > 0 && (
        <div className="tech-future">
          {future.map(tech => <span key={tech.id} className="tech-chip"><Icon name="lock" size={12} stroke={2.6} />{tech.label}<b>{tech.year}</b></span>)}
        </div>
      )}
      {done.length > 0 && (
        <div className="tech-done">
          {done.map(tech => <span key={tech.id} className="tech-chip done" title={tech.label}><Icon name={tech.icon} size={14} /></span>)}
        </div>
      )}
    </div>
  )
}
