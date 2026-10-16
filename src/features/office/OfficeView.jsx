import { useEffect, useRef } from 'react'
import { OfficeWorld } from '../../three/world.js'
import { store } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { officeView } from './viewModel.js'

// Monta o mundo 3D uma vez e o mantém em sincronia com o estado, sem re-render do React.
export function OfficeView({ onPick, view: forcedView }) {
  const host = useRef(null)
  const world = useRef(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick

  useEffect(() => {
    const instance = new OfficeWorld(host.current, {
      onPick: (id, screen) => pickRef.current?.(id, screen),
      onBlip: voice => sfx.blip(voice),
    })
    world.current = instance
    window.__office = instance
    return () => {
      instance.dispose()
      world.current = null
      // a alça de depuração não pode segurar o mundo desmontado (nem a GPU dele)
      if (window.__office === instance) window.__office = null
    }
  }, [])

  useEffect(() => {
    if (forcedView) {
      world.current?.sync(forcedView)
      return undefined
    }
    let lastKey = ''
    const sync = () => {
      const state = store.getState()
      if (!state || !world.current) return
      const view = officeView(state)
      const key = JSON.stringify([view.office, view.era.id, view.year, view.month, view.decor, view.staff.map(p => [p.id, p.status, Math.round(p.energy / 10), p.top, p.working, p.pace]), view.crunch, view.ideas, view.visitor, view.posters.map(p => p.id), view.trophies, view.topics, view.sound])
      if (key === lastKey) return
      lastKey = key
      world.current.sync(view)
    }
    sync()
    const unsub = store.subscribe(sync)
    const unfx = store.onFx(fx => world.current?.handleFx(fx))
    return () => {
      unsub()
      unfx()
    }
  }, [forcedView])

  return <div className="office-view" ref={host} />
}
