import { useEffect, useRef } from 'react'
import { useGame } from '../../app/GameContext.jsx'
import { Icon } from '../ui/Icon.jsx'

const tabs = [
  ['career', 'CARREIRA', 'career'],
  ['projects', 'PROJETOS', 'projects'],
  ['studio', 'ESTÚDIO', 'studio'],
  ['market', 'MERCADO', 'market'],
  ['licenses', 'LICENÇAS', 'licenses'],
  ['industry', 'INDÚSTRIA', 'industry'],
  ['charts', 'PARADAS', 'charts'],
  ['history', 'HISTÓRIA', 'history'],
]

export function TabNav() {
  const { view, setView } = useGame()
  const navRef = useRef(null)
  useEffect(() => {
    navRef.current?.querySelector('.is-active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [view])
  return (
    <nav ref={navRef} className="tab-rail" aria-label="Seções do jogo">
      {tabs.map(([id, label, icon]) => (
        <button key={id} type="button" aria-current={view === id ? 'page' : undefined} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
          <Icon name={icon} size={17} /><span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
