import { comboRating, genreById } from '../data/genres.js'
import { eraBar, sizeById } from '../data/economy.js'
import { platformById, platformFit } from '../data/platforms.js'
import { HOOKS } from '../data/content/hooks.js'
import { clamp, gauss } from './rng.js'

export const PILLAR_IDS = ['fun', 'art', 'sound', 'idea']
export const totalPoints = pts => PILLAR_IDS.reduce((sum, key) => sum + (pts[key] ?? 0), 0)
export const hookById = id => HOOKS.find(item => item.id === id)

export function expectedPoints(sizeId, year) {
  const size = sizeById(sizeId)
  return size.weeks * size.team * eraBar(year) * 10
}

export function fitOf(pts, genreId) {
  const genre = genreById(genreId)
  const total = totalPoints(pts)
  if (!genre || total <= 0) return 0
  let dot = 0
  let a = 0
  let b = 0
  for (const key of PILLAR_IDS) {
    const d = (pts[key] ?? 0) / total
    dot += d * genre.w[key]
    a += d * d
    b += genre.w[key] * genre.w[key]
  }
  return dot / Math.sqrt(a * b)
}

export const volumeScore = ratio => 100 * (1 - Math.exp(-1 * Math.max(0, ratio)))
export const bugPenalty = (bugs, pts) => Math.min(28, (bugs / Math.max(1, totalPoints(pts))) * 55)

// Detalha de onde veio a nota. A interface usa as partes para explicar sem texto.
export function scoreBreakdown(state, project, random = Math.random) {
  const year = project.startYear ?? state.year
  const ratio = totalPoints(project.pts) / expectedPoints(project.size, year)
  const fit = fitOf(project.pts, project.genre)
  const fitNorm = clamp((fit - .8) / .19, 0, 1)
  const combo = comboRating(project.genre, project.theme)
  const platform = platformById(project.platform)
  const pfit = platformFit(platform, project.genre)
  const hook = hookById(project.hook)
  const last = state.games.at(-1)
  const sameCombo = last && last.genre === project.genre && last.theme === project.theme
  const sameGenre = last && last.genre === project.genre
  const firstCombo = state.combos[`${project.genre}:${project.theme}`] === undefined
  const parts = {
    volume: volumeScore(ratio) * .8,
    fit: (fitNorm - .5) * 16,
    combo: { 3: 5, 2: 2, 1: 0, 0: -7 }[combo],
    platform: pfit > 0 ? 3 : pfit < 0 ? -4 : 0,
    trend: (state.market.trend.genre === project.genre ? 2 : 0) + (state.market.trend.theme === project.theme ? 2 : 0),
    novelty: sameCombo && !project.sequelOf ? -6 : sameGenre && !project.sequelOf ? -2 : firstCombo ? 2 : 0,
    hook: hook?.mods?.score && hook.genres?.includes(project.genre) ? hook.mods.score : 0,
    sequel: project.sequelOf ? sequelBonus(state, project) : 0,
    bugs: -bugPenalty(project.bugs, project.pts),
    bonus: project.bonusScore ?? 0,
    fame: -Math.min(4.5, Math.log10(1 + (state.legacy ?? 0) / 50) * 2),
    luck: gauss(random) * 3,
  }
  let raw = 10 + Object.values(parts).reduce((sum, value) => sum + value, 0)
  const cap = sizeById(project.size)?.cap ?? 100
  if (raw > cap - 8) raw = cap - 8 + (raw - (cap - 8)) * .4
  return { quality: clamp(raw, 4, 100), parts, ratio, fit, combo, pfit, cap }
}

function sequelBonus(state, project) {
  const chain = state.games.filter(game => game.franchise === project.franchise)
  const prev = chain.at(-1)
  if (!prev) return 0
  const fatigue = Math.max(0, chain.length - 2) * 2.5
  return (prev.score >= 7.5 ? 4 : prev.score >= 6.5 ? 2 : -2) - fatigue
}

// Quatro críticos. Cada um tem um viés e um pouco de humor do dia.
export function criticScores(quality, outlets, random = Math.random) {
  return outlets.map(outlet => clamp(Math.round(quality / 10 + (outlet.bias ?? 0) + gauss(random) * .62), 1, 10))
}

export const averageScore = scores => Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
