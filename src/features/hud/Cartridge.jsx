import { useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtNum } from '../../ui/format.js'
import { genreById, themeById } from '../../game/data/genres.js'
import { platformById } from '../../game/data/platforms.js'
import { MARKETING, PACES, PHASES, moneyScale } from '../../game/data/economy.js'
import { PILLARS } from '../../game/data/staff.js'
import { phaseBounds, phaseAt } from '../../game/engine/project.js'
import { freelaProgress } from '../../game/engine/freelas.js'
import { yearFloat } from '../../game/engine/state.js'

function Tubes({ pts, genre }) {
  const total = Object.values(pts).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="tubes">
      {PILLARS.map(pillar => {
        const share = pts[pillar.id] / total
        const want = genre?.w?.[pillar.id] ?? .25
        return (
          <div key={pillar.id} className="tube" style={{ '--c': pillar.color }} title={pillar.label}>
            <div className="tube-glass">
              <i className="tube-fill" style={{ height: `${Math.min(100, share / .55 * 100)}%` }} />
              <i className="tube-want" style={{ bottom: `${Math.min(100, want / .55 * 100)}%` }} />
            </div>
            <Icon name={pillar.icon} size={13} stroke={2.4} />
            <span className="tube-num">{fmtNum(pts[pillar.id])}</span>
          </div>
        )
      })}
    </div>
  )
}

function PhaseTrack({ project }) {
  const bounds = phaseBounds(project)
  const current = phaseAt(project)
  const starts = [0, bounds[0], bounds[1]]
  return (
    <div className="track">
      {PHASES.map((phase, i) => {
        const start = starts[i]
        const end = bounds[i]
        const fill = Math.max(0, Math.min(1, (project.week - start) / Math.max(1, end - start)))
        return (
          <div key={phase.id} className={`track-seg ${i === current ? 'now' : ''} ${fill >= 1 ? 'done' : ''}`} style={{ flex: end - start }}>
            <i style={{ width: `${fill * 100}%` }} />
            <span>{phase.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function MarketingMenu({ state, onClose }) {
  const scale = moneyScale(yearFloat(state))
  const channels = MARKETING.filter(item => item.from <= state.year && item.to >= state.year)
  return (
    <div className="popover market-menu" role="menu">
      {channels.map(channel => {
        const cost = Math.round(channel.cost * scale)
        const afford = state.money >= cost
        return (
          <button key={channel.id} type="button" className="market-item" disabled={!afford} role="menuitem"
            onClick={() => { sfx.cash(); vibrate(10); dispatch({ type: 'MARKET', id: channel.id }); onClose() }}>
            <Icon name={channel.icon} size={20} />
            <span className="mi-label">{channel.label}</span>
            <span className="mi-gain">{channel.gamble ? `${Math.round(channel.gamble.chance * 100)}% · +${channel.gamble.win}` : `+${channel.hype}`}<Icon name="megaphone" size={12} stroke={2.6} /></span>
            <span className="mi-cost">{fmtMoney(cost)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Cartridge({ onNew, onFreela }) {
  const state = useGame()
  const [menu, setMenu] = useState(false)
  const project = state.project

  if (!project) {
    return (
      <div className="cart-slot">
        <button type="button" className="slot-btn" onClick={onNew}>
          <span className="slot-mouth" aria-hidden="true"><i /><i /><i /></span>
          <span className="slot-text">Novo jogo</span>
        </button>
        <button type="button" className="slot-side" onClick={onFreela} disabled={!state.freelas.length} title="Trabalho por encomenda">
          <Icon name="briefcase" size={18} />
          <span>Freela</span>
        </button>
      </div>
    )
  }

  if (project.kind === 'freela') {
    const progress = freelaProgress(project)
    return (
      <div className="cart cart-freela">
        <div className="freela-badge"><Icon name={project.icon ?? 'briefcase'} size={26} /></div>
        <div className="cart-body">
          <div className="cart-title">{project.title}</div>
          <div className="freela-needs">
            {Object.entries(project.need).map(([key, need]) => {
              const pillar = PILLARS.find(p => p.id === key)
              return (
                <div key={key} className="need" style={{ '--c': pillar.color }}>
                  <Icon name={pillar.icon} size={13} stroke={2.4} />
                  <div className="need-bar"><i style={{ width: `${Math.min(100, project.pts[key] / need * 100)}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="cart-side">
          <div className="weeks-left"><b>{Math.max(0, project.totalWeeks - project.week)}</b><span>sem</span></div>
          <div className="pay">{fmtMoney(project.pay)}</div>
          <div className="mini-progress"><i style={{ width: `${progress * 100}%` }} /></div>
        </div>
      </div>
    )
  }

  const genre = genreById(project.genre)
  const theme = themeById(project.theme)
  const platform = platformById(project.platform)
  return (
    <div className="cart">
      <div className="cart-ridges" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
      <div className="cart-label">
        <Cover game={{ id: project.id, title: project.title, genre: project.genre, theme: project.theme, platform: project.platform }} width={64} />
      </div>
      <div className="cart-body">
        <div className="cart-title">{project.title}</div>
        <div className="cart-meta">
          <span><Icon name={genre?.icon} size={13} stroke={2.4} />{genre?.label}</span>
          <span><Icon name={theme?.icon} size={13} stroke={2.4} />{theme?.label}</span>
          <span className="plat" style={{ '--pc': platform?.color }}>{platform?.label}</span>
        </div>
        <PhaseTrack project={project} />
        <Tubes pts={project.pts} genre={genre} />
      </div>
      <div className="cart-side">
        <div className="bugs" title="Bugs"><Icon name="bug" size={18} stroke={2.2} /><b>{fmtNum(project.bugs)}</b></div>
        <div className="hype" title="Hype">
          <Icon name="megaphone" size={16} stroke={2.2} />
          <div className="hype-bar"><i style={{ width: `${project.hype}%` }} /></div>
        </div>
        <div className="pace" role="group" aria-label="Ritmo">
          {Object.values(PACES).map(pace => (
            <button key={pace.id} type="button" className={`pace-btn pace-${pace.id} ${project.pace === pace.id ? 'on' : ''}`} title={pace.label} aria-label={pace.label} aria-pressed={project.pace === pace.id}
              onClick={() => { sfx.click(); dispatch({ type: 'SET_PACE', pace: pace.id }) }}>
              <Icon name={pace.icon} size={16} stroke={2.4} />
            </button>
          ))}
        </div>
        <div className="market-wrap">
          <button type="button" className="btn btn-small btn-sun" onClick={() => { sfx.click(); setMenu(open => !open) }} aria-expanded={menu}>
            <Icon name="megaphone" size={16} /> Divulgar
          </button>
          {menu && <MarketingMenu state={state} onClose={() => setMenu(false)} />}
        </div>
      </div>
    </div>
  )
}
