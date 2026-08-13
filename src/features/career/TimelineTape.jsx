import { useGame } from '../../app/GameContext.jsx'

export function TimelineTape() {
  const { state } = useGame()
  return (
    <section className="timeline-tape" aria-label="Últimos acontecimentos">
      <div className="timeline-label"><strong>FITA DA CARREIRA</strong><span>os últimos meses</span></div>
      <ol>{state.history.slice(-6).reverse().map(item => <li key={item.id} className={item.highlight ? 'is-highlight' : ''}><time>{item.date}</time><p>{item.title}</p></li>)}</ol>
    </section>
  )
}
