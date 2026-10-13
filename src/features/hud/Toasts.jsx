import { useEffect } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Chips } from '../../ui/Chips.jsx'

function Toast({ toast }) {
  useEffect(() => {
    if (toast.kind === 'great' || toast.kind === 'achievement' || toast.kind === 'legacy') sfx.levelup()
    else if (toast.kind === 'bad') sfx.back()
    else sfx.pop()
    const life = toast.kind === 'achievement' || toast.kind === 'great' ? 4600 : 3400
    const id = setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: toast.id }), life)
    return () => clearTimeout(id)
  }, [toast.id])
  return (
    <button type="button" className={`toast toast-${toast.kind} ${toast.rarity ? `rar-${toast.rarity}` : ''}`} onClick={() => dispatch({ type: 'DISMISS_TOAST', id: toast.id })}>
      <span className="toast-icon"><Icon name={toast.icon ?? 'sparkle'} size={20} stroke={2.2} /></span>
      <span className="toast-text">
        <b>{toast.title}</b>
        {toast.sub && <small>{toast.sub}</small>}
      </span>
      {toast.chips?.length ? <Chips items={toast.chips} /> : null}
    </button>
  )
}

export function Toasts() {
  const state = useGame()
  return (
    <div className="toasts" aria-live="polite">
      {state.toasts.slice(-4).map(toast => <Toast key={toast.id} toast={toast} />)}
    </div>
  )
}
