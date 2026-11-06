import { useState } from 'react'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'

// Gera o cartaz em PNG. O desenho (ui/poster.js) só é carregado no primeiro clique.
export function PosterButton({ state, game = null, className = 'btn', children }) {
  const [busy, setBusy] = useState(false)
  const make = async () => {
    if (busy) return
    sfx.click()
    setBusy(true)
    try {
      const poster = await import('../../ui/poster.js')
      const ok = game ? await poster.downloadGamePoster(state, game) : await poster.downloadCareerPoster(state)
      if (ok) sfx.chime()
    } catch (error) {
      console.warn('Cartaz não saiu', error)
      sfx.back()
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" className={className} disabled={busy} aria-busy={busy} onClick={make}>
      <Icon name={busy ? 'dots' : 'share'} size={16} />{children}
    </button>
  )
}
