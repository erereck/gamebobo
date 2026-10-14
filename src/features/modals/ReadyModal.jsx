import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtNum } from '../../ui/format.js'
import { totalPoints } from '../../game/engine/quality.js'

export function ReadyModal({ item, state }) {
  const project = state.projects.find(entry => entry.id === item.projectId)
  if (!project) return null
  const total = totalPoints(project.pts)
  const bugRatio = project.bugs / Math.max(1, total)
  const bugLevel = bugRatio > .2 ? 'muitos' : bugRatio > .08 ? 'alguns' : 'poucos'
  return (
    <div className="modal-backdrop">
      <article className="ready-card">
        <div className="ready-cover">
          <Cover game={project} width={140} />
          <span className="ready-shine" aria-hidden="true" />
        </div>
        <div className="ready-side">
          <div className="ready-kicker">Ouro!</div>
          <h2>{project.title}</h2>
          <div className="ready-stats">
            <span className={`rs rs-bugs lvl-${bugLevel}`}><Icon name="bug" size={18} stroke={2.4} /><b>{fmtNum(project.bugs)}</b><small>{bugLevel}</small></span>
            <span className="rs"><Icon name="megaphone" size={18} stroke={2.4} /><b>{Math.round(project.hype)}</b><small>hype</small></span>
            <span className="rs"><Icon name="sparkle" size={18} stroke={2.4} /><b>{fmtNum(total)}</b><small>pontos</small></span>
          </div>
          <button type="button" className="btn btn-big btn-tomato" onClick={() => { sfx.drum(); vibrate([10, 30, 10]); dispatch({ type: 'RELEASE' }) }}>
            <Icon name="rocket" size={20} /> Lançar
          </button>
          <button type="button" className="btn" onClick={() => { sfx.click(); dispatch({ type: 'POLISH_MORE' }) }}>
            <Icon name="bug" size={16} /> Polir +2 semanas
          </button>
        </div>
      </article>
    </div>
  )
}
