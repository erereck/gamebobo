import { useState } from 'react'
import { dispatch } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Chips } from '../../ui/Chips.jsx'

// Bobo Awards: envelope por categoria, só para onde você concorre.
export function AwardsModal({ item }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const category = item.categories[index]
  const last = index >= item.categories.length - 1
  const winner = category.finalists[category.winner]

  const reveal = () => {
    setOpen(true)
    if (winner.mine) {
      sfx.fanfare()
      vibrate([30, 40, 60])
      window.__office?.particles?.burst?.({ x: 0, y: 0, z: 0 }, 140, 5)
    } else sfx.sad()
  }
  const next = () => {
    sfx.click()
    if (last) return dispatch({ type: 'CLOSE' })
    setIndex(i => i + 1)
    setOpen(false)
  }

  return (
    <div className="modal-backdrop awards-backdrop">
      <article className="awards">
        <div className="awards-kicker">Bobo Awards {item.year}</div>
        <h2 className="awards-cat"><Icon name={category.icon} size={26} />{category.label}</h2>
        <div className="finalists">
          {category.finalists.map((entry, i) => (
            <div key={`${entry.title}-${i}`} className={`finalist ${entry.mine ? 'mine' : ''} ${open && i === category.winner ? 'winner' : ''} ${open && i !== category.winner ? 'loser' : ''}`}>
              <b>{entry.title}</b>
              <small>{entry.studio}</small>
              {open && i === category.winner && <span className="finalist-trophy"><Icon name="trophy" size={22} /></span>}
            </div>
          ))}
        </div>
        {!open ? (
          <button type="button" className="envelope" onClick={reveal}>
            <span className="envelope-flap" aria-hidden="true" />
            <span className="envelope-text">Abrir envelope</span>
          </button>
        ) : (
          <div className="award-result">
            {winner.mine ? (
              <>
                <div className="award-win">É SEU!</div>
                <Chips items={category.chips ?? []} />
              </>
            ) : (
              <div className="award-lose">Ficou no top 3</div>
            )}
            <button type="button" className="btn btn-big btn-tomato" onClick={next}>{last ? 'Fechar' : 'Próxima'}</button>
          </div>
        )}
        <div className="awards-dots">{item.categories.map((c, i) => <i key={c.id} className={i === index ? 'on' : i < index ? 'past' : ''} />)}</div>
      </article>
    </div>
  )
}
