import { useGame } from '../../app/GameContext.jsx'
import { TECHS, getEra } from '../../game/data/eras.js'
import { Button } from '../../components/ui/Button.jsx'

export function ResearchBoard() {
  const { state, dispatch } = useGame()
  const era = getEra(state.date.year)
  return (
    <section className="research-board">
      <header><div><p className="overline">PESQUISA</p><h3>{state.studio.research} pontos disponíveis</h3></div><span>{era.name} · teto {era.techCap}</span></header>
      <div>{TECHS.map(tech => {
        const unlocked = state.studio.unlockedTechs.includes(tech.id)
        const future = tech.level > era.techCap
        return <article key={tech.id} className={unlocked ? 'is-unlocked' : future ? 'is-future' : ''}><span>NÍVEL {tech.level}</span><h4>{tech.name}</h4><p>{tech.description}</p><Button size="small" variant={unlocked ? 'secondary' : 'primary'} disabled={unlocked || future || state.studio.research < tech.cost} onClick={() => dispatch({ type: 'RESEARCH_TECH', techId: tech.id })}>{unlocked ? 'DOMINADA' : future ? 'AINDA NÃO EXISTE' : `${tech.cost} PONTOS`}</Button></article>
      })}</div>
    </section>
  )
}
