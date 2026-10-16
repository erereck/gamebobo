import { useEffect, useMemo, useRef, useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney, fmtScore, scoreColor } from '../../ui/format.js'
import { COMBO_LABEL, genreById, themeById, unlockedGenres, unlockedThemes } from '../../game/data/genres.js'
import { availablePlatforms, platformById, platformFit, platformSize } from '../../game/data/platforms.js'
import { OFFICES, SIZES } from '../../game/data/economy.js'
import { ACCESSORIES, PROJECT_TYPES, PUBLISHERS, projectTypeById } from '../../game/data/modes.js'
import { PILLARS } from '../../game/data/staff.js'
import { HOOKS } from '../../game/data/content/hooks.js'
import { projectCost } from '../../game/engine/project.js'
import { validChoice } from '../../game/engine/reducer.js'
import { collectionTitle, generateTitle, remakeTitle, remasterTitle, sequelTitle, spinoffTitle } from '../../game/engine/titles.js'
import { yearFloat, absWeek } from '../../game/engine/state.js'
import { freeTeams, teamMembers } from '../../game/engine/teams.js'
import { allowsPlatform, allowsSize, allowsType, comboBlocked } from '../../game/engine/modes.js'
import { sample, clamp } from '../../game/engine/rng.js'

const STARS = { 3: '★★★', 2: '★★', 1: '★', 0: '✕' }
const gameWeek = game => (game.year - 1980) * 48 + game.week

function GenreBars({ w }) {
  return (
    <span className="gbars" aria-hidden="true">
      {PILLARS.map(p => <i key={p.id} style={{ height: `${Math.round(w[p.id] * 100 / .5)}%`, background: p.color }} />)}
    </span>
  )
}

function modsArrows(mods = {}, genres, genre) {
  const out = []
  for (const p of PILLARS) if (mods[p.id] && mods[p.id] !== 1) out.push({ icon: p.icon, up: mods[p.id] > 1, big: Math.abs(mods[p.id] - 1) >= .2 })
  if (mods.bugs && mods.bugs !== 1) out.push({ icon: 'bug', up: mods.bugs > 1, bad: mods.bugs > 1, big: Math.abs(mods.bugs - 1) >= .25 })
  if (mods.hype) out.push({ icon: 'megaphone', up: true, big: mods.hype >= 12 })
  if (mods.costMult && mods.costMult !== 1) out.push({ icon: 'cash', up: mods.costMult > 1, bad: mods.costMult > 1, big: Math.abs(mods.costMult - 1) >= .2 })
  if (mods.weeks) out.push({ icon: 'clock', up: mods.weeks > 0, bad: mods.weeks > 0, big: Math.abs(mods.weeks) >= 3 })
  if (mods.sales && mods.sales !== 1) out.push({ icon: 'chart', up: mods.sales > 1, big: mods.sales >= 1.15 })
  if (mods.score && genres?.includes(genre)) out.push({ icon: 'star', up: true, big: mods.score >= 3 })
  return out
}

function Arrows({ list }) {
  return (
    <span className="arrows">
      {list.map((a, i) => (
        <span key={i} className={`arr ${(a.bad ? !a.up : a.up) ? 'good' : 'bad'}`}><Icon name={a.icon} size={12} stroke={2.6} />{a.up ? (a.big ? '▲▲' : '▲') : (a.big ? '▼▼' : '▼')}</span>
      ))}
    </span>
  )
}

function Tile({ selected, disabled, onClick, children, className = '', style }) {
  return (
    <button type="button" className={`tile ${selected ? 'on' : ''} ${className}`} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

// Chance de uma editora topar o jogo: depende do histórico recente, da fama e do tamanho.
function pitchChance(state, publisher, size) {
  const recent = state.games.slice(-3)
  const avg = recent.length ? recent.reduce((sum, game) => sum + game.score, 0) / recent.length : 5
  const sizePenalty = { medio: 0, grande: .08, aaa: .16 }[size] ?? 0
  return clamp(.32 + (avg - publisher.bar) * .22 + Math.min(.25, state.legacy / 2000) + (state.fans > 10000 ? .05 : 0) - sizePenalty, .05, .92)
}

export function NewGameFlow({ onClose }) {
  const state = useGame()
  const [choice, setChoice] = useState({})
  const [hooks, setHooks] = useState(null)
  const [hybrid, setHybrid] = useState(false)
  const [multi, setMulti] = useState(false)
  const [pitched, setPitched] = useState({})
  const scroller = useRef(null)
  const t = yearFloat(state)
  const now = absWeek(state)
  const lock = state.mode?.id === 'franquia' ? state.mode.franchise : null
  const brief = state.mode?.brief ?? null

  // Jogos que podem servir de base para cada tipo de projeto.
  const eligible = useMemo(() => {
    const games = lock ? state.games.filter(game => game.franchise === lock.id) : state.games
    const latestByFranchise = new Map()
    for (const game of games) latestByFranchise.set(game.franchise, game)
    const franchises = [...latestByFranchise.values()]
    return {
      sequel: franchises.filter(game => game.score >= 6.5 && now - gameWeek(game) >= 20),
      spinoff: franchises.filter(game => game.score >= 6 && now - gameWeek(game) >= 20),
      remake: games.filter(game => state.year - game.year >= 5 && game.type !== 'port'),
      remaster: games.filter(game => state.year - game.year >= 3 && game.type !== 'port'),
      port: games.filter(game => game.type !== 'collection' && availablePlatforms(t).some(platform => platform.id !== game.platform && allowsPlatform(state, platform))),
      collection: games.filter(game => state.year - game.year >= 2 && game.type !== 'collection'),
    }
  }, [state.games, state.year, now])

  const types = PROJECT_TYPES.filter(type => allowsType(state, type.id) && (type.id === 'original' || (type.source === 'many' ? eligible.collection.length >= 2 : eligible[type.id]?.length)))
  const type = projectTypeById(choice.type ?? (types.length === 1 ? types[0].id : undefined))
  const lead = choice.sources?.length ? state.games.find(game => game.id === choice.sources[0]) : null
  const genreId = choice.genre ?? (['sequel', 'remake', 'remaster', 'port'].includes(type.id) ? lead?.genre : null)
  const themeId = choice.theme ?? (type.id !== 'original' ? lead?.theme : null)
  const teams = freeTeams(state)
  const teamId = choice.teamId ?? teams[0]?.id
  const size = choice.size ?? (type.quick ? lead?.size : null)

  const steps = []
  if (types.length > 1) steps.push('type')
  if (type.source) steps.push('source')
  if (type.id === 'original' || type.id === 'spinoff') steps.push('genre')
  if (type.id === 'original') steps.push('theme')
  steps.push('platform')
  if (!type.quick) steps.push('size')
  if (!type.quick && ['medio', 'grande', 'aaa'].includes(choice.size)) steps.push('funding')
  if (teams.length > 1) steps.push('team')
  if (!type.quick) steps.push('hook')
  steps.push('final')
  const done = {
    type: choice.type !== undefined,
    source: Boolean(choice.sources?.length && choice.sourcesDone),
    genre: Boolean(choice.genre),
    theme: Boolean(choice.theme),
    platform: Boolean(choice.platforms?.length && choice.platformsDone),
    size: Boolean(choice.size),
    funding: choice.publisher !== undefined,
    team: Boolean(choice.teamId),
    hook: Boolean(choice.hook),
    final: false,
  }
  const current = steps.find(step => !done[step]) ?? 'final'

  useEffect(() => {
    if (current === 'hook' && !hooks) {
      const pool = HOOKS.filter(hook => (hook.minYear ?? 0) <= state.year && (hook.maxYear ?? 9999) >= state.year)
      const fitting = pool.filter(hook => hook.genres?.includes(genreId))
      const first = fitting.length ? sample(fitting, 1) : []
      const rest = sample(pool.filter(hook => !first.includes(hook)), 3 - first.length)
      setHooks(sample([...first, ...rest], 3))
    }
    if (current === 'final' && !choice.title) setChoice(c => ({ ...c, title: suggestTitle() }))
  }, [current])

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [current])

  function suggestTitle() {
    if (type.id === 'sequel' && lead) return sequelTitle(lead.title, (lead.seq ?? 1) + 1, Math.random, { genre: lead.genre, theme: lead.theme })
    if (type.id === 'spinoff' && lead && genreId) return spinoffTitle(lead.title, genreId, Math.random, { theme: themeId, year: state.year })
    if (type.id === 'remake' && lead) return remakeTitle(lead.title)
    if (type.id === 'remaster' && lead) return remasterTitle(lead.title)
    if (type.id === 'port' && lead) return lead.title
    if (type.id === 'collection') {
      const sources = (choice.sources ?? []).map(id => state.games.find(game => game.id === id)).filter(Boolean)
      return collectionTitle(sources, state.studio.name)
    }
    return generateTitle(genreId, themeId, Math.random, state.year)
  }

  const set = patch => {
    sfx.select()
    vibrate(8)
    setChoice(c => ({ ...c, ...patch }))
  }
  const reopen = step => {
    sfx.back()
    const order = steps.indexOf(step)
    const keepKeys = { type: ['type'], source: ['sources', 'sourcesDone'], genre: ['genre', 'genre2'], theme: ['theme'], platform: ['platforms', 'platformsDone'], size: ['size'], funding: ['publisher'], team: ['teamId'], hook: ['hook', 'accessory'] }
    const keep = {}
    for (const s of steps.slice(0, order)) for (const key of keepKeys[s] ?? []) keep[key] = choice[key]
    if (order <= steps.indexOf('hook')) setHooks(null)
    if (step === 'funding' || order < steps.indexOf('funding')) setPitched({})
    setChoice(keep)
  }

  const fullChoice = { ...choice, type: type.id, genre: genreId, theme: themeId, size, teamId }
  const cost = choice.platforms?.length && size ? projectCost(state, fullChoice) : null
  const valid = cost && choice.title?.trim() && validChoice(state, { ...fullChoice, title: choice.title })
  const trend = state.market.trend

  const chipFor = step => {
    if (step === 'type') return { icon: type.icon, label: type.label }
    if (step === 'source') return { icon: 'cartridge', label: choice.sources.length > 1 ? `${choice.sources.length} jogos` : lead?.title }
    if (step === 'genre') return { icon: genreById(genreId)?.icon, label: [genreById(genreId)?.label, genreById(choice.genre2)?.label].filter(Boolean).join(' + ') }
    if (step === 'theme') return { icon: themeById(themeId)?.icon, label: themeById(themeId)?.label }
    if (step === 'platform') return { icon: 'gamepad', label: choice.platforms.map(id => platformById(id)?.label).join(' + ') }
    if (step === 'size') return { icon: 'cube', label: SIZES.find(s => s.id === choice.size)?.label }
    if (step === 'funding') return { icon: 'handshake', label: choice.publisher ? PUBLISHERS.find(p => p.id === choice.publisher)?.name : 'Por conta' }
    if (step === 'team') return { icon: 'team', label: state.teams.find(team => team.id === choice.teamId)?.name }
    if (step === 'hook') return { icon: HOOKS.find(h => h.id === choice.hook)?.icon, label: HOOKS.find(h => h.id === choice.hook)?.label }
    return null
  }

  const start = () => {
    if (!valid || state.money < cost.total) return
    sfx.fanfare()
    vibrate([20, 30, 20])
    dispatch({ type: 'START_GAME', choice: { ...fullChoice, title: choice.title.trim() } })
    onClose()
  }

  const STEP_LABEL = { type: 'O que vamos fazer?', source: type.source === 'many' ? 'Quais jogos?' : type.source === 'franchise' ? 'Qual série?' : 'Qual jogo?', genre: 'Gênero', theme: 'Tema', platform: 'Plataforma', size: 'Tamanho', funding: 'Quem paga?', team: 'Qual equipe?', hook: 'Promessa da capa', final: 'Cartucho pronto' }
  const sourceList = type.source === 'franchise' ? eligible[type.id] : type.source === 'many' ? eligible.collection : eligible[type.id] ?? []
  const platformList = availablePlatforms(t).filter(platform => allowsPlatform(state, platform) && !(type.id === 'port' && platform.id === lead?.platform))
  const accessories = choice.platforms?.length ? ACCESSORIES.filter(item => item.from <= state.year && item.to >= state.year && choice.platforms.some(id => item.platforms.includes(id))) : []

  return (
    <div className="sheet-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
      <section className="sheet create" aria-label="Novo jogo">
        <header className="sheet-head">
          <div className="crumbs">
            {steps.filter(step => done[step]).map(step => {
              const chip = chipFor(step)
              return (
                <button key={step} type="button" className="crumb" onClick={() => reopen(step)} title="Trocar">
                  <Icon name={chip.icon} size={14} stroke={2.4} />{chip.label}
                </button>
              )
            })}
            {!steps.some(step => done[step]) && <span className="crumb-ghost">Novo projeto</span>}
          </div>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => { sfx.back(); onClose() }}><Icon name="close" size={20} /></button>
        </header>

        <div className="sheet-scroll" ref={scroller}>
          <div key={current} className="step">
            <div className="step-label">
              <span className="step-num">{steps.indexOf(current) + 1}</span>{STEP_LABEL[current]}
              {current === 'genre' && (
                <button type="button" className={`toggle-chip ${hybrid ? 'on' : ''}`} onClick={() => { sfx.click(); setHybrid(h => !h); setChoice(c => ({ ...c, genre: undefined, genre2: undefined })) }}>
                  <Icon name="puzzle" size={13} stroke={2.6} />Híbrido
                </button>
              )}
              {current === 'platform' && type.id !== 'port' && (
                <button type="button" className={`toggle-chip ${multi ? 'on' : ''}`} onClick={() => { sfx.click(); setMulti(m => !m); setChoice(c => ({ ...c, platforms: [] })) }}>
                  <Icon name="cards" size={13} stroke={2.6} />Multiplataforma
                </button>
              )}
            </div>

            {current === 'type' && (
              <div className="tiles">
                {types.map(item => (
                  <Tile key={item.id} onClick={() => set({ type: item.id, sources: undefined, sourcesDone: false })}>
                    <Icon name={item.icon} size={30} />
                    <b>{item.label}</b>
                    {item.quick && <small><Icon name="clock" size={11} stroke={2.6} />rápido</small>}
                  </Tile>
                ))}
              </div>
            )}

            {current === 'source' && (
              <>
                <div className="tiles">
                  {sourceList.map(game => {
                    const picked = choice.sources?.includes(game.id)
                    return (
                      <Tile key={game.id} className="tile-seq" selected={picked} onClick={() => {
                        if (type.source === 'many') {
                          sfx.click()
                          setChoice(c => {
                            const list = c.sources ?? []
                            return { ...c, sources: list.includes(game.id) ? list.filter(id => id !== game.id) : list.length >= 4 ? list : [...list, game.id] }
                          })
                        } else set({ sources: [game.id], sourcesDone: true })
                      }}>
                        <Cover game={game} width={52} />
                        <b>{game.title}</b>
                        <small style={{ color: scoreColor(game.score) }}>{fmtScore(game.score)}</small>
                      </Tile>
                    )
                  })}
                </div>
                {type.source === 'many' && (
                  <button type="button" className="btn btn-tomato step-confirm" disabled={(choice.sources?.length ?? 0) < 2} onClick={() => set({ sourcesDone: true })}>
                    Continuar <b>{choice.sources?.length ?? 0}/4</b>
                  </button>
                )}
              </>
            )}

            {current === 'genre' && (
              <div className="tiles">
                {unlockedGenres(state.year, state.techs).map(item => {
                  return (
                    <Tile key={item.id} selected={choice.pendingGenre === item.id} onClick={() => {
                      if (!hybrid) return set({ genre: item.id, genre2: undefined })
                      if (!choice.pendingGenre) { sfx.click(); return setChoice(c => ({ ...c, pendingGenre: item.id })) }
                      if (choice.pendingGenre === item.id) return setChoice(c => ({ ...c, pendingGenre: undefined }))
                      return set({ genre: choice.pendingGenre, genre2: item.id, pendingGenre: undefined })
                    }}>
                      {trend.genre === item.id && <span className="hot"><Icon name="fire" size={12} stroke={2.6} /></span>}
                      {brief?.genre === item.id && <span className="brief-tag">encomenda</span>}
                      <Icon name={item.icon} size={30} />
                      <b>{item.label}</b>
                      <GenreBars w={item.w} />
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'theme' && (
              <div className="tiles">
                {unlockedThemes(state.year).map(item => {
                  const known = state.combos[`${genreId}:${item.id}`]
                  const blocked = comboBlocked(state, genreId, item.id)
                  return (
                    <Tile key={item.id} disabled={blocked} onClick={() => set({ theme: item.id })}>
                      {trend.theme === item.id && <span className="hot"><Icon name="fire" size={12} stroke={2.6} /></span>}
                      {brief?.theme === item.id && <span className="brief-tag">encomenda</span>}
                      <Icon name={item.icon} size={30} />
                      <b>{item.label}</b>
                      <span className={`stars stars-${known ?? 'x'}`} title={known !== undefined ? COMBO_LABEL[known] : 'Combo desconhecido'}>{blocked ? 'feito' : known !== undefined ? STARS[known] : '?'}</span>
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'platform' && (
              <>
                <div className="tiles tiles-wide">
                  {platformList.map(item => {
                    const fit = platformFit(item, genreId)
                    const sizeNow = platformSize(item, t)
                    const fee = state.kits.includes(item.id) ? 0 : projectCost(state, { size: 'micro', platform: item.id }).kit
                    const picked = choice.platforms?.includes(item.id)
                    return (
                      <Tile key={item.id} selected={picked} className="tile-plat" style={{ '--pc': item.color }} onClick={() => {
                        if (!multi) return set({ platforms: [item.id], platformsDone: true })
                        sfx.click()
                        return setChoice(c => {
                          const list = c.platforms ?? []
                          return { ...c, platforms: list.includes(item.id) ? list.filter(id => id !== item.id) : list.length >= 3 ? list : [...list, item.id] }
                        })
                      }}>
                        <span className="plat-stripe" />
                        {picked && multi && <span className="plat-order">{choice.platforms.indexOf(item.id) + 1}</span>}
                        <b>{item.label}</b>
                        <span className="plat-size"><i style={{ width: `${Math.min(100, sizeNow / 4.5 * 100)}%` }} /></span>
                        <span className="plat-row">
                          <span className={`fit fit-${fit}`}><Icon name={fit > 0 ? 'heart' : fit < 0 ? 'thumbsdown' : 'minus'} size={14} stroke={2.6} /></span>
                          {fee > 0 ? <small className="kit">kit {fmtMoney(fee)}</small> : <small className="kit kit-free">liberado</small>}
                        </span>
                      </Tile>
                    )
                  })}
                  {!platformList.length && <p className="empty">Nenhuma plataforma do seu modo à venda agora.</p>}
                </div>
                {multi && (
                  <button type="button" className="btn btn-tomato step-confirm" disabled={!choice.platforms?.length} onClick={() => set({ platformsDone: true })}>
                    Continuar <b>{choice.platforms?.length ?? 0}/3</b>
                  </button>
                )}
              </>
            )}

            {current === 'size' && (
              <div className="tiles tiles-wide">
                {SIZES.filter(item => allowsSize(state, item.id)).map(item => {
                  const locked = item.office > state.office
                  const price = projectCost(state, { ...fullChoice, size: item.id, hook: null, publisher: null })
                  const crew = teamMembers(state, teamId).length
                  const short = crew < Math.ceil(item.team)
                  return (
                    <Tile key={item.id} className="tile-size" disabled={locked} onClick={() => set({ size: item.id })}>
                      <span className="size-blocks" aria-hidden="true">{Array.from({ length: SIZES.indexOf(item) + 1 }, (_, i) => <i key={i} />)}</span>
                      <b>{item.label}</b>
                      {locked ? (
                        <small className="lock"><Icon name="lock" size={12} stroke={2.6} />{OFFICES[item.office].label}</small>
                      ) : (
                        <>
                          <small><Icon name="clock" size={12} stroke={2.6} />{Math.round(item.weeks * type.weeks)} sem</small>
                          <small className={state.money < price.total ? 'neg' : ''}>{fmtMoney(price.total)}</small>
                          {short && <small className="warn"><Icon name="users" size={12} stroke={2.6} />{Math.ceil(item.team)}+</small>}
                        </>
                      )}
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'funding' && (
              <div className="tiles tiles-wide">
                <Tile onClick={() => set({ publisher: null })}>
                  <Icon name="cash" size={28} />
                  <b>Por conta</b>
                  <small>100% da receita</small>
                </Tile>
                {PUBLISHERS.filter(pub => pub.from <= state.year && pub.to >= state.year && (!pub.indie || ['medio'].includes(choice.size))).slice(0, 5).map(pub => {
                  const chance = pitchChance(state, pub, choice.size)
                  const refused = pitched[pub.id] === 'no'
                  return (
                    <Tile key={pub.id} disabled={refused} className="tile-pub" onClick={() => {
                      const yes = Math.random() < chance
                      setPitched(p => ({ ...p, [pub.id]: yes ? 'yes' : 'no' }))
                      if (yes) set({ publisher: pub.id })
                      else { sfx.sad(); vibrate(40) }
                    }}>
                      <b>{pub.name}</b>
                      <small><Icon name="cash" size={11} stroke={2.6} />paga {Math.round(pub.pays * 100)}%</small>
                      <small><Icon name="chart" size={11} stroke={2.6} />leva {Math.round(pub.cut * 100)}%</small>
                      {refused ? <span className="pub-no">RECUSOU</span> : <span className="odds"><Icon name="dice" size={12} stroke={2.6} />{Math.round(chance * 100)}%</span>}
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'team' && (
              <div className="tiles tiles-wide">
                {teams.map(team => (
                  <Tile key={team.id} onClick={() => set({ teamId: team.id })}>
                    <Icon name={team.remote ? 'building' : 'team'} size={28} />
                    <b>{team.name}</b>
                    <small><Icon name="users" size={11} stroke={2.6} />{teamMembers(state, team.id).length}</small>
                  </Tile>
                ))}
              </div>
            )}

            {current === 'hook' && hooks && (
              <div className="tiles tiles-wide">
                {hooks.map(hook => (
                  <Tile key={hook.id} className="tile-hook" onClick={() => set({ hook: hook.id, accessory: null })}>
                    <span className="sticker"><Icon name={hook.icon} size={26} /></span>
                    <b>{hook.label}</b>
                    <Arrows list={modsArrows(hook.mods, hook.genres, genreId)} />
                    {hook.genres?.includes(genreId) && <span className="fits"><Icon name="star" size={11} stroke={2.6} />combina</span>}
                  </Tile>
                ))}
                {accessories.slice(0, 1).map(item => (
                  <Tile key={item.id} className="tile-hook tile-accessory" onClick={() => set({ hook: hooks[0].id, accessory: item.id })}>
                    <span className="sticker sticker-acc"><Icon name={item.icon} size={26} /></span>
                    <b>{item.label}</b>
                    <Arrows list={modsArrows(item.mods, item.genres, genreId)} />
                    <span className="fits fits-acc"><Icon name="gamepad" size={11} stroke={2.6} />periférico</span>
                  </Tile>
                ))}
              </div>
            )}

            {current === 'final' && (
              <div className="final">
                <div className="final-cover">
                  <Cover game={{ id: 'preview', title: choice.title ?? '…', genre: genreId, theme: themeId, platform: choice.platforms?.[0] }} width={150} />
                  {choice.hook && !type.quick && (
                    <span className="final-sticker">
                      <Icon name={choice.accessory ? ACCESSORIES.find(a => a.id === choice.accessory)?.icon : HOOKS.find(h => h.id === choice.hook)?.icon} size={18} />
                      {choice.accessory ? ACCESSORIES.find(a => a.id === choice.accessory)?.label : HOOKS.find(h => h.id === choice.hook)?.label}
                    </span>
                  )}
                </div>
                <div className="final-side">
                  <label className="title-field">
                    <input value={choice.title ?? ''} maxLength={34} onChange={event => setChoice(c => ({ ...c, title: event.target.value }))} aria-label="Título" />
                    <button type="button" className="icon-btn dice" aria-label="Sortear outro título" title="Sortear" onClick={() => { sfx.click(); setChoice(c => ({ ...c, title: suggestTitle() })) }}>
                      <Icon name="dice" size={20} />
                    </button>
                  </label>
                  {cost && (
                    <div className="bill">
                      <span>Produção</span><b>{fmtMoney(cost.base)}</b>
                      {cost.funded > 0 && <><span>Editora paga</span><b className="pos">−{fmtMoney(cost.funded)}</b></>}
                      {cost.kit > 0 && <><span>Kits</span><b>{fmtMoney(cost.kit)}</b></>}
                      <span className="bill-total">Total</span><b className={`bill-total ${state.money < cost.total ? 'neg' : ''}`}>{fmtMoney(cost.total)}</b>
                    </div>
                  )}
                  <button type="button" className="btn btn-big btn-tomato" disabled={!valid || state.money < (cost?.total ?? Infinity)} onClick={start}>
                    <Icon name="play" size={20} /> Começar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
