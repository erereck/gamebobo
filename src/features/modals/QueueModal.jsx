import { useGame } from '../../app/store.js'
import { EventModal } from './EventModal.jsx'
import { PhaseModal } from './PhaseModal.jsx'
import { ReadyModal } from './ReadyModal.jsx'
import { ReviewReveal } from './ReviewReveal.jsx'
import { AwardsModal } from './AwardsModal.jsx'
import { BankruptModal } from './BankruptModal.jsx'
import { ExpoModal } from './ExpoModal.jsx'

export function QueueModal() {
  const state = useGame()
  const item = state.queue[0]
  if (!item) return null
  switch (item.kind) {
    case 'event':
    case 'idea':
      return <EventModal key={item.id} item={item} state={state} />
    case 'phase':
      return <PhaseModal key={item.id} item={item} state={state} />
    case 'ready':
      return <ReadyModal key={item.id} item={item} state={state} />
    case 'review':
      return <ReviewReveal key={item.id} item={item} state={state} />
    case 'awards':
      return <AwardsModal key={item.id} item={item} state={state} />
    case 'expo':
      return <ExpoModal key={item.id} item={item} state={state} />
    case 'bankrupt':
      return <BankruptModal key={item.id} state={state} />
    default:
      return null
  }
}
