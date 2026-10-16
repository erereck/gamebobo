import { OUTLETS, QUOTES, GENRE_QUOTES } from '../data/content/critics.js'
import { COMMENTS, HANDLES, MEDIUMS } from '../data/content/comments.js'
import { PACES, PHASES, PHASE_FOCUS, sizeById, eraBar } from '../data/economy.js'
import { ACCESSORIES, PUBLISHERS, SHOCKS, projectTypeById } from '../data/modes.js'
import { platformById } from '../data/platforms.js'
import { genreById } from '../data/genres.js'
import { traitById } from '../data/staff.js'
import { decorTotals, genMultiplier, levelUp, personOutput, teamEfficiency, techBugMultiplier, techSalesMultiplier, xpForLevel, PILLAR_IDS } from './staff.js'
import { averageScore, criticScores, expectedPoints, hookById, scoreBreakdown, totalPoints, volumeScore } from './quality.js'
import { lifetimeSales, tailWeeks } from './sales.js'
import { freelaProgress } from './freelas.js'
import { checkAchievements, registerCombo, updateLegacy } from './progress.js'
import { absWeek, fx, log, scaled, toast, yearFloat } from './state.js'
import { applyEffects } from './effects.js'
import { modeCost, modeOf, modeQuality, modeSpeed, modeXp } from './modes.js'
import { MAIN_TEAM, teamMembers, teamOf } from './teams.js'
import { clamp, makeId, pick, sample } from './rng.js'

export const accessoryById = id => ACCESSORIES.find(item => item.id === id) ?? null
export const publisherById = id => PUBLISHERS.find(item => item.id === id) ?? null

export function phaseBounds(project) {
  const first = Math.max(1, Math.round(project.baseWeeks * PHASES[0].share))
  const second = Math.max(first + 1, Math.round(project.baseWeeks * (PHASES[0].share + PHASES[1].share)))
  return [first, second, project.totalWeeks]
}

export const phaseAt = (project, week = project.week) => {
  const [a, b] = phaseBounds(project)
  return week < a ? 0 : week < b ? 1 : 2
}

export const projectById = (state, id) => state.projects.find(project => project.id === id) ?? null
export const gameProjects = state => state.projects.filter(project => project.kind === 'game')

// Mercado do momento: crises e febres reais mexem nas vendas.
export function activeShock(state) {
  const tw = absWeek(state)
  return SHOCKS.find(shock => {
    const start = (shock.start[0] - 1980) * 48 + shock.start[1] * 4
    return tw >= start && tw < start + shock.weeks
  }) ?? null
}

export function shockMultiplier(state, platformIds, genre) {
  const shock = activeShock(state)
  if (!shock) return 1
  const types = platformIds.map(id => platformById(id)?.type).map(type => (type === 'portatil' ? 'console' : type))
  const platformMult = types.length ? types.reduce((sum, type) => sum + (shock.mods[type] ?? 1), 0) / types.length : 1
  return platformMult * (shock.mods[genre] ?? 1) * (shock.mods.global ?? 1)
}

// Custo de um projeto: tamanho × tipo × promessa × modo, mais kits e delegação de plataformas extras.
export function projectCost(state, choice) {
  const type = projectTypeById(choice.type)
  const platforms = choice.platforms?.length ? choice.platforms : [choice.platform].filter(Boolean)
  const sizeId = choice.size ?? sourceSize(state, choice) ?? 'micro'
  const sizeInfo = sizeById(sizeId)
  const hookInfo = hookById(choice.hook)
  const accessory = accessoryById(choice.accessory)
  const extras = Math.max(0, platforms.length - 1)
  const kits = platforms.filter(id => !state.kits.includes(id)).reduce((sum, id) => sum + (platformById(id)?.fee ?? 0), 0)
  const mult = type.cost * (hookInfo?.mods?.costMult ?? 1) * (accessory?.mods?.costMult ?? 1) * (1 + extras * .25) * modeCost(state)
  const base = scaled(state, sizeInfo.cost * mult)
  const funded = choice.publisher ? Math.round(base * (publisherById(choice.publisher)?.pays ?? 0)) : 0
  const kit = scaled(state, kits)
  return { base, kit, funded, total: base - funded + kit }
}

function sourceGames(state, choice) {
  return (choice.sources ?? []).map(id => state.games.find(game => game.id === id)).filter(Boolean)
}

function sourceSize(state, choice) {
  const sources = sourceGames(state, choice)
  if (!sources.length) return null
  const order = ['micro', 'pequeno', 'medio', 'grande', 'aaa']
  return sources.reduce((best, game) => (order.indexOf(game.size) > order.indexOf(best) ? game.size : best), sources[0].size)
}

export function startGameProject(state, choice) {
  const type = projectTypeById(choice.type)
  const sources = sourceGames(state, choice)
  const lead = sources[0] ?? null
  const size = sizeById(choice.size ?? sourceSize(state, choice) ?? 'micro')
  const hook = type.quick ? null : hookById(choice.hook)
  const accessory = accessoryById(choice.accessory)
  const platforms = choice.platforms?.length ? choice.platforms : [choice.platform]
  const cost = projectCost(state, { ...choice, platforms, size: size.id })
  state.money -= cost.total
  for (const id of platforms) if (!state.kits.includes(id)) state.kits.push(id)
  const weeks = Math.max(type.quick ? 3 : 4, Math.round(size.weeks * type.weeks) + (hook?.mods?.weeks ?? 0) + (accessory?.mods?.weeks ?? 0))
  const keepsGenre = ['sequel', 'remake', 'remaster', 'port'].includes(type.id)
  const genre = keepsGenre && lead ? lead.genre : choice.genre ?? lead?.genre
  const theme = ['sequel', 'spinoff', 'remake', 'remaster', 'port'].includes(type.id) && lead ? lead.theme : choice.theme ?? lead?.theme
  const franchise = lead && ['sequel', 'spinoff', 'remake', 'remaster', 'port'].includes(type.id) ? lead.franchise : makeId('fr')
  const chain = state.games.filter(game => game.franchise === franchise)
  const inherited = type.id === 'sequel' || type.id === 'spinoff'
    ? Math.min(30, chain.reduce((sum, game) => sum + game.score, 0) / Math.max(1, chain.length) * 3) : 0
  const publisher = publisherById(choice.publisher)
  const project = {
    kind: 'game',
    id: makeId('game'),
    type: type.id,
    title: choice.title,
    genre,
    genre2: type.id === 'original' || type.id === 'spinoff' ? choice.genre2 ?? null : lead?.genre2 ?? null,
    theme,
    platform: platforms[0],
    platforms,
    size: size.id,
    hook: hook?.id ?? null,
    accessory: accessory?.id ?? null,
    publisher: publisher ? { id: publisher.id, name: publisher.name, cut: publisher.cut } : null,
    sources: sources.map(game => game.id),
    teamId: choice.teamId ?? MAIN_TEAM,
    startYear: yearFloat(state),
    week: 0,
    baseWeeks: weeks,
    totalWeeks: weeks,
    focus: { 0: null, 1: null, 2: null },
    pts: { fun: 0, art: 0, sound: 0, idea: 0 },
    bugs: 0,
    fixed: 0,
    hype: clamp((hook?.mods?.hype ?? 0) + (publisher?.hype ?? 0) + inherited + Math.min(20, Math.log10(1 + state.fans) * 3), 0, 100),
    pace: 'normal',
    franchise,
    sequelOf: type.id === 'sequel' ? lead?.id ?? null : null,
    seq: type.id === 'sequel' ? (lead?.seq ?? 1) + 1 : 1,
    contrib: {},
    cost: cost.base + cost.kit,
    labor: 0,
    ready: false,
    speed: 1,
    phaseAsked: type.quick ? { 1: true, 2: true } : { 1: false, 2: false },
  }
  state.projects.push(project)
  if (modeOf(state) === 'franquia' && !state.mode.franchise) state.mode.franchise = { id: franchise, name: choice.title }
  log(state, 'cartridge', `Começou ${choice.title}`)
  fx(state, { type: 'start' })
  return project
}

export function startFreela(state, item, need, teamId = MAIN_TEAM) {
  state.projects.push({
    kind: 'freela',
    id: makeId('freela'),
    title: item.client,
    icon: item.icon,
    teamId,
    week: 0,
    totalWeeks: item.weeks,
    need,
    pts: { fun: 0, art: 0, sound: 0, idea: 0 },
    pay: scaled(state, item.pay),
    rp: item.rp ?? 0,
    pace: 'normal',
    contrib: {},
    speed: 1,
  })
  state.freelas = state.freelas.filter(freela => freela.id !== item.id)
  fx(state, { type: 'start' })
}

function focusMix(project, phase) {
  const focusId = project.focus[phase]
  const list = PHASE_FOCUS[PHASES[phase].id] ?? []
  return list.find(item => item.id === focusId) ?? null
}

// Uma semana de trabalho de cada equipe no seu projeto.
export function workWeek(state) {
  for (const project of [...state.projects]) workProject(state, project)
}

function workProject(state, project) {
  if (project.ready) return
  const pace = PACES[project.pace] ?? PACES.normal
  const isGame = project.kind === 'game'
  const phase = isGame ? phaseAt(project) : 1
  const base = isGame ? PHASES[phase].base : { fun: 1, art: 1, sound: 1, idea: 1 }
  const focus = isGame ? focusMix(project, phase) : null
  const hook = isGame ? hookById(project.hook) : null
  const accessory = isGame ? accessoryById(project.accessory) : null
  const decor = decorTotals(state.decor)
  const bugMult = techBugMultiplier(state.techs) * decor.bugs * pace.bugs * (focus?.bugs ?? 1) * (hook?.mods?.bugs ?? 1)
  const workers = teamMembers(state, project.teamId)
  const efficiency = teamEfficiency(workers.length)
  const mentor = workers.some(other => traitById(other.trait)?.teamXp)
  let teamOut = 0
  for (const person of workers) {
    const trait = traitById(person.trait)
    const out = personOutput(state, person, pace) * efficiency
    teamOut += out
    const weights = {}
    let sum = 0
    for (const key of PILLAR_IDS) {
      const w = (person.skills[key] + 8) ** 1.3 * base[key] * (focus?.mix?.[key] ?? 1)
      weights[key] = w
      sum += w
    }
    const produced = {}
    for (const key of PILLAR_IDS) {
      const gen = genMultiplier(state, key) * (trait?.gen?.[key] ?? 1) * (hook?.mods?.[key] ?? 1) * (accessory?.mods?.[key] ?? 1)
      const value = out * (weights[key] / sum) * gen
      produced[key] = value
      project.pts[key] = (project.pts[key] ?? 0) + value
    }
    project.contrib[person.id] ??= { fun: 0, art: 0, sound: 0, idea: 0 }
    for (const key of PILLAR_IDS) project.contrib[person.id][key] += produced[key]
    const top = PILLAR_IDS.reduce((best, key) => (produced[key] > produced[best] ? key : best), 'fun')
    fx(state, { type: 'work', staffId: person.id, pillar: top, amount: Math.round(out) })
    if (isGame) {
      const newBugs = out * .15 * bugMult * (trait?.bugs ?? 1) * (person.energy < 20 ? 1.3 : 1)
      project.bugs += newBugs
      if (phase === 2) {
        const fixed = Math.min(project.bugs, out * .3 * (focus?.bugFix ?? 1))
        project.bugs -= fixed
        project.fixed += fixed
      }
      if (newBugs > out * .2) fx(state, { type: 'bug', staffId: person.id })
    }
    person.xp += out * (mentor ? 1.25 : 1) * modeXp(state)
  }
  if (isGame) {
    // Equipe mais forte que o tamanho pede termina antes; equipe fraca atrasa.
    const reference = sizeById(project.size).team * eraBar(project.startYear) * 10
    const ratio = workers.length ? teamOut / reference : 0
    project.speed = workers.length ? clamp(1 + (ratio - 1) * .5, .7, 1.45) * modeSpeed(state) : 0
    project.week = Math.min(project.totalWeeks, project.week + project.speed)
    project.hype = Math.max(0, project.hype - .6)
    const nextPhase = phaseAt(project)
    if (nextPhase > 0 && !project.phaseAsked[nextPhase] && project.week < project.totalWeeks) {
      project.phaseAsked[nextPhase] = true
      state.queue.push({ kind: 'phase', id: makeId('q'), phase: nextPhase, projectId: project.id })
    }
    if (project.week >= project.totalWeeks) {
      project.ready = true
      state.queue.push({ kind: 'ready', id: makeId('q'), projectId: project.id })
      fx(state, { type: 'ready' })
    }
  } else {
    project.week += 1
    if (freelaProgress(project) >= 1 || project.week >= project.totalWeeks) finishFreela(state, project)
  }
}

function finishFreela(state, project) {
  const progress = freelaProgress(project)
  const done = progress >= 1
  const pay = Math.round(done ? project.pay * (project.week < project.totalWeeks ? 1.1 : 1) : project.pay * progress ** 2 * .6)
  state.money += pay
  state.rp += done ? project.rp : 0
  if (done) state.stats.freelasDone += 1
  for (const person of teamMembers(state, project.teamId)) person.xp += 6
  toast(state, { kind: done ? 'good' : 'bad', icon: 'briefcase', title: done ? 'Freela entregue' : 'Freela pela metade', chips: [{ key: 'money', value: pay }, ...(done && project.rp ? [{ key: 'rp', value: project.rp }] : [])] })
  log(state, 'briefcase', `${done ? 'Entregou' : 'Entregou mal'} ${project.title}`)
  fx(state, { type: done ? 'cheer' : 'sigh' })
  state.projects = state.projects.filter(item => item !== project)
  checkAchievements(state)
}

function outletsFor(year, random) {
  const active = OUTLETS.filter(outlet => outlet.minYear <= year && outlet.maxYear >= year)
  return sample(active.length >= 4 ? active : OUTLETS, 4, random)
}

function quoteFor(score, genre, random) {
  const genreBank = GENRE_QUOTES[genre]
  if (genreBank && random() < .35) return pick(score >= 7 ? genreBank.high : genreBank.low, random)
  return pick(QUOTES[score] ?? QUOTES[5], random)
}

function commentsFor(year, avg, title, random) {
  const medium = MEDIUMS.find(item => year >= item.minYear && year <= item.maxYear) ?? MEDIUMS.at(-1)
  const band = avg >= 8.5 ? 'great' : avg >= 7 ? 'good' : avg >= 5 ? 'meh' : 'bad'
  const lines = sample(COMMENTS[medium.id]?.[band] ?? [], 3, random)
  const handles = sample(HANDLES[medium.id] ?? ['@alguem'], 3, random)
  return { medium: medium.id, mediumLabel: medium.label, items: lines.map((text, i) => ({ who: handles[i % handles.length], text: text.replaceAll('{game}', title) })) }
}

// Relançamentos (porte, remaster, coletânea) partem da qualidade do original.
function quickQuality(state, project, random) {
  const sources = project.sources.map(id => state.games.find(game => game.id === id)).filter(Boolean)
  const type = projectTypeById(project.type)
  const base = sources.reduce((sum, game) => sum + game.quality, 0) / Math.max(1, sources.length)
  const age = sources.reduce((sum, game) => sum + Math.max(0, state.year - game.year), 0) / Math.max(1, sources.length)
  const expected = expectedPoints(project.size, project.startYear) * type.weeks
  const effort = (volumeScore(totalPoints(project.pts) / Math.max(1, expected)) - 63) * .15
  const bugs = Math.min(10, project.bugs / Math.max(1, totalPoints(project.pts)) * 30)
  const extra = project.type === 'collection' ? (sources.length - 2) * 1.5 : 0
  const ageCost = project.type === 'port' ? age * .35 : project.type === 'remaster' ? age * .1 : 0
  const quality = clamp(base + type.score + effort + extra - ageCost - bugs + (random() - .5) * 5, 10, 97)
  return { quality, parts: { volume: effort * 3 + 50, fit: 0, combo: 0, platform: 0, trend: 0, novelty: 0, hook: 0, sequel: 0, bugs: -bugs, bonus: type.score + extra - ageCost, luck: 0 }, ratio: 1, fit: 1, combo: 1, pfit: 0 }
}

// Lançamento: nota, críticos, vendas previstas, fãs e evolução da equipe.
export function releaseProject(state, projectId, random = Math.random) {
  const project = projectById(state, projectId)
  if (!project) return null
  const year = state.year
  const type = projectTypeById(project.type)
  project.bonusScore = state.buffs.score
  const breakdown = type.quick ? quickQuality(state, project, random) : scoreBreakdown(state, project, random)
  const accessory = accessoryById(project.accessory)
  const accessoryScore = accessory?.genres?.includes(project.genre) ? accessory.mods.score ?? 0 : 0
  const delegation = (project.platforms.length - 1)
  const quality = clamp(modeQuality(state, breakdown.quality + (type.quick ? 0 : type.score) + accessoryScore - delegation), 4, 100)
  const outlets = outletsFor(year, random)
  const scores = criticScores(quality, outlets, random)
  const score = averageScore(scores)
  const expectation = 4 + project.hype / 16
  const letdown = Math.max(0, expectation - score)
  const isNewCombo = type.quick ? false : registerCombo(state, project.genre, project.theme)
  if (project.genre2 && !type.quick) registerCombo(state, project.genre2, project.theme)
  const sources = project.sources.map(id => state.games.find(game => game.id === id)).filter(Boolean)
  const nostalgia = project.type === 'remake' && sources[0]?.score >= 7.5 ? 1.15 : 1
  const collectionReach = project.type === 'collection' ? 1 + (sources.length - 2) * .12 : 1
  const sale = lifetimeSales({
    quality, year: yearFloat(state), t: yearFloat(state), platformIds: project.platforms, sizeId: project.size,
    genre: project.genre, theme: project.theme, fans: state.fans, hype: project.hype, trend: state.market.trend,
    sequel: Boolean(project.sequelOf),
    salesMult: state.buffs.sales * (hookById(project.hook)?.mods?.sales ?? 1) * (accessory?.mods?.sales ?? 1) * (1 - letdown * .06)
      * type.reach * nostalgia * collectionReach * shockMultiplier(state, project.platforms, project.genre),
    techSales: techSalesMultiplier(state.techs),
    noBreakout: type.quick,
  }, random)
  state.buffs = { score: 0, sales: 1 }
  const total = totalPoints(project.pts)
  const share = Object.fromEntries(PILLAR_IDS.map(key => [key, total ? project.pts[key] / total : .25]))
  const game = {
    id: project.id,
    title: project.title,
    type: project.type,
    genre: project.genre,
    genre2: project.genre2,
    theme: project.theme,
    platform: project.platform,
    platforms: project.platforms,
    size: project.size,
    hook: project.hook,
    accessory: project.accessory,
    publisher: project.publisher,
    year,
    week: state.week,
    scores,
    outlets: outlets.map(outlet => outlet.id),
    score,
    quality: Math.round(quality),
    copies: sale.copies,
    price: sale.price,
    share: 1 - (project.publisher?.cut ?? 0),
    sold: 0,
    weekly: 0,
    revenue: 0,
    age: 0,
    tau: tailWeeks(quality),
    onMarket: true,
    breakout: sale.breakout,
    franchise: project.franchise,
    seq: project.seq,
    sequelOf: project.sequelOf,
    sources: project.sources,
    peak: null,
    pillars: share,
    bugs: Math.round(project.bugs),
    cost: project.cost,
    labor: Math.round(project.labor ?? 0),
    ratio: Math.round((breakdown.ratio ?? 1) * 100) / 100,
  }
  state.games.push(game)
  state.franchises[project.franchise] = (state.franchises[project.franchise] ?? 0) + 1
  state.stats.gamesReleased += 1
  if (project.sequelOf) state.stats.sequelsReleased += 1
  state.stats.bestScore = Math.max(state.stats.bestScore, score)
  if (scores.every(value => value >= 9)) state.stats.hallOfFame += 1
  if (scores.every(value => value === 10)) state.stats.perfectGames += 1
  if (score < 4) state.stats.flops += 1

  const fanChips = []
  if (letdown > 0.5) {
    const lost = Math.round(state.fans * Math.min(.25, letdown * .04))
    state.fans -= lost
    if (lost) fanChips.push({ key: 'fans', value: -lost })
  }
  const rpGain = Math.round((4 + quality / 6 + total / (eraBar(year) * 60)) * (type.quick ? .4 : 1))
  state.rp += rpGain

  // Encomenda da empresa dona (modo Estúdio Adquirido).
  let brief = null
  if (state.mode?.brief) {
    const b = state.mode.brief
    const hit = b.genre === project.genre && b.theme === project.theme
    if (hit) {
      brief = applyEffects(state, { money: b.bonus })
      toast(state, { kind: 'great', icon: 'briefcase', title: 'Encomenda cumprida', sub: state.mode.parent?.name, chips: brief })
    }
    state.mode.brief = null
  }

  const levelUps = []
  for (const person of state.staff) {
    let gained = null
    while (person.xp >= xpForLevel(person.level)) {
      person.xp -= xpForLevel(person.level)
      const gains = levelUp(person, project.contrib[person.id], random)
      gained = gained ? Object.fromEntries(PILLAR_IDS.map(key => [key, gained[key] + gains[key]])) : gains
    }
    if (gained) levelUps.push({ staffId: person.id, name: person.name, level: person.level, gains: gained })
    if (teamOf(person) === project.teamId) {
      person.mood = clamp(person.mood + (score - 6) * 4, 5, 100)
      if (project.pace === 'crunch') person.mood = clamp(person.mood - 4, 0, 100)
    }
  }

  const critics = outlets.map((outlet, i) => ({ id: outlet.id, name: outlet.name, icon: outlet.icon, score: scores[i], quote: quoteFor(scores[i], project.genre, random) }))
  const comments = commentsFor(year, score, project.title, random)
  const teamIds = new Set(teamMembers(state, project.teamId, false).map(person => person.id))
  state.projects = state.projects.filter(item => item !== project)
  state.ideas = state.ideas.filter(idea => !teamIds.has(idea.staffId))
  log(state, 'cartridge', `Lançou ${game.title} · ${score.toFixed(1)}`)
  fx(state, { type: 'release', score, teamId: project.teamId })
  state.queue.push({
    kind: 'review',
    id: makeId('q'),
    gameId: game.id,
    critics,
    comments,
    breakdown: { parts: breakdown.parts, ratio: breakdown.ratio, fit: breakdown.fit, combo: breakdown.combo, pfit: breakdown.pfit },
    isNewCombo,
    combo: breakdown.combo,
    letdown: letdown > .5,
    rpGain,
    fanChips,
    levelUps,
  })
  updateLegacy(state)
  checkAchievements(state)
  return game
}

export function polishMore(state, projectId) {
  const project = projectById(state, projectId)
  if (!project) return
  project.totalWeeks += 2
  project.ready = false
  project.focus[2] = project.focus[2] ?? 'cacabugs'
}

// Demo: uma semana a mais em troca de hype e de uma pista da nota.
export function releaseDemo(state, projectId) {
  const project = projectById(state, projectId)
  if (!project || project.kind !== 'game' || project.demo || phaseAt(project) < 1) return false
  project.totalWeeks += 1
  const gain = Math.round(12 * (1 - project.hype / 130))
  project.hype = clamp(project.hype + gain, 0, 100)
  const estimate = projectTypeById(project.type).quick ? quickQuality(state, project, () => .5).quality : scoreBreakdown(state, project, () => .5).quality
  const projected = Math.min(1, project.totalWeeks / Math.max(1, project.week))
  const center = clamp(modeQuality(state, estimate * (.85 + .15 * projected)) / 10, 1, 10)
  project.demo = { low: Math.max(1, center - .7), high: Math.min(10, center + .7) }
  toast(state, { kind: 'info', icon: 'play', title: 'Demo no ar', sub: `Nota provável ${project.demo.low.toFixed(1)} a ${project.demo.high.toFixed(1)}`, chips: [{ key: 'hype', value: gain }] })
  fx(state, { type: 'hype', amount: gain })
  return true
}

export const genreLabel = project => [genreById(project.genre)?.label, genreById(project.genre2)?.label].filter(Boolean).join(' + ')

export { applyEffects, absWeek }
