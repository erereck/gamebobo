import { useEffect, useMemo, useRef, useState } from 'react'
import { dispatch, useGame } from '../../app/store.js'
import { sfx, vibrate } from '../../app/audio.js'
import { Icon } from '../../ui/Icon.jsx'
import { Cover } from '../../ui/Cover.jsx'
import { fmtMoney } from '../../ui/format.js'
import { COMBO_LABEL, genreById, themeById, unlockedGenres, unlockedThemes } from '../../game/data/genres.js'
import { availablePlatforms, platformFit, platformSize } from '../../game/data/platforms.js'
import { OFFICES, SIZES } from '../../game/data/economy.js'
import { PILLARS } from '../../game/data/staff.js'
import { HOOKS } from '../../game/data/content/hooks.js'
import { projectCost } from '../../game/engine/project.js'
import { generateTitle, sequelTitle } from '../../game/engine/titles.js'
import { yearFloat } from '../../game/engine/state.js'
import { sample } from '../../game/engine/rng.js'

const STARS = { 3: '★★★', 2: '★★', 1: '★', 0: '✕' }

function GenreBars({ w }) {
  return (
    <span className="gbars" aria-hidden="true">
      {PILLARS.map(p => <i key={p.id} style={{ height: `${Math.round(w[p.id] * 100 / .5)}%`, background: p.color }} />)}
    </span>
  )
}

function hookArrows(hook, genre) {
  const out = []
  const m = hook.mods ?? {}
  for (const p of PILLARS) if (m[p.id] && m[p.id] !== 1) out.push({ icon: p.icon, up: m[p.id] > 1, big: Math.abs(m[p.id] - 1) >= .2 })
  if (m.bugs && m.bugs !== 1) out.push({ icon: 'bug', up: m.bugs > 1, bad: m.bugs > 1, big: Math.abs(m.bugs - 1) >= .25 })
  if (m.hype) out.push({ icon: 'megaphone', up: true, big: m.hype >= 12 })
  if (m.costMult && m.costMult !== 1) out.push({ icon: 'cash', up: m.costMult > 1, bad: m.costMult > 1, big: Math.abs(m.costMult - 1) >= .2 })
  if (m.weeks) out.push({ icon: 'clock', up: m.weeks > 0, bad: m.weeks > 0, big: Math.abs(m.weeks) >= 3 })
  if (m.sales && m.sales !== 1) out.push({ icon: 'chart', up: m.sales > 1, big: m.sales >= 1.15 })
  if (m.score && hook.genres?.includes(genre)) out.push({ icon: 'star', up: true, big: m.score >= 3 })
  return out
}

function Tile({ selected, disabled, onClick, children, className = '', style }) {
  return (
    <button type="button" className={`tile ${selected ? 'on' : ''} ${className}`} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

export function NewGameFlow({ onClose }) {
  const state = useGame()
  const [choice, setChoice] = useState({})
  const [hooks, setHooks] = useState(null)
  const scroller = useRef(null)
  const t = yearFloat(state)

  const sequelOptions = useMemo(() => {
    const byFranchise = new Map()
    for (const game of state.games) byFranchise.set(game.franchise, game)
    return [...byFranchise.values()].filter(game => game.score >= 6.5 && (state.year * 48 + state.week) - (game.year * 48 + game.week) >= 20).slice(-4)
  }, [state.games, state.year, state.week])

  const prev = choice.sequelOf ? state.games.find(game => game.id === choice.sequelOf) : null
  const genreId = prev?.genre ?? choice.genre
  const themeId = prev?.theme ?? choice.theme

  const steps = []
  if (sequelOptions.length) steps.push('type')
  if (!prev) steps.push('genre', 'theme')
  steps.push('platform', 'size', 'hook', 'final')
  const done = {
    type: choice.type !== undefined,
    genre: Boolean(choice.genre),
    theme: Boolean(choice.theme),
    platform: Boolean(choice.platform),
    size: Boolean(choice.size),
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
    if (current === 'final' && !choice.title) {
      setChoice(c => ({ ...c, title: prev ? sequelTitle(prev.title, (prev.seq ?? 1) + 1) : generateTitle(genreId, themeId) }))
    }
  }, [current])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: 0 })
  }, [current])

  const set = patch => {
    sfx.select()
    vibrate(8)
    setChoice(c => ({ ...c, ...patch }))
  }
  const reopen = step => {
    sfx.back()
    const order = steps.indexOf(step)
    const keep = {}
    for (const s of steps.slice(0, order)) {
      if (s === 'type') Object.assign(keep, { type: choice.type, sequelOf: choice.sequelOf })
      else if (s !== 'final') keep[s] = choice[s]
    }
    if (order <= steps.indexOf('hook')) setHooks(null)
    setChoice(keep)
  }

  const genre = genreById(genreId)
  const theme = themeById(themeId)
  const cost = choice.size && choice.platform ? projectCost(state, { size: choice.size, platform: choice.platform, hook: choice.hook }) : null
  const staffCount = state.staff.length
  const trend = state.market.trend

  const chipFor = step => {
    if (step === 'type') return { icon: prev ? 'refresh' : 'sparkle', label: prev ? `Sequência` : 'Novo IP' }
    if (step === 'genre') return { icon: genre?.icon, label: genre?.label }
    if (step === 'theme') return { icon: theme?.icon, label: theme?.label }
    if (step === 'platform') return { icon: 'gamepad', label: availablePlatforms(t).find(p => p.id === choice.platform)?.label }
    if (step === 'size') return { icon: 'cube', label: SIZES.find(s => s.id === choice.size)?.label }
    if (step === 'hook') return { icon: HOOKS.find(h => h.id === choice.hook)?.icon, label: HOOKS.find(h => h.id === choice.hook)?.label }
    return null
  }

  const start = () => {
    if (!cost || state.money < cost.total) return
    sfx.fanfare()
    vibrate([20, 30, 20])
    dispatch({ type: 'START_GAME', choice: { ...choice, genre: genreId, theme: themeId } })
    onClose()
  }

  const STEP_LABEL = { type: 'O que vamos fazer?', genre: 'Gênero', theme: 'Tema', platform: 'Plataforma', size: 'Tamanho', hook: 'Promessa da capa', final: 'Cartucho pronto' }

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
            {!steps.some(step => done[step]) && <span className="crumb-ghost">Novo jogo</span>}
          </div>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={() => { sfx.back(); onClose() }}><Icon name="close" size={20} /></button>
        </header>

        <div className="sheet-scroll" ref={scroller}>
          <div key={current} className="step">
            <div className="step-label"><span className="step-num">{steps.indexOf(current) + 1}</span>{STEP_LABEL[current]}</div>

            {current === 'type' && (
              <div className="tiles">
                <Tile onClick={() => set({ type: 'new', sequelOf: null })}>
                  <Icon name="sparkle" size={30} />
                  <b>Novo IP</b>
                </Tile>
                {sequelOptions.map(game => (
                  <Tile key={game.id} className="tile-seq" onClick={() => set({ type: 'sequel', sequelOf: game.id })}>
                    <Cover game={game} width={52} />
                    <b>{game.title} {(game.seq ?? 1) + 1}</b>
                    <small>{game.score.toFixed(1)}★</small>
                  </Tile>
                ))}
              </div>
            )}

            {current === 'genre' && (
              <div className="tiles">
                {unlockedGenres(state.year, state.techs).map(item => (
                  <Tile key={item.id} onClick={() => set({ genre: item.id })}>
                    {trend.genre === item.id && <span className="hot"><Icon name="fire" size={12} stroke={2.6} /></span>}
                    <Icon name={item.icon} size={30} />
                    <b>{item.label}</b>
                    <GenreBars w={item.w} />
                  </Tile>
                ))}
              </div>
            )}

            {current === 'theme' && (
              <div className="tiles">
                {unlockedThemes(state.year).map(item => {
                  const known = state.combos[`${genreId}:${item.id}`]
                  return (
                    <Tile key={item.id} onClick={() => set({ theme: item.id })}>
                      {trend.theme === item.id && <span className="hot"><Icon name="fire" size={12} stroke={2.6} /></span>}
                      <Icon name={item.icon} size={30} />
                      <b>{item.label}</b>
                      <span className={`stars stars-${known ?? 'x'}`} title={known !== undefined ? COMBO_LABEL[known] : 'Combo desconhecido'}>{known !== undefined ? STARS[known] : '?'}</span>
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'platform' && (
              <div className="tiles tiles-wide">
                {availablePlatforms(t).map(item => {
                  const fit = platformFit(item, genreId)
                  const size = platformSize(item, t)
                  const fee = state.kits.includes(item.id) ? 0 : projectCost(state, { size: 'micro', platform: item.id }).kit
                  return (
                    <Tile key={item.id} className="tile-plat" style={{ '--pc': item.color }} onClick={() => set({ platform: item.id })}>
                      <span className="plat-stripe" />
                      <b>{item.label}</b>
                      <span className="plat-size"><i style={{ width: `${Math.min(100, size / 4.5 * 100)}%` }} /></span>
                      <span className="plat-row">
                        <span className={`fit fit-${fit}`}><Icon name={fit > 0 ? 'heart' : fit < 0 ? 'thumbsdown' : 'minus'} size={14} stroke={2.6} /></span>
                        {fee > 0 ? <small className="kit">kit {fmtMoney(fee)}</small> : <small className="kit kit-free">liberado</small>}
                      </span>
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'size' && (
              <div className="tiles tiles-wide">
                {SIZES.map(item => {
                  const locked = item.office > state.office
                  const price = projectCost(state, { size: item.id, platform: choice.platform, hook: null })
                  const short = staffCount < Math.ceil(item.team)
                  return (
                    <Tile key={item.id} className="tile-size" disabled={locked} onClick={() => set({ size: item.id })}>
                      <span className="size-blocks" aria-hidden="true">{Array.from({ length: SIZES.indexOf(item) + 1 }, (_, i) => <i key={i} />)}</span>
                      <b>{item.label}</b>
                      {locked ? (
                        <small className="lock"><Icon name="lock" size={12} stroke={2.6} />{OFFICES[item.office].label}</small>
                      ) : (
                        <>
                          <small><Icon name="clock" size={12} stroke={2.6} />{item.weeks} sem</small>
                          <small className={state.money < price.total ? 'neg' : ''}>{fmtMoney(price.total)}</small>
                          {short && <small className="warn"><Icon name="users" size={12} stroke={2.6} />{Math.ceil(item.team)}+</small>}
                        </>
                      )}
                    </Tile>
                  )
                })}
              </div>
            )}

            {current === 'hook' && hooks && (
              <div className="tiles tiles-wide">
                {hooks.map(hook => (
                  <Tile key={hook.id} className="tile-hook" onClick={() => set({ hook: hook.id })}>
                    <span className="sticker"><Icon name={hook.icon} size={26} /></span>
                    <b>{hook.label}</b>
                    <span className="arrows">
                      {hookArrows(hook, genreId).map((a, i) => (
                        <span key={i} className={`arr ${(a.bad ? !a.up : a.up) ? 'good' : 'bad'}`}><Icon name={a.icon} size={12} stroke={2.6} />{a.up ? (a.big ? '▲▲' : '▲') : (a.big ? '▼▼' : '▼')}</span>
                      ))}
                    </span>
                    {hook.genres?.includes(genreId) && <span className="fits"><Icon name="star" size={11} stroke={2.6} />combina</span>}
                  </Tile>
                ))}
              </div>
            )}

            {current === 'final' && cost && (
              <div className="final">
                <div className="final-cover">
                  <Cover game={{ id: 'preview', title: choice.title ?? '…', genre: genreId, theme: themeId, platform: choice.platform }} width={150} />
                  <span className="final-sticker"><Icon name={HOOKS.find(h => h.id === choice.hook)?.icon} size={18} />{HOOKS.find(h => h.id === choice.hook)?.label}</span>
                </div>
                <div className="final-side">
                  <label className="title-field">
                    <input value={choice.title ?? ''} maxLength={30} onChange={event => setChoice(c => ({ ...c, title: event.target.value }))} aria-label="Título" />
                    <button type="button" className="icon-btn dice" aria-label="Sortear outro título" title="Sortear" onClick={() => { sfx.click(); setChoice(c => ({ ...c, title: prev ? sequelTitle(prev.title, (prev.seq ?? 1) + 1) : generateTitle(genreId, themeId) })) }}>
                      <Icon name="dice" size={20} />
                    </button>
                  </label>
                  <div className="bill">
                    <span>Produção</span><b>{fmtMoney(cost.base)}</b>
                    {cost.kit > 0 && <><span>Kit</span><b>{fmtMoney(cost.kit)}</b></>}
                    <span className="bill-total">Total</span><b className={`bill-total ${state.money < cost.total ? 'neg' : ''}`}>{fmtMoney(cost.total)}</b>
                  </div>
                  <button type="button" className="btn btn-big btn-tomato" disabled={state.money < cost.total || !choice.title?.trim()} onClick={start}>
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
