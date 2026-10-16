import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { PHASES, PHASE_FOCUS } from '../../game/data/economy.js'
import { PILLARS } from '../../game/data/staff.js'
import { genreById } from '../../game/data/genres.js'

// Compara o que o gênero pede com o que o jogo tem até agora.
function WantHave({ project }) {
  const genre = genreById(project.genre)
  const total = Object.values(project.pts).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="wanthave">
      {PILLARS.map(p => {
        const want = genre.w[p.id]
        const have = project.pts[p.id] / total
        const gap = want - have
        return (
          <div key={p.id} className={`wh ${gap > .05 ? 'need' : ''}`} style={{ '--c': p.color }}>
            <div className="wh-bars">
              <i className="wh-want" style={{ height: `${want / .55 * 100}%` }} />
              <i className="wh-have" style={{ height: `${Math.min(1, have / .55) * 100}%` }} />
            </div>
            <Icon name={p.icon} size={14} stroke={2.4} />
          </div>
        )
      })}
    </div>
  )
}

export function PhaseModal({ item, state }) {
  const project = state.projects.find(entry => entry.id === item.projectId)
  if (!project) return null
  const phase = PHASES[item.phase]
  const options = PHASE_FOCUS[phase.id]
  return (
    <div className="modal-backdrop">
      <article className="phase-card">
        <div className="phase-kicker">{project.title} · fase {item.phase + 1} de 3</div>
        <h2 className="phase-title">{phase.label}</h2>
        <div className="phase-legend"><span><i className="lg-want" />o gênero pede</span><span><i className="lg-have" />seu jogo tem</span></div>
        <WantHave project={project} />
        <div className="focus-row">
          {options.map(option => (
            <button key={option.id} type="button" className="focus-card" onClick={() => { sfx.select(); vibrate(10); dispatch({ type: 'SET_FOCUS', focus: option.id }) }}>
              <span className="focus-icon"><Icon name={option.icon} size={34} /></span>
              <b>{option.label}</b>
              <span className="focus-boost">
                {Object.entries(option.mix).filter(([, v]) => v > 1).map(([key]) => {
                  const p = PILLARS.find(pp => pp.id === key)
                  return <span key={key} style={{ color: p.color }}><Icon name={p.icon} size={14} stroke={2.6} />▲</span>
                })}
                {option.bugFix > 1.5 && <span className="good-bug"><Icon name="bug" size={14} stroke={2.6} />▼▼</span>}
                {option.bugs > 1 && <span className="bad-bug"><Icon name="bug" size={14} stroke={2.6} />▲</span>}
              </span>
            </button>
          ))}
        </div>
      </article>
    </div>
  )
}
