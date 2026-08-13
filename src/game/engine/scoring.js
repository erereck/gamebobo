import { FOCUSES, MARKET_ANGLES, PLATFORMS, SCALES } from '../data/catalog.js'
import { createReviews, primaryReview } from '../data/reviews.js'
import { EQUIPMENT, TRAITS } from '../data/traits.js'
import { CULTURES, OFFICES } from '../data/team.js'
import { TECHS, getEra } from '../data/eras.js'
import { teamContribution } from './studio.js'
import { clamp, randomInt } from './utils.js'
import { projectLicenseReadout } from './licensing.js'
import { promiseForId } from '../data/projectPromises.js'

export function calculateQuality(state, project, random = Math.random) {
  const focus = FOCUSES.find(item => item.id === project.focus)
  const stats = state.player.stats
  const trait = TRAITS.find(item => item.id === state.player.traitId)
  const equipment = EQUIPMENT[state.player.equipmentLevel]
  const office = OFFICES[state.studio.officeLevel]
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  const team = teamContribution(state)
  const era = getEra(state.date.year)
  const marketAngle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  const focusStat = stats[focus?.stat ?? 'design']
  const programming = stats.programming + (team.programming ?? 0)
  const design = stats.design + (team.design ?? 0)
  const art = stats.art + (team.art ?? 0)
  const marketing = stats.marketing + (team.marketing ?? 0)
  const teamFocusStat = focus?.stat === 'programming' ? programming : focus?.stat === 'art' ? art : focus?.stat === 'marketing' ? marketing : design
  const foundation = programming * 0.25 + design * 0.25 + art * 0.14 + teamFocusStat * 0.18 + marketing * 0.05
  const trendBonus = project.genre === state.market.genre ? 4 : 0
  const angleBonus = project.focus === marketAngle?.focus ? 4 : 0
  const innovationBonus = project.focus === 'innovation' ? project.innovation * 0.34 : project.innovation * 0.12
  const sequelModifier = project.franchiseId ? (trait?.modifiers.sequel ?? 0) : 0
  const traitQuality = trait?.modifiers.quality ?? 0
  const traitInnovation = project.focus === 'innovation' ? (trait?.modifiers.innovation ?? 0) : 0
  const cultureQuality = culture?.modifiers.quality ?? 0
  const cultureInnovation = project.focus === 'innovation' ? (culture?.modifiers.innovation ?? 0) : 0
  const techBonus = state.studio.unlockedTechs.reduce((sum, techId) => {
    const tech = TECHS.find(item => item.id === techId)
    return sum + (tech?.bonus.quality ?? 0) + (tech?.bonus[project.focus] ?? 0)
  }, 0)
  const techPenalty = Math.max(0, era.techCap - state.world.technologyLevel - 2) * 1.5
  const exhaustion = state.player.stress * 0.09 + Math.max(0, project.pressure - 45) * 0.12
  const healthPenalty = Math.max(0, 55 - state.player.health) * 0.13
  const luck = randomInt(-7, 8, random)
  const licensed = projectLicenseReadout(state, project)
  const promise = promiseForId(project.promiseId)
  const promiseBonus = promise.quality + Math.min(2, project.promiseFit ?? 0) * 1.5
  const bugPenalty = Math.min(14, (project.bugs ?? 0) * .9)
  const licenseLuck = licensed.volatility ? randomInt(-licensed.volatility, licensed.volatility, random) : 0
  const rawValue = foundation + project.quality + innovationBonus + promiseBonus + equipment.bonus + office.bonus + trendBonus + angleBonus + sequelModifier + traitQuality + traitInnovation + cultureQuality + cultureInnovation + techBonus + licensed.qualityBonus - bugPenalty - techPenalty - exhaustion - healthPenalty + luck + licenseLuck
  const scaleComplexity = { micro: 0, small: 0, medium: 9, large: 13, blockbuster: 18 }[project.scale] ?? 0
  const reviewEra = state.date.year >= 2010 ? 2 : state.date.year >= 2000 ? 1 : 0
  const severeBuildPenalty = Math.max(0, (project.bugs ?? 0) - 5) * 1.2 + Math.max(0, state.player.stress - 85) * .14
  const calibrated = 70 + (rawValue - 50) * .55 + reviewEra - scaleComplexity - severeBuildPenalty
  return clamp(Math.round(calibrated), 24, trait?.id === 'perfectionist' ? 99 : 97)
}

export function calculateRelease(state, project, random = Math.random) {
  const score = calculateQuality(state, project, random)
  const scale = SCALES[project.scale]
  const platform = PLATFORMS.find(item => item.id === project.platform)
  const trend = project.genre === state.market.genre ? 1.42 : 1
  const marketAngle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  const angle = project.focus === marketAngle?.focus ? 1.14 : 1
  const platformShare = state.market.platforms[project.platform] ?? 33
  const platformMultiplier = 0.72 + platformShare / 100
  const audienceMultiplier = 1 + Math.log10(1 + state.player.followers / 500) * .65
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  const marketingMultiplier = 0.78 + state.player.stats.marketing / 135 + (culture?.modifiers.marketing ?? 0) / 45
  const qualityCurve = Math.max(180, Math.max(0, score - 42) ** 2 * 4.2)
  const era = getEra(state.date.year)
  const projectReach = 1 + (project.reach ?? 0)
  const publisherReach = project.publisher?.reach ?? 1
  const publisherStyle = project.publisher?.style
  const publisherFit = publisherStyle === 'mass'
    ? (['large', 'blockbuster'].includes(project.scale) || project.launchPlan === 'campaign' ? 1.12 : 0.84)
    : publisherStyle === 'indie'
      ? (['micro', 'small'].includes(project.scale) ? 1.08 : 0.96)
      : publisherStyle === 'casual'
        ? (['micro', 'small'].includes(project.scale) ? 1.07 : 0.94)
        : publisherStyle === 'prestige' ? 0.96 + Math.max(0, score - 72) / 220 : 1
  const hypeMultiplier = 0.82 + Math.min(0.75, (project.hype ?? 0) / 100)
  const expectationPenalty = project.expectation && score < project.expectation ? Math.max(0.72, 1 - (project.expectation - score) / 100) : 1
  const franchiseFatigue = project.isSequel ? Math.max(0.72, 1 - Math.max(0, (project.sequelNumber ?? 2) - 3) * 0.08) : 1
  const licensed = projectLicenseReadout(state, project)
  const launchMultiplier = project.launchPlan === 'campaign' ? 1.3 : project.launchPlan === 'creator' ? 1.22 : project.launchPlan === 'early' ? 1.12 : project.launchPlan === 'shadow' ? 0.88 : 1
  const ordinarySales = qualityCurve * scale.reach * era.indieReach * projectReach * publisherReach * publisherFit * hypeMultiplier * expectationPenalty * franchiseFatigue * licensed.reachMultiplier * launchMultiplier * trend * angle * platformMultiplier * audienceMultiplier * marketingMultiplier * randomInt(82, 118, random) / 100
  const criticalDiscovery = score >= 90 ? ((score - 89) ** 3) * 650 * era.indieReach * scale.reach * platformMultiplier : 0
  const breakoutChance = score >= 78 ? clamp((score - 77) * .00045 + (project.innovation ?? 0) * .0001 + (project.hype ?? 0) * .000025, 0, .018) : 0
  const breakout = random() < breakoutChance
  const phenomenon = breakout && score >= 88 && random() < .006 + Math.max(0, score - 94) * .002
  const breakoutMultiplier = phenomenon ? 40 * (60 ** random()) : breakout ? randomInt(250, 750, random) / 100 : 1
  const marketCeiling = state.date.year < 1985 ? 1_000_000 : state.date.year < 1995 ? 8_000_000 : state.date.year < 2005 ? 35_000_000 : state.date.year < 2015 ? 180_000_000 : 500_000_000
  const sales = Math.min(marketCeiling, Math.round(Math.max(ordinarySales * breakoutMultiplier, criticalDiscovery)))
  const gross = sales * scale.price
  const publisherCut = project.publisher?.royalty ?? 0
  const effectiveRoyalty = Math.min(0.98, platform.royalty + (project.directMargin ?? 0))
  const netRoyalty = Math.max(.12, effectiveRoyalty * (1 - publisherCut) - (project.licenseRoyalty ?? licensed.royalty))
  const revenue = Math.round(gross * netRoyalty * (1 - Math.min(0.75, state.studio.equity ?? 0)))
  const newFollowers = Math.round(sales * (score / 100) * (phenomenon ? .06 : breakout ? .1 : .14))
  const reviews = createReviews(score, project, state.date.year, random)
  const leadReview = primaryReview(reviews)
  return {
    score,
    sales,
    initialSales: sales,
    revenue,
    initialRevenue: revenue,
    newFollowers,
    initialFollowers: newFollowers,
    price: scale.price,
    royalty: netRoyalty,
    platformRoyalty: effectiveRoyalty,
    quote: leadReview.quote,
    reviews,
    breakout,
    phenomenon,
    breakoutMultiplier,
  }
}
