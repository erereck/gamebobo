import { OUTLETS, QUOTES, GENRE_QUOTES } from '../data/content/critics.js'
import { COMMENTS, HANDLES, MEDIUMS } from '../data/content/comments.js'
import { PACES, PHASES, PHASE_FOCUS, sizeById, eraBar } from '../data/economy.js'
import { platformById } from '../data/platforms.js'
import { traitById } from '../data/staff.js'
import { activeStaff, decorTotals, genMultiplier, levelUp, personOutput, teamEfficiency, techBugMultiplier, techSalesMultiplier, xpForLevel, PILLAR_IDS } from './staff.js'
import { averageScore, criticScores, hookById, scoreBreakdown, totalPoints } from './quality.js'
import { lifetimeSales, tailWeeks } from './sales.js'
import { freelaProgress } from './freelas.js'
import { checkAchievements, registerCombo, updateLegacy } from './progress.js'
import { absWeek, fx, log, scaled, toast, yearFloat } from './state.js'
import { applyEffects } from './effects.js'
import { clamp, makeId, pick, sample } from './rng.js'

export function phaseBounds(project) {
  const first = Math.max(1, Math.round(project.baseWeeks * PHASES[0].share))
  const second = Math.max(first + 1, Math.round(project.baseWeeks * (PHASES[0].share + PHASES[1].share)))
  return [first, second, project.totalWeeks]
}

export const phaseAt = (project, week = project.week) => {
  const [a, b] = phaseBounds(project)
  return week < a ? 0 : week < b ? 1 : 2
}

export function projectCost(state, { size, platform, hook }) {
  const sizeInfo = sizeById(size)
  const hookInfo = hookById(hook)
  const kit = state.kits.includes(platform) ? 0 : platformById(platform)?.fee ?? 0
  const base = scaled(state, sizeInfo.cost * (hookInfo?.mods?.costMult ?? 1))
  return { base, kit: scaled(state, kit), total: base + scaled(state, kit) }
}

export function startGameProject(state, choice) {
  const size = sizeById(choice.size)
  const hook = hookById(choice.hook)
  const cost = projectCost(state, choice)
  state.money -= cost.total
  if (cost.kit > 0) state.kits.push(choice.platform)
  const weeks = Math.max(4, size.weeks + (hook?.mods?.weeks ?? 0))
  const prev = choice.sequelOf ? state.games.find(game => game.id === choice.sequelOf) : null
  const franchise = prev ? prev.franchise : makeId('fr')
  state.project = {
    kind: 'game',
    id: makeId('game'),
    title: choice.title,
    genre: prev ? prev.genre : choice.genre,
    theme: prev ? prev.theme : choice.theme,
    platform: choice.platform,
    size: choice.size,
    hook: choice.hook,
    startYear: yearFloat(state),
    week: 0,
    baseWeeks: weeks,
    totalWeeks: weeks,
    focus: { 0: null, 1: null, 2: null },
    pts: { fun: 0, art: 0, sound: 0, idea: 0 },
    bugs: 0,
    fixed: 0,
    hype: clamp((hook?.mods?.hype ?? 0) + Math.min(20, Math.log10(1 + state.fans) * 3), 0, 100),
    pace: 'normal',
    franchise,
    sequelOf: prev?.id ?? null,
    seq: prev ? (prev.seq ?? 1) + 1 : 1,
    contrib: {},
    cost: cost.total,
    ready: false,
    phaseAsked: { 1: false, 2: false },
  }
  log(state, 'cartridge', `Começou ${choice.title}`)
  fx(state, { type: 'start' })
}

export function startFreela(state, item, need) {
  state.project = {
    kind: 'freela',
    id: makeId('freela'),
    title: item.client,
    icon: item.icon,
    week: 0,
    totalWeeks: item.weeks,
    need,
    pts: { fun: 0, art: 0, sound: 0, idea: 0 },
    pay: scaled(state, item.pay),
    rp: item.rp ?? 0,
    pace: 'normal',
    contrib: {},
  }
  state.freelas = state.freelas.filter(freela => freela.id !== item.id)
  fx(state, { type: 'start' })
}

function focusMix(project, phase) {
  const focusId = project.focus[phase]
  const list = PHASE_FOCUS[PHASES[phase].id] ?? []
  return list.find(item => item.id === focusId) ?? null
}

// Uma semana de trabalho: cada pessoa produz, pontos voam da mesa, bugs nascem e morrem.
export function workWeek(state) {
  const project = state.project
  if (!project || project.ready) return
  const pace = PACES[project.pace] ?? PACES.normal
  const phase = project.kind === 'game' ? phaseAt(project) : 1
  const base = project.kind === 'game' ? PHASES[phase].base : { fun: 1, art: 1, sound: 1, idea: 1 }
  const focus = project.kind === 'game' ? focusMix(project, phase) : null
  const hook = project.kind === 'game' ? hookById(project.hook) : null
  const decor = decorTotals(state.decor)
  const bugMult = techBugMultiplier(state.techs) * decor.bugs * pace.bugs * (focus?.bugs ?? 1) * (hook?.mods?.bugs ?? 1)
  const workers = activeStaff(state)
  const efficiency = teamEfficiency(workers.length)
  for (const person of workers) {
    const trait = traitById(person.trait)
    const out = personOutput(state, person, pace) * efficiency
    const weights = {}
    let sum = 0
    for (const key of PILLAR_IDS) {
      const w = (person.skills[key] + 8) ** 1.3 * base[key] * (focus?.mix?.[key] ?? 1)
      weights[key] = w
      sum += w
    }
    const produced = {}
    for (const key of PILLAR_IDS) {
      const gen = genMultiplier(state, key) * (trait?.gen?.[key] ?? 1) * (hook?.mods?.[key] ?? 1)
      const value = out * (weights[key] / sum) * gen
      produced[key] = value
      project.pts[key] = (project.pts[key] ?? 0) + value
    }
    project.contrib[person.id] ??= { fun: 0, art: 0, sound: 0, idea: 0 }
    for (const key of PILLAR_IDS) project.contrib[person.id][key] += produced[key]
    const top = PILLAR_IDS.reduce((best, key) => (produced[key] > produced[best] ? key : best), 'fun')
    fx(state, { type: 'work', staffId: person.id, pillar: top, amount: Math.round(out) })
    if (project.kind === 'game') {
      const newBugs = out * .15 * bugMult * (trait?.bugs ?? 1) * (person.energy < 20 ? 1.3 : 1)
      project.bugs += newBugs
      if (phase === 2) {
        const fixed = Math.min(project.bugs, out * .3 * (focus?.bugFix ?? 1))
        project.bugs -= fixed
        project.fixed += fixed
      }
      if (newBugs > out * .2) fx(state, { type: 'bug', staffId: person.id })
    }
    const mentor = state.staff.some(other => other.id !== person.id && traitById(other.trait)?.teamXp)
    person.xp += out * (mentor ? 1.25 : 1)
  }
  project.week += 1
  if (project.kind === 'game') {
    project.hype = Math.max(0, project.hype - .6)
    const nextPhase = phaseAt(project)
    if (nextPhase > 0 && !project.phaseAsked[nextPhase] && project.week < project.totalWeeks) {
      project.phaseAsked[nextPhase] = true
      state.queue.push({ kind: 'phase', id: makeId('q'), phase: nextPhase })
    }
    if (project.week >= project.totalWeeks) {
      project.ready = true
      state.queue.push({ kind: 'ready', id: makeId('q') })
      fx(state, { type: 'ready' })
    }
  } else if (freelaProgress(project) >= 1 || project.week >= project.totalWeeks) {
    finishFreela(state)
  }
}

function finishFreela(state) {
  const project = state.project
  const progress = freelaProgress(project)
  const done = progress >= 1
  const pay = Math.round(done ? project.pay * (project.week < project.totalWeeks ? 1.1 : 1) : project.pay * progress ** 2 * .6)
  state.money += pay
  state.rp += done ? project.rp : 0
  if (done) state.stats.freelasDone += 1
  for (const person of state.staff) person.xp += 6
  toast(state, { kind: done ? 'good' : 'bad', icon: 'briefcase', title: done ? 'Freela entregue' : 'Freela pela metade', chips: [{ key: 'money', value: pay }, ...(done && project.rp ? [{ key: 'rp', value: project.rp }] : [])] })
  log(state, 'briefcase', `${done ? 'Entregou' : 'Entregou mal'} ${project.title}`)
  fx(state, { type: done ? 'cheer' : 'sigh' })
  state.project = null
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

// Lançamento: nota, críticos, vendas previstas, fãs e evolução da equipe.
export function releaseProject(state, random = Math.random) {
  const project = state.project
  const year = state.year
  project.bonusScore = state.buffs.score
  const breakdown = scoreBreakdown(state, project, random)
  const outlets = outletsFor(year, random)
  const scores = criticScores(breakdown.quality, outlets, random)
  const score = averageScore(scores)
  const expectation = 4 + project.hype / 16
  const letdown = Math.max(0, expectation - score)
  const isNewCombo = registerCombo(state, project.genre, project.theme)
  const sale = lifetimeSales({
    quality: breakdown.quality, year: yearFloat(state), t: yearFloat(state), platformId: project.platform, sizeId: project.size,
    genre: project.genre, theme: project.theme, fans: state.fans, hype: project.hype, trend: state.market.trend,
    sequel: Boolean(project.sequelOf), salesMult: state.buffs.sales * (hookById(project.hook)?.mods?.sales ?? 1) * (1 - letdown * .06),
    techSales: techSalesMultiplier(state.techs),
  }, random)
  state.buffs = { score: 0, sales: 1 }
  const total = totalPoints(project.pts)
  const share = Object.fromEntries(PILLAR_IDS.map(key => [key, total ? project.pts[key] / total : .25]))
  const game = {
    id: project.id,
    title: project.title,
    genre: project.genre,
    theme: project.theme,
    platform: project.platform,
    size: project.size,
    hook: project.hook,
    year,
    week: state.week,
    scores,
    outlets: outlets.map(outlet => outlet.id),
    score,
    quality: Math.round(breakdown.quality),
    copies: sale.copies,
    price: sale.price,
    sold: 0,
    weekly: 0,
    revenue: 0,
    age: 0,
    tau: tailWeeks(breakdown.quality),
    onMarket: true,
    breakout: sale.breakout,
    franchise: project.franchise,
    seq: project.seq,
    sequelOf: project.sequelOf,
    peak: null,
    share,
    bugs: Math.round(project.bugs),
    cost: project.cost,
    labor: Math.round(project.labor ?? 0),
    ratio: Math.round(breakdown.ratio * 100) / 100,
  }
  state.games.push(game)
  state.franchises[project.franchise] = (state.franchises[project.franchise] ?? 0) + 1
  state.stats.gamesReleased += 1
  if (project.sequelOf) state.stats.sequelsReleased += 1
  state.stats.bestScore = Math.max(state.stats.bestScore, score)
  if (scores.every(value => value >= 9)) state.stats.hallOfFame += 1
  if (scores.every(value => value === 10)) state.stats.perfectGames += 1
  if (score < 4) state.stats.flops += 1

  // Fãs: uma parte chega no lançamento, o resto vem com as vendas.
  const fanChips = []
  if (letdown > 0.5) {
    const lost = Math.round(state.fans * Math.min(.25, letdown * .04))
    state.fans -= lost
    if (lost) fanChips.push({ key: 'fans', value: -lost })
  }
  const rpGain = Math.round(4 + breakdown.quality / 6 + total / (eraBar(year) * 60))
  state.rp += rpGain

  // Evolução da equipe: XP acumulado vira nível.
  const levelUps = []
  for (const person of state.staff) {
    let gained = null
    while (person.xp >= xpForLevel(person.level)) {
      person.xp -= xpForLevel(person.level)
      const gains = levelUp(person, project.contrib[person.id], random)
      gained = gained ? Object.fromEntries(PILLAR_IDS.map(key => [key, gained[key] + gains[key]])) : gains
    }
    if (gained) levelUps.push({ staffId: person.id, name: person.name, level: person.level, gains: gained })
    const success = (score - 6) * 4
    person.mood = clamp(person.mood + success, 5, 100)
    if (project.pace === 'crunch') person.mood = clamp(person.mood - 4, 0, 100)
  }

  const critics = outlets.map((outlet, i) => ({ id: outlet.id, name: outlet.name, icon: outlet.icon, score: scores[i], quote: quoteFor(scores[i], project.genre, random) }))
  const comments = commentsFor(year, score, project.title, random)
  state.project = null
  state.ideas = []
  log(state, 'cartridge', `Lançou ${game.title} · ${score.toFixed(1)}`)
  fx(state, { type: 'release', score })
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

export function polishMore(state) {
  const project = state.project
  if (!project) return
  project.totalWeeks += 2
  project.ready = false
  project.focus[2] = project.focus[2] ?? 'cacabugs'
}

export function marketingCost(state, channel) {
  return scaled(state, channel.cost)
}

export { applyEffects, absWeek }
