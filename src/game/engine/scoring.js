import { FOCUSES, MARKET_ANGLES, PLATFORMS, SCALES } from '../data/catalog.js'
import { createReviews, primaryReview } from '../data/reviews.js'
import { EQUIPMENT, TRAITS } from '../data/traits.js'
import { CULTURES, OFFICES } from '../data/team.js'
import { TECHS, getEra } from '../data/eras.js'
import { teamContribution } from './studio.js'
import { clamp, randomInt } from './utils.js'
import { projectLicenseReadout } from './licensing.js'

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
  const licenseLuck = licensed.volatility ? randomInt(-licensed.volatility, licensed.volatility, random) : 0
  const value = foundation + project.quality + innovationBonus + equipment.bonus + office.bonus + trendBonus + angleBonus + sequelModifier + traitQuality + traitInnovation + cultureQuality + cultureInnovation + techBonus + licensed.qualityBonus - techPenalty - exhaustion - healthPenalty + luck + licenseLuck
  return clamp(Math.round(value), 24, trait?.id === 'perfectionist' ? 99 : 97)
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
  const audienceMultiplier = 1 + state.player.followers / 7000
  const marketingMultiplier = 0.82 + state.player.stats.marketing / 120
  const qualityCurve = Math.max(800, score ** 2.16)
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
  const sales = Math.round(qualityCurve * scale.reach * era.indieReach * projectReach * publisherReach * publisherFit * hypeMultiplier * expectationPenalty * franchiseFatigue * licensed.reachMultiplier * launchMultiplier * trend * angle * platformMultiplier * audienceMultiplier * marketingMultiplier * randomInt(82, 118, random) / 100)
  const gross = sales * scale.price
  const publisherCut = project.publisher?.royalty ?? 0
  const effectiveRoyalty = Math.min(0.98, platform.royalty + (project.directMargin ?? 0))
  const netRoyalty = Math.max(.12, effectiveRoyalty * (1 - publisherCut) - (project.licenseRoyalty ?? licensed.royalty))
  const revenue = Math.round(gross * netRoyalty * (1 - Math.min(0.75, state.studio.equity ?? 0)))
  const newFollowers = Math.round(sales * (score / 100) * 0.14)
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
  }
}
