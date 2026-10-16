import { useMemo, useState } from 'react'
import { useGame } from '../../app/store.js'
import { sfx } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtNum, fmtScore, scoreColor } from '../../ui/format.js'
import { genreById } from '../../game/data/genres.js'
import { platformById } from '../../game/data/platforms.js'
import { MONTHS, eraAt } from '../../game/data/economy.js'
import {
  TIMELINE_FILTERS, almanacCompanies, almanacSales, almanacTimeline, consoleMarket, groupByYear, monthOfWeek,
  playerRecords, rankDecade, retiredPlatforms, salesDecades, salesSummary, upcomingPlatforms, worldRecords, yearRecords,
} from '../../game/engine/almanac.js'
import './almanac.css'

const TABS = [
  { id: 'sales', label: 'Vendas', icon: 'crown' },
  { id: 'consoles', label: 'Consoles', icon: 'gamepad' },
  { id: 'companies', label: 'Empresas', icon: 'building' },
  { id: 'timeline', label: 'Marcos', icon: 'flag' },
  { id: 'records', label: 'Recordes', icon: 'medal' },
]
const TYPE_ICON = { console: 'tv', portatil: 'gamepad', pc: 'code', arcade: 'arcade', mobile: 'phone', vr: 'eye', nuvem: 'wifi' }
const TIER_LABEL = { 1: 'Indie', 2: 'Média', 3: 'Grande', 4: 'Gigante' }

// A aba fica lembrada enquanto o jogo estiver aberto.
let lastTab = 'sales'

// Milhões em texto curto: 180 mi, 4,2 mi, 300 mil.
const fmtMi = value => {
  if (value >= 100) return `${Math.round(value)} mi`
  if (value >= 1) return `${(Math.round(value * 10) / 10).toLocaleString('pt-BR')} mi`
  if (value >= .001) return `${Math.round(value * 1000)} mil`
  return fmtNum(value * 1e6)
}

// Tinta ou branco sobre a cor da marca, o que ler melhor.
function inkOn(hex = '#888888') {
  const n = parseInt(hex.slice(1).padEnd(6, '0').slice(0, 6), 16)
  const lum = (.299 * (n >> 16) + .587 * ((n >> 8) & 255) + .114 * (n & 255)) / 255
  return lum > .62 ? '#1d1a24' : '#ffffff'
}
const brand = color => ({ '--c': color, '--fg': inkOn(color) })
const platformLabel = id => platformById(id)?.label ?? id
const stagger = index => (index < 14 ? { animationDelay: `${index * 22}ms` } : undefined)
// Sigla do selo: iniciais das duas primeiras palavras (Electronic Arts → EA) ou duas letras (Nintendo → NI).
const initials = name => {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)).toUpperCase()
}

function Chips({ options, value, onChange, label }) {
  return (
    <div className="alm-chips" role="group" aria-label={label}>
      {options.map(option => (
        <button key={String(option.id)} type="button" className={value === option.id ? 'on' : ''} aria-pressed={value === option.id} onClick={() => { sfx.click(); onChange(option.id) }}>
          {option.icon && <Icon name={option.icon} size={12} stroke={2.6} />}{option.label}{option.count != null && <b>{option.count}</b>}
        </button>
      ))}
    </div>
  )
}

function More({ onClick, children }) {
  return <button type="button" className="btn btn-small alm-more" onClick={() => { sfx.click(); onClick() }}><Icon name="plus" size={14} />{children}</button>
}

// ---------- mais vendidos ----------
function Glyph({ entry, size = 16 }) {
  if (entry.mine) return <Cover game={entry.game} width={30} />
  return <span className="alm-glyph"><Icon name={genreById(entry.genre)?.icon ?? 'cartridge'} size={size} stroke={2.4} /></span>
}

// Os três primeiros do recorte num pódio de adesivos: 2, 1, 3.
function Podium({ list }) {
  const steps = [1, 0, 2].filter(index => list[index])
  return (
    <div className="alm-podium">
      {steps.map(index => {
        const entry = list[index]
        return (
          <article key={entry.id} className={`alm-step s${index + 1} ${entry.mine ? 'mine' : ''}`} style={brand(entry.color)}>
            {index === 0 && <Icon name="crown" size={22} stroke={2.4} className="alm-crown" />}
            <div className="alm-step-card">
              <Glyph entry={entry} size={18} />
              <b>{entry.title}</b>
              <small>{entry.studio} · {entry.year}</small>
              <span className="alm-step-copies">{fmtMi(entry.copies)}</span>
            </div>
            <span className="alm-step-base">{entry.rank}</span>
          </article>
        )
      })}
    </div>
  )
}

function SalesRow({ entry, max, decade, index }) {
  const growing = entry.mine ? entry.game?.onMarket : entry.copies < entry.lifetime * .995
  return (
    <li className={`alm-row ${entry.mine ? 'mine' : ''}`} style={{ ...brand(entry.color), ...stagger(index) }}>
      <span className="alm-num">{entry.rank}</span>
      <Glyph entry={entry} />
      <span className="alm-name">
        <b>{entry.title}</b>
        <small>{entry.studio} · {entry.year} · {platformLabel(entry.platform)}</small>
      </span>
      <span className="alm-copies">
        <b>{fmtMi(entry.copies)}{growing && <i className="alm-up" aria-label="ainda vendendo">▲</i>}</b>
        {entry.mine && <em className="alm-me">{decade == null ? 'você' : `#${entry.allTime} da história`}</em>}
      </span>
      <i className="alm-bar" style={{ width: `${Math.max(2, entry.copies / max * 100)}%` }} />
    </li>
  )
}

const PAGE = 25
const PODIUM = 3

function SalesTab({ state, sales }) {
  const [decade, setDecade] = useState(null)
  const [limit, setLimit] = useState(PAGE)
  const list = useMemo(() => rankDecade(sales, decade), [sales, decade])
  const summary = useMemo(() => salesSummary(sales), [sales])
  const rows = list.slice(PODIUM, limit)
  // Seus jogos fora da página continuam à vista, embaixo dos três pontinhos.
  const pinned = list.slice(Math.max(PODIUM, limit)).filter(entry => entry.mine).slice(0, 3)
  const max = list[0]?.copies || 1
  const options = [{ id: null, label: 'Tudo' }, ...salesDecades(state).map(year => ({ id: year, label: `${String(year).slice(2)}s` }))]
  return (
    <>
      <Chips options={options} value={decade} onChange={value => { setDecade(value); setLimit(PAGE) }} label="Década" />
      <div className="alm-summary">
        <span className="alm-pill" title="1 milhão ou mais"><Icon name="disc" size={14} /><b>{summary.millionClub}</b>milionários</span>
        {summary.playerBest && <span className="alm-pill mine"><Icon name="star" size={14} /><b>#{summary.playerBest}</b>da história</span>}
      </div>
      {list.length > 0 && <Podium list={list} />}
      <ol className="alm-list" start={PODIUM + 1}>
        {rows.map((entry, index) => <SalesRow key={entry.id} entry={entry} max={max} decade={decade} index={index} />)}
        {pinned.length > 0 && <li className="alm-gap" aria-hidden="true">···</li>}
        {pinned.map((entry, index) => <SalesRow key={entry.id} entry={entry} max={max} decade={decade} index={index} />)}
      </ol>
      {!list.length && <p className="empty">Nada vendido ainda.</p>}
      {list.length > limit && <More onClick={() => setLimit(value => value + PAGE)}>{PAGE}</More>}
    </>
  )
}

// ---------- consoles ----------
function ConsolesTab({ state }) {
  const market = useMemo(() => consoleMarket(state), [state])
  const next = useMemo(() => upcomingPlatforms(state, 4), [state])
  const gone = useMemo(() => retiredPlatforms(state, 4), [state])
  const max = market[0]?.share || 1
  return (
    <>
      <h3 className="alm-h"><Icon name="chart" size={16} />Agora<small>{market.length}</small></h3>
      <ul className="alm-list">
        {market.map((item, index) => (
          <li key={item.id} className="alm-share" style={{ ...brand(item.color), ...stagger(index) }}>
            <span className="alm-glyph"><Icon name={TYPE_ICON[item.type] ?? 'gamepad'} size={15} stroke={2.4} />{state.kits?.includes(item.id) && <i className="alm-kit" title="Kit na mão"><Icon name="check" size={9} stroke={3.4} /></i>}</span>
            <span className="alm-name"><b>{item.label}</b><small>{item.maker}</small></span>
            <span className="alm-pct">{item.share < .01 ? '<1' : Math.round(item.share * 100)}%<i className={`alm-trend t${item.trend}`} aria-label={item.trend > 0 ? 'subindo' : item.trend < 0 ? 'caindo' : 'estável'}>{item.trend > 0 ? '▲' : item.trend < 0 ? '▼' : '•'}</i></span>
            <span className="alm-meter"><i style={{ width: `${Math.max(3, item.share / max * 100)}%` }} /></span>
          </li>
        ))}
      </ul>

      <h3 className="alm-h"><Icon name="clock" size={16} />Próximos</h3>
      <div className="alm-next">
        {next.map((item, index) => (
          <article key={item.id} className={`alm-launch ${item.rumor ? 'rumor' : ''}`} style={{ ...brand(item.color), ...stagger(index) }}>
            {item.rumor && <span className="alm-tag">rumor</span>}
            <small className="alm-date">{MONTHS[item.month]} {item.year}</small>
            <b>{item.label}</b>
            <small className="alm-maker"><Icon name={TYPE_ICON[item.type] ?? 'gamepad'} size={11} stroke={2.6} />{item.maker}</small>
            {item.loves.length > 0 && (
              <span className="alm-loves" title="O público vai amar">
                <Icon name="heart" size={11} stroke={2.6} />
                {item.loves.map(id => <Icon key={id} name={genreById(id)?.icon ?? 'question'} size={13} stroke={2.4} title={genreById(id)?.label} />)}
              </span>
            )}
            <span className="alm-countdown"><Icon name="clock" size={11} stroke={2.6} />{item.countdown}</span>
          </article>
        ))}
        {!next.length && <p className="empty">Nada anunciado.</p>}
      </div>

      {gone.length > 0 && (
        <>
          <h3 className="alm-h"><Icon name="zzz" size={16} />Aposentados</h3>
          <ul className="alm-list alm-retired">
            {gone.map(item => (
              <li key={item.id} style={brand(item.color)}>
                <i className="alm-dot" />
                <b>{item.label}</b>
                <small>{item.from}–{item.to}</small>
                {item.base != null && <small className="alm-base" title="aparelhos vendidos">≈{fmtMi(item.base)}</small>}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

// ---------- empresas ----------
function CompanyCard({ company, view, open, onToggle, index }) {
  const hit = company.hits[0]
  return (
    <article className={`alm-co ${view} ${open ? 'open' : ''}`} style={{ ...brand(company.color), ...stagger(index) }}>
      <button type="button" className="alm-co-head" onClick={onToggle} aria-expanded={open}>
        <span className="alm-logo">{initials(company.name)}</span>
        <span className="alm-name">
          <b>{company.name}{company.fresh && <em className="alm-new">nova</em>}</b>
          <small>
            {view === 'closed' ? `${company.founded}–${company.closed}` : `desde ${company.founded}`}
            {view === 'acquired' && company.since != null && ` · sua em ${company.since}`}
            {company.games > 0 && ` · ${company.games} ${company.games === 1 ? 'jogo' : 'jogos'}`}
          </small>
        </span>
        <span className="alm-tier" title={TIER_LABEL[company.tier]} aria-label={`Porte: ${TIER_LABEL[company.tier]}`}>
          {[1, 2, 3, 4].map(level => <i key={level} className={level <= company.tier ? 'on' : ''} />)}
        </span>
      </button>
      {hit && !open && <div className="alm-co-hit"><Icon name="star" size={12} stroke={2.6} /><b>{hit.title}</b><span>{fmtMi(hit.copies)}</span></div>}
      {open && (
        <ol className="alm-co-hits">
          {company.hits.map(entry => (
            <li key={entry.id}><small>{entry.year}</small><b>{entry.title}</b><span>{fmtMi(entry.copies)}</span></li>
          ))}
          {!company.hits.length && <li className="alm-quiet">Nenhum clássico ainda.</li>}
        </ol>
      )}
    </article>
  )
}

function CompaniesTab({ state, sales }) {
  const data = useMemo(() => almanacCompanies(state, sales), [state, sales])
  const [view, setView] = useState('active')
  const [open, setOpen] = useState(null)
  const options = [
    { id: 'active', label: 'Ativas', icon: 'building', count: data.active.length },
    { id: 'closed', label: 'Fechadas', icon: 'door', count: data.closed.length },
    ...(data.acquired.length ? [{ id: 'acquired', label: 'Suas', icon: 'handshake', count: data.acquired.length }] : []),
  ]
  const list = data[view] ?? []
  return (
    <>
      <Chips options={options} value={view} onChange={value => { setView(value); setOpen(null) }} label="Empresas" />
      <div className="alm-list">
        {list.map((company, index) => (
          <CompanyCard key={company.id} company={company} view={view} index={index} open={open === company.id} onToggle={() => { sfx.click(); setOpen(open === company.id ? null : company.id) }} />
        ))}
        {!list.length && <p className="empty">Ninguém por aqui.</p>}
      </div>
    </>
  )
}

// ---------- linha do tempo ----------
function TimelineTab({ state, sales }) {
  const items = useMemo(() => almanacTimeline(state, sales), [state, sales])
  const [filter, setFilter] = useState('all')
  const [years, setYears] = useState(6)
  const groups = useMemo(() => groupByYear(items.filter(TIMELINE_FILTERS[filter])), [items, filter])
  const options = [
    { id: 'all', label: 'Tudo' },
    { id: 'mine', label: 'Você', icon: 'star' },
    { id: 'consoles', label: 'Consoles', icon: 'gamepad' },
    { id: 'world', label: 'Mundo', icon: 'globe' },
  ]
  return (
    <>
      <Chips options={options} value={filter} onChange={value => { setFilter(value); setYears(6) }} label="Filtro" />
      <div className="alm-timeline">
        {groups.slice(0, years).map(group => (
          <section key={group.year} className="alm-year">
            <span className="alm-year-tag">{group.year}</span>
            <ul>
              {group.items.map(item => (
                <li key={item.key} className={`alm-ev k-${item.kind} ${item.mine ? 'mine' : ''}`} style={item.color ? brand(item.color) : undefined}>
                  <span className="alm-ev-icon"><Icon name={item.icon} size={13} stroke={2.6} /></span>
                  <span className="alm-ev-text"><b>{item.text}</b>{item.sub && <small>{item.sub}</small>}</span>
                  {item.score != null
                    ? <span className="alm-score" style={{ background: scoreColor(item.score) }}>{fmtScore(item.score)}</span>
                    : item.month >= 0 && <small className="alm-month">{MONTHS[item.month]}</small>}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!groups.length && <p className="empty">Nada por aqui ainda.</p>}
      </div>
      {groups.length > years && <More onClick={() => setYears(value => value + 8)}>anos</More>}
    </>
  )
}

// ---------- recordes ----------
function Record({ icon, label, value, sub, tone }) {
  return (
    <div className={`alm-rec ${tone ?? ''}`}>
      <small><Icon name={icon} size={12} stroke={2.6} />{label}</small>
      <b>{value}</b>
      {sub && <span>{sub}</span>}
    </div>
  )
}

function YearCell({ entry, value }) {
  if (!entry) return <span className="alm-yc empty-cell">—</span>
  return <span className={`alm-yc ${entry.mine ? 'mine' : ''}`}><b>{entry.title}</b><small>{value}</small></span>
}

function RecordsTab({ state, sales }) {
  const years = useMemo(() => yearRecords(state, sales), [state, sales])
  const mine = useMemo(() => playerRecords(state, sales, years), [state, sales, years])
  const world = useMemo(() => worldRecords(sales), [sales])
  const [limit, setLimit] = useState(12)
  return (
    <>
      <h3 className="alm-h"><Icon name="star" size={16} />Seus</h3>
      {mine ? (
        <div className="alm-recs">
          <Record icon="star" label="nota" value={fmtScore(mine.bestScore.score)} sub={mine.bestScore.title} />
          <Record icon="disc" label="cópias" value={fmtNum(mine.bestSeller.sold ?? 0)} sub={mine.bestSeller.title} />
          <Record icon="cash" label="receita" value={fmtMoney(mine.bestRevenue.revenue ?? 0)} sub={mine.bestRevenue.title} />
          <Record icon="crown" label="história" value={mine.bestRank ? `#${mine.bestRank.rank}` : '—'} sub={mine.bestRank?.title} tone="sun" />
          <Record icon="trophy" label="jogo do ano" value={mine.goty} sub={`${mine.numberOnes}× nº 1`} />
          <Record icon="medal" label="campeão do ano" value={mine.sellerCrowns + mine.criticCrowns} sub={`${mine.sellerCrowns} vendas · ${mine.criticCrowns} nota`} />
        </div>
      ) : <p className="note"><Icon name="cartridge" size={14} />Lance um jogo para entrar aqui.</p>}

      {world && (
        <>
          <h3 className="alm-h"><Icon name="globe" size={16} />Do mundo</h3>
          <div className="alm-recs alm-world">
            <Record icon="disc" label="mais vendido" value={fmtMi(world.seller.copies)} sub={world.seller.title} tone={world.seller.mine ? 'sun' : 'ink'} />
            <Record icon="star" label="maior nota" value={fmtScore(world.critic.score)} sub={world.critic.title} tone={world.critic.mine ? 'sun' : 'ink'} />
          </div>
        </>
      )}

      <h3 className="alm-h"><Icon name="calendar" size={16} />Ano a ano</h3>
      <div className="alm-years">
        <div className="alm-yr alm-yr-head"><span /><span><Icon name="disc" size={13} stroke={2.6} />vendas</span><span><Icon name="star" size={13} stroke={2.6} />nota</span></div>
        {years.slice(0, limit).map(year => (
          <div key={year.year} className="alm-yr">
            <span className="alm-yr-year">{year.year}{year.goty?.mine && <Icon name="trophy" size={12} stroke={2.6} title="Seu Jogo do Ano" />}</span>
            <YearCell entry={year.seller} value={year.seller && fmtMi(year.seller.copies)} />
            <YearCell entry={year.critic} value={year.critic && fmtScore(year.critic.score)} />
          </div>
        ))}
      </div>
      {years.length > limit && <More onClick={() => setLimit(value => value + 12)}>anos</More>}
    </>
  )
}

export function AlmanacPanel() {
  const state = useGame()
  const [tab, setTab] = useState(lastTab)
  // O jogo pausa com o painel aberto: o cálculo roda uma vez por abertura.
  const sales = useMemo(() => almanacSales(state), [state])
  const pick = id => {
    sfx.click()
    lastTab = id
    setTab(id)
  }
  return (
    <div className="alm">
      <div className="alm-now"><Icon name="calendar" size={14} stroke={2.6} /><b>{MONTHS[monthOfWeek(state.week)]} {state.year}</b><span>{eraAt(state.year).label}</span></div>
      <div className="alm-dock">
        <div className="alm-tabs" role="tablist" aria-label="Almanaque">
          {TABS.map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'on' : ''} onClick={() => pick(item.id)}>
              <Icon name={item.icon} size={18} stroke={2.4} />{item.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'sales' && <SalesTab state={state} sales={sales} />}
      {tab === 'consoles' && <ConsolesTab state={state} />}
      {tab === 'companies' && <CompaniesTab state={state} sales={sales} />}
      {tab === 'timeline' && <TimelineTab state={state} sales={sales} />}
      {tab === 'records' && <RecordsTab state={state} sales={sales} />}
    </div>
  )
}
