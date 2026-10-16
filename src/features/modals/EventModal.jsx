import { useEffect, useState } from 'react'
import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Avatar } from '../../ui/Avatar.jsx'
import { Chips, PreviewChips } from '../../ui/Chips.jsx'
import { eventById, fillText, ideaById } from '../../game/engine/events.js'

export function EventModal({ item, state }) {
  const isIdea = item.kind === 'idea'
  const data = isIdea ? ideaById(item.ideaId) : eventById(item.eventId)
  const person = item.ctx?.staffId ? state.staff.find(p => p.id === item.ctx.staffId) : null
  const [rolling, setRolling] = useState(false)
  const result = item.result

  useEffect(() => {
    if (result && result.win !== null && result.win !== undefined) {
      setRolling(true)
      const ticks = setInterval(() => sfx.tick(), 90)
      const id = setTimeout(() => {
        clearInterval(ticks)
        setRolling(false)
        if (result.win) { sfx.fanfare(); vibrate([20, 40, 20]) } else { sfx.sad(); vibrate(60) }
      }, 1150)
      return () => { clearTimeout(id); clearInterval(ticks) }
    }
    if (result) sfx.select()
    return undefined
  }, [result])

  useEffect(() => {
    if (!data) dispatch({ type: 'CLOSE' })
  }, [data])
  if (!data) return null
  const title = fillText(data.title, state, item.ctx)
  const text = data.text ? fillText(data.text, state, item.ctx) : null
  const chosen = result ? data.choices[result.index] : null

  return (
    <div className="modal-backdrop">
      <article className={`event-card ${isIdea ? 'is-idea' : ''} ${data.funny ? 'is-funny' : ''}`}>
        <div className="event-head">
          {isIdea && person ? (
            <span className="event-avatar"><Avatar look={person.look} size={64} /><span className="idea-bulb"><Icon name="bulb" size={16} stroke={2.6} /></span></span>
          ) : (
            <span className="event-icon"><Icon name={data.icon} size={40} stroke={2.2} /></span>
          )}
          {data.funny && <span className="event-tag">absurdo</span>}
        </div>
        <h2 className="event-title">{title}</h2>
        {text && <p className="event-text">{text}</p>}

        {!result && (
          <div className="choices">
            {data.choices.map((choice, index) => (
              <button key={index} type="button" className="choice" onClick={() => { sfx.click(); vibrate(10); dispatch({ type: 'CHOOSE', index }) }}>
                <span className="choice-label">{choice.label}</span>
                {choice.gamble ? (
                  <span className="odds"><Icon name="dice" size={14} stroke={2.6} />{Math.round(choice.gamble.chance * 100)}%</span>
                ) : (
                  <PreviewChips effects={choice.effects} />
                )}
              </button>
            ))}
          </div>
        )}

        {result && rolling && (
          <div className="roll">
            <span className="roll-die"><Icon name="dice" size={46} stroke={2.2} /></span>
            <span className="roll-chance">{Math.round((chosen?.gamble?.chance ?? .5) * 100)}%</span>
          </div>
        )}

        {result && !rolling && (
          <div className={`outcome ${result.win === false ? 'bad' : result.win ? 'good' : ''}`}>
            <span className="outcome-pick">{chosen?.label}</span>
            {result.win !== null && result.win !== undefined && <span className="outcome-stamp">{result.win ? 'DEU BOM' : 'DEU RUIM'}</span>}
            {result.text && <p className="outcome-text">{result.text}</p>}
            <Chips items={result.chips} big />
            <button type="button" className="btn btn-big btn-tomato" autoFocus onClick={() => { sfx.click(); dispatch({ type: 'CLOSE' }) }}>Beleza</button>
          </div>
        )}
      </article>
    </div>
  )
}
