import { ActiveSupport } from '../features/career/ActiveSupport.jsx'
import { MarketClipping } from '../features/career/MarketClipping.jsx'
import { MonthActions } from '../features/career/MonthActions.jsx'
import { TimelineTape } from '../features/career/TimelineTape.jsx'
import { ProjectFocus } from '../features/project/ProjectFocus.jsx'
import { ProjectStrategy } from '../features/project/ProjectStrategy.jsx'

export function CareerScreen() {
  return (
    <section className="screen career-screen" aria-labelledby="career-title">
      <h2 id="career-title" className="sr-only">Carreira</h2>
      <div className="career-grid">
        <ProjectFocus />
        <aside className="career-sidebar"><MonthActions /><MarketClipping /></aside>
      </div>
      <ActiveSupport />
      <ProjectStrategy />
      <TimelineTape />
    </section>
  )
}
