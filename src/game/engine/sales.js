import { demandAt, netPriceAt, sizeById } from '../data/economy.js'
import { platformById, platformFit, platformSize } from '../data/platforms.js'
import { comboRating } from '../data/genres.js'
import { clamp, gauss } from './rng.js'

export const qualityCurve = quality => clamp((quality - 30) / 70, .02, 1) ** 2.4
export const fansFactor = fans => 1 + Math.min(1, Math.log10(1 + Math.max(0, fans) / 2000) * .35)
export const hypeFactor = hype => 1 + clamp(hype, 0, 100) / 100 * .5
export const tailWeeks = quality => 3 + Math.max(0, quality - 50) / 6

// Vendas totais previstas para um lançamento; o tick distribui isso semana a semana.
export function lifetimeSales(ctx, random = Math.random) {
  const { quality, year, t, platformId, platformIds, sizeId, genre, theme, fans, hype, trend, sequel, salesMult = 1, techSales = 1, noBreakout = false } = ctx
  const ids = platformIds?.length ? platformIds : [platformId]
  const size = sizeById(sizeId)
  // Plataforma principal conta inteira; as delegadas somam metade cada (público já dividido).
  const WEIGHTS = [1, .5, .45]
  let pf = 0
  for (let i = 0; i < ids.length; i += 1) {
    const platform = platformById(ids[i])
    const fit = platformFit(platform, genre)
    const fitF = fit > 0 ? 1.15 : fit < 0 ? .8 : 1
    pf += Math.max(.15, (platformSize(platform, t) / 2) ** .6) * fitF * (WEIGHTS[i] ?? .4)
  }
  const trendF = (trend?.genre === genre ? 1.15 : 1) * (trend?.theme === theme ? 1.08 : 1)
  const comboF = { 3: 1.15, 2: 1.05, 1: 1, 0: .85 }[comboRating(genre, theme)]
  const fitF = 1
  const luck = Math.exp(gauss(random) * .16)
  const breakoutChance = !noBreakout && quality >= 80 ? .03 + (quality - 80) * .004 : 0
  const breakout = random() < breakoutChance
  const breakoutMult = breakout ? 2 + random() * 2.2 : 1
  const copies = demandAt(year) * qualityCurve(quality) * pf * size.reach * fansFactor(fans) * hypeFactor(hype)
    * trendF * comboF * fitF * (sequel ? 1.25 : 1) * techSales * salesMult * luck * breakoutMult
  return { copies: Math.round(copies), breakout, price: netPriceAt(year) }
}

export function weeklyShare(week, tau) {
  return (1 - Math.exp(-1 / tau)) * Math.exp(-week / tau)
}
