import { useEffect, useRef } from 'react'
import { useGame } from '../../app/GameContext.jsx'

const tabs = [
  ['career', 'CARREIRA'],
  ['projects', 'PROJETOS'],
  ['studio', 'ESTÚDIO'],
  ['market', 'MERCADO'],
  ['licenses', 'LICENÇAS'],
  ['industry', 'INDÚSTRIA'],
  ['charts', 'PARADAS'],
  ['history', 'HISTÓRIA'],
]

export function TabNav() {
  const { view, setView } = useGame()
  const navRef = useRef(null)
  useEffect(() => {
    navRef.current?.querySelector('.is-active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [view])
  return (
    <nav ref={navRef} className="tab-rail" aria-label="Seções do jogo">
      {tabs.map(([id, label], index) => (
        <button key={id} type="button" aria-current={view === id ? 'page' : undefined} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
          <span>{String(index + 1).padStart(2, '0')}</span>{label}
        </button>
      ))}
    </nav>
  )
}
