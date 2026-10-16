import { useEffect, useRef, useState } from 'react'
import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { Chip, Chips } from '../../ui/Chips.jsx'
import { fmtScore, scoreColor, scoreTier } from '../../ui/format.js'
import { COMBO_LABEL } from '../../game/data/genres.js'
import { PILLARS } from '../../game/data/staff.js'

const FLIP_AT = [1000, 1600, 2200, 2800]
const STAMP_AT = 3500
const REWARDS_AT = 4100
const COMMENTS_AT = 4600

function Factors({ breakdown }) {
  const p = breakdown.parts
  const items = [
    { icon: 'sparkle', v: (p.volume - 50) / 6, tip: 'Capricho' },
    { icon: 'target', v: p.fit / 4, tip: 'Encaixe no gênero' },
    { icon: 'star', v: p.combo / 3, tip: 'Combinação' },
    { icon: 'gamepad', v: p.platform / 3, tip: 'Plataforma' },
    { icon: 'fire', v: p.trend / 3, tip: 'Moda' },
    { icon: 'refresh', v: p.novelty / 3, tip: 'Novidade' },
    { icon: 'bug', v: p.bugs / 4, tip: 'Bugs' },
  ].filter(item => Math.abs(item.v) >= .5)
  return (
    <div className="factors">
      {items.map(item => {
        const n = Math.min(3, Math.round(Math.abs(item.v)))
        return (
          <span key={item.tip} className={`factor ${item.v > 0 ? 'up' : 'down'}`} title={item.tip}>
            <Icon name={item.icon} size={14} stroke={2.6} />
            {(item.v > 0 ? '▲' : '▼').repeat(Math.max(1, n))}
          </span>
        )
      })}
    </div>
  )
}

export function ReviewReveal({ item, state }) {
  const game = state.games.find(entry => entry.id === item.gameId)
  const [t, setT] = useState(0)
  const start = useRef(performance.now())
  const fired = useRef(new Set())

  useEffect(() => {
    let frame
    const loop = () => {
      const elapsed = performance.now() - start.current
      setT(elapsed)
      if (elapsed < COMMENTS_AT + 1600) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    sfx.whoosh()
    return () => cancelAnimationFrame(frame)
  }, [])

  const once = (key, fn) => {
    if (fired.current.has(key)) return
    fired.current.add(key)
    fn()
  }
  FLIP_AT.forEach((at, i) => { if (t >= at) once(`flip${i}`, () => { sfx.flip(); vibrate(8) }) })
  if (t >= STAMP_AT && game) once('stamp', () => { sfx.stamp(); vibrate(game.score >= 8 ? [30, 40, 60] : 30); if (game.score >= 8) setTimeout(() => sfx.fanfare(), 250); if (game.score < 5) setTimeout(() => sfx.sad(), 250) })
  if (t >= REWARDS_AT && item.levelUps?.length) once('lvl', () => setTimeout(() => sfx.levelup(), 200))

  if (!game) return null
  const skip = () => {
    if (t < COMMENTS_AT + 1200) start.current -= COMMENTS_AT + 1600
  }
  const done = t >= REWARDS_AT

  return (
    <div className="modal-backdrop reveal-backdrop" onClick={skip}>
      <article className={`reveal ${t >= STAMP_AT ? 'stamped' : ''} ${game.score >= 9 ? 'legend' : ''}`} onClick={event => { event.stopPropagation(); skip() }}>
        <div className="reveal-cover">
          <Cover game={game} width={150} />
        </div>
        <div className="reveal-main">
          <h2 className="reveal-title">{game.title}</h2>
          <div className="critics">
            {item.critics.map((critic, i) => {
              const flipped = t >= FLIP_AT[i]
              return (
                <div key={critic.id} className={`critic ${flipped ? 'flipped' : ''} ${t >= FLIP_AT[i] - 400 ? 'dealt' : ''}`} style={{ '--sc': scoreColor(critic.score) }}>
                  <div className="critic-inner">
                    <div className="critic-back"><Icon name="question" size={30} stroke={2.6} /></div>
                    <div className="critic-front">
                      <span className="critic-name"><Icon name={critic.icon ?? 'newspaper'} size={12} stroke={2.6} />{critic.name}</span>
                      <span className="critic-score">{critic.score}</span>
                      <span className="critic-quote">“{critic.quote}”</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="verdict">
            {t >= STAMP_AT && (
              <div className="stamp" style={{ '--sc': scoreColor(game.score) }}>
                <span className="stamp-score">{fmtScore(game.score)}</span>
                <span className="stamp-tier">{scoreTier(game.score)}</span>
              </div>
            )}
            {t >= STAMP_AT && <Factors breakdown={item.breakdown} />}
          </div>

          {done && (
            <div className="rewards">
              {item.isNewCombo && (
                <span className={`combo-sticker combo-${item.combo}`}>
                  <Icon name="sparkle" size={14} stroke={2.6} />Combo novo: {COMBO_LABEL[item.combo]}
                </span>
              )}
              {game.breakout && <span className="combo-sticker combo-viral"><Icon name="fire" size={14} stroke={2.6} />Viralizou!</span>}
              {item.letdown && <span className="combo-sticker combo-letdown"><Icon name="frown" size={14} stroke={2.6} />Hype maior que o jogo</span>}
              <Chips items={[{ key: 'rp', value: item.rpGain }, ...(item.fanChips ?? [])]} />
              {item.levelUps?.length > 0 && (
                <div className="levelups">
                  {item.levelUps.map(lv => {
                    const person = state.staff.find(p => p.id === lv.staffId)
                    return (
                      <span key={lv.staffId} className="levelup">
                        {person && <Avatar look={person.look} size={30} />}
                        <b>nv {lv.level}</b>
                        {PILLARS.filter(p => lv.gains[p.id] > 0).map(p => <Chip key={p.id} k={p.id} value={lv.gains[p.id]} />)}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {t >= COMMENTS_AT && item.comments?.items?.length > 0 && (
            <div className={`comments medium-${item.comments.medium}`}>
              <span className="comments-label">{item.comments.mediumLabel}</span>
              {item.comments.items.map((comment, i) => (
                <div key={i} className="comment" style={{ animationDelay: `${i * 260}ms` }}>
                  <b>{comment.who}</b>
                  <span>{comment.text}</span>
                </div>
              ))}
            </div>
          )}

          {done && (
            <button type="button" className="btn btn-big btn-tomato reveal-go" onClick={event => { event.stopPropagation(); sfx.click(); dispatch({ type: 'CLOSE' }) }}>
              Bora!
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
