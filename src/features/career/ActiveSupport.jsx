import { useGame } from '../../app/GameContext.jsx'

export function ActiveSupport() {
  const { state } = useGame()
  if (!state.activeReleases.length) return null
  return (
    <section className="active-support">
      <span>AINDA EM SUPORTE</span>
      {state.activeReleases.map(release => {
        const game = state.games.find(item => item.id === release.gameId)
        return game && <div key={release.gameId}><strong>{game.title}</strong><small>{release.monthsLeft} meses de atenção · confiança {game.trust}</small></div>
      })}
    </section>
  )
}
