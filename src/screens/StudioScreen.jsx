import { useGame } from '../app/GameContext.jsx'
import { STATS } from '../game/data/catalog.js'
import { CULTURES, OFFICES } from '../game/data/team.js'
import { EQUIPMENT } from '../game/data/traits.js'
import { getPhilosophy, getTrait } from '../game/engine/selectors.js'
import { formatMoney, formatNumber } from '../game/engine/utils.js'
import { Button } from '../components/ui/Button.jsx'
import { TeamRoster } from '../features/studio/TeamRoster.jsx'
import { HiringBoard } from '../features/studio/HiringBoard.jsx'
import { ResearchBoard } from '../features/studio/ResearchBoard.jsx'
import { BusinessDesk } from '../features/business/BusinessDesk.jsx'
import { CorporateDesk } from '../features/corporate/CorporateDesk.jsx'

export function StudioScreen() {
  const { state, dispatch } = useGame()
  const trait = getTrait(state)
  const philosophy = getPhilosophy(state)
  const equipment = EQUIPMENT[state.player.equipmentLevel]
  const nextEquipment = EQUIPMENT[state.player.equipmentLevel + 1]
  const equipmentIsFuture = nextEquipment && state.date.year < nextEquipment.unlockYear
  const office = OFFICES[state.studio.officeLevel]
  const nextOffice = OFFICES[state.studio.officeLevel + 1]
  const audience = state.player.audience
  const segments = [['Hardcore', audience.hardcore], ['Casual', audience.casual], ['Nostálgicos', audience.nostalgic], ['Confiança', `${audience.trust}/100`]]
  const founderInitials = state.player.name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  return (
    <section className="screen" aria-labelledby="studio-title">
      <header className="screen-heading"><div><p className="overline">QUEM FAZ OS JOGOS</p><h2 id="studio-title">{state.studio.name}</h2></div><p>{office.name}. Custo fixo de {formatMoney(state.studio.monthlyBurn)} por mês.</p></header>
      <div className="studio-grid">
        <section className="profile-sheet">
          <div className="profile-head"><div className="portrait-placeholder">{founderInitials}</div><div><span>FUNDADOR · {state.player.health}% SAÚDE</span><h3>{state.player.name}, {state.player.age}</h3><p>{trait.name}: {trait.description}</p></div></div>
          <div className="skill-list">{STATS.map(stat => <div key={stat.id}><span>{stat.label}</span><div><i style={{ width: `${state.player.stats[stat.id]}%` }} /></div><strong>{state.player.stats[stat.id]}</strong></div>)}</div>
        </section>
        <div className="studio-side">
          <section className="philosophy-card"><span>A IMPRENSA CHAMA DE</span><h3>{philosophy.name}</h3><p>{philosophy.description}</p></section>
          <section className="equipment-card"><div className="card-kicker"><span>EQUIPAMENTO</span><span>NÍVEL {equipment.level}</span></div><div><h3>{equipment.name}</h3><p>{equipment.description}</p>{nextEquipment ? <><small>PRÓXIMO: {nextEquipment.name} · {formatMoney(nextEquipment.cost)}{equipmentIsFuture ? ` · disponível em ${nextEquipment.unlockYear}` : ''}</small><Button variant="primary" onClick={() => dispatch({ type: 'UPGRADE_EQUIPMENT' })} disabled={equipmentIsFuture || state.player.money < nextEquipment.cost}>{equipmentIsFuture ? `CHEGA EM ${nextEquipment.unlockYear}` : 'COMPRAR'}</Button></> : <small>Você chegou ao limite desta linha do tempo.</small>}</div></section>
        </div>
      </div>
      <section className="studio-policy-row">
        <div><p className="overline">CULTURA</p><select value={state.studio.cultureId} disabled={(state.studio.cultureLockMonths ?? 0) > 0} onChange={event => dispatch({ type: 'CHANGE_CULTURE', cultureId: event.target.value })}>{CULTURES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><p>{CULTURES.find(item => item.id === state.studio.cultureId)?.description}{state.studio.cultureLockMonths ? ` Novo acordo em teste por ${state.studio.cultureLockMonths} ${state.studio.cultureLockMonths === 1 ? 'mês' : 'meses'}.` : ''}</p></div>
        <div><p className="overline">ESCRITÓRIO</p><h3>{office.name}</h3><p>{office.capacity} {office.capacity === 1 ? 'lugar' : 'lugares'} · {formatMoney(office.monthly)}/mês</p>{nextOffice && <Button size="small" variant="primary" onClick={() => dispatch({ type: 'MOVE_OFFICE' })} disabled={state.player.money < nextOffice.cost}>MUDAR PARA {nextOffice.name.toUpperCase()} · {formatMoney(nextOffice.cost)}</Button>}</div>
      </section>
      <TeamRoster />
      <HiringBoard />
      <ResearchBoard />
      <BusinessDesk />
      <CorporateDesk />
      <section className="audience-memory"><header><p className="overline">MEMÓRIA DO PÚBLICO</p><h3>Seguidores não são todos iguais.</h3><span>{formatNumber(state.player.followers)} no total</span></header><div>{segments.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? formatNumber(value) : value}</strong></article>)}</div></section>
    </section>
  )
}
