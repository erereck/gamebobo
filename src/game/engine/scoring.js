import { FOCUSES, MARKET_ANGLES, PLATFORMS, SCALES } from '../data/catalog.js'
import { createReviews, primaryReview } from '../data/reviews.js'
import { EQUIPMENT, TRAITS } from '../data/traits.js'
import { CULTURES, OFFICES } from '../data/team.js'
import { TECHS, getEra } from '../data/eras.js'
import { accessoryForId, controlSchemeForId } from '../data/hardwareFeatures.js'
import { projectTypeForId } from '../data/projectTypes.js'
import { teamContribution } from './studio.js'
import { clamp, randomInt } from './utils.js'
import { projectLicenseReadout } from './licensing.js'
import { promiseForId } from '../data/projectPromises.js'
import { audienceCeiling, operatingShare, qualityDemand, SALES_SCALE_REACH } from './sales-model.js'
import { marketShockMultiplier, productionUnits } from './production.js'

const projectGenres = project => project.genres?.length ? project.genres : [project.genre]
const projectThemes = project => project.themes?.length ? project.themes : [project.theme]
const projectPlatforms = project => project.platforms?.length ? project.platforms : [project.platform]

export function calculateQuality(state, project, random = Math.random) {
  const focus = FOCUSES.find(item => item.id === project.focus)
  const stats = state.player.stats
  const trait = TRAITS.find(item => item.id === state.player.traitId)
  const equipment = EQUIPMENT[state.player.equipmentLevel]
  const office = OFFICES[state.studio.officeLevel]
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  const team = teamContribution(state, project.productionUnitId ?? 'founder')
  const era = getEra(state.date.year)
  const marketAngle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  const focusStat = stats[focus?.stat ?? 'design']
  const programming = stats.programming + (team.programming ?? 0)
  const design = stats.design + (team.design ?? 0)
  const art = stats.art + (team.art ?? 0)
  const marketing = stats.marketing + (team.marketing ?? 0)
  const teamFocusStat = focus?.stat === 'programming' ? programming : focus?.stat === 'art' ? art : focus?.stat === 'marketing' ? marketing : design
  const foundation = programming * 0.25 + design * 0.25 + art * 0.14 + teamFocusStat * 0.18 + marketing * 0.05
  const genres = projectGenres(project)
  const themes = projectThemes(project)
  const type = projectTypeForId(project.projectType)
  const accessory = accessoryForId(project.accessoryId)
  const trendBonus = genres.includes(state.market.genre) ? 4 : 0
  const angleBonus = project.focus === marketAngle?.focus ? 4 : 0
  // Controles, qualidade herdada e bônus do tipo já entram no estado inicial do projeto.
  // Aqui só escalamos a inovação acumulada para não aplicar o mesmo bônus duas vezes.
  const innovationValue = (project.innovation ?? 0) * type.innovationMultiplier
  const innovationBonus = project.focus === 'innovation' ? innovationValue * 0.34 : innovationValue * 0.12
  const sequelModifier = project.isSequel ? (trait?.modifiers.sequel ?? 0) : 0
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
  const mixCount = Math.max(0, genres.length - 1) + Math.max(0, themes.length - 1)
  const mixModifier = mixCount ? (['innovation', 'systems'].includes(project.focus) ? mixCount * .8 : -mixCount * 1.25) : 0
  const accessoryFit = accessory ? (accessory.genres?.some(id => genres.includes(id)) || accessory.themes?.some(id => themes.includes(id)) ? 3 : -1) + accessory.quality : 0
  const unit = productionUnits(state).find(item => item.id === project.productionUnitId)
  const delegatedModifier = unit && !unit.main ? clamp((unit.skill - 68) * .11 - 1, -4, 4) : 0
  const rawValue = foundation + project.quality + innovationBonus + promiseBonus + equipment.bonus + office.bonus + trendBonus + angleBonus + sequelModifier + traitQuality + traitInnovation + cultureQuality + cultureInnovation + techBonus + licensed.qualityBonus + accessoryFit + mixModifier + delegatedModifier - bugPenalty - techPenalty - exhaustion - healthPenalty + luck + licenseLuck
  const scaleComplexity = { micro: 0, small: 0, medium: 9, large: 13, blockbuster: 18 }[project.scale] ?? 0
  const reviewEra = state.date.year >= 2010 ? 2 : state.date.year >= 2000 ? 1 : 0
  const severeBuildPenalty = Math.max(0, (project.bugs ?? 0) - 5) * 1.2 + Math.max(0, state.player.stress - 85) * .14
  const calibrated = 70 + (rawValue - 50) * .55 + reviewEra - scaleComplexity - severeBuildPenalty
  return clamp(Math.round(calibrated), 24, trait?.id === 'perfectionist' ? 99 : 97)
}

export function calculateRelease(state, project, random = Math.random) {
  const score = calculateQuality(state, project, random)
  const scale = SCALES[project.scale]
  const platformIds = projectPlatforms(project)
  const platforms = platformIds.map(id => PLATFORMS.find(item => item.id === id)).filter(Boolean)
  const primaryPlatform = platforms[0] ?? PLATFORMS.find(item => item.id === project.platform)
  const genres = projectGenres(project)
  const type = projectTypeForId(project.projectType)
  const accessory = accessoryForId(project.accessoryId)
  const trend = genres.includes(state.market.genre) ? 1.42 : 1
  const marketAngle = MARKET_ANGLES.find(item => item.id === state.market.angle)
  const angle = project.focus === marketAngle?.focus ? 1.14 : 1
  const platformWeights = platforms.map(platform => Math.max(6, state.market.platforms[platform.id] ?? 18))
  const weightTotal = platformWeights.reduce((sum, value) => sum + value, 0) || 1
  const averageShare = platformWeights.reduce((sum, value) => sum + value, 0) / Math.max(1, platforms.length)
  const platformMultiplier = 0.72 + averageShare / 100
  const multiplatformReach = 1 + Math.min(1.08, Math.max(0, platforms.length - 1) * .38)
  const audienceMultiplier = 1 + Math.min(.85, Math.log10(1 + state.player.followers / 1000) * .32)
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  const marketingMultiplier = 0.78 + state.player.stats.marketing / 135 + (culture?.modifiers.marketing ?? 0) / 45
  const qualityCurve = qualityDemand(score, state.date.year)
  const era = getEra(state.date.year)
  const projectReach = 1 + (project.reach ?? 0) + type.reachBonus + (accessory?.reach ?? 0)
  const publisherReach = project.publisher?.reach ?? 1
  const publisherStyle = project.publisher?.style
  const publisherFit = publisherStyle === 'mass'
    ? (['large', 'blockbuster'].includes(project.scale) ? 1.12 : project.launchPlan === 'campaign' ? .62 : .56)
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
  const salesScaleReach = SALES_SCALE_REACH[project.scale] ?? scale.reach
  const shockMultiplier = marketShockMultiplier(state, project)
  const editionReach = type.id === 'port' ? .78 : type.id === 'remaster' ? .9 : type.id === 'collection' ? .94 : 1
  const ordinarySales = qualityCurve * salesScaleReach * era.indieReach * projectReach * publisherReach * publisherFit * hypeMultiplier * expectationPenalty * franchiseFatigue * licensed.reachMultiplier * launchMultiplier * trend * angle * platformMultiplier * multiplatformReach * audienceMultiplier * marketingMultiplier * shockMultiplier * editionReach * randomInt(82, 118, random) / 100
  const breakoutChance = score >= 78 ? clamp((score - 77) * .00045 + (project.innovation ?? 0) * .0001 + (project.hype ?? 0) * .000025, 0, .018) : 0
  const breakout = random() < breakoutChance
  const phenomenon = breakout && score >= 88 && random() < .006 + Math.max(0, score - 94) * .002
  const breakoutMultiplier = phenomenon ? 2.2 * (8 ** random()) : breakout ? randomInt(140, 260, random) / 100 : 1
  const marketCeiling = audienceCeiling(state.date.year) * (platforms.length > 1 ? 1.35 : 1)
  const sales = Math.min(marketCeiling, Math.round(ordinarySales * breakoutMultiplier))
  const platformSales = Object.fromEntries(platforms.map((platform, index) => [platform.id, Math.round(sales * platformWeights[index] / weightTotal)]))
  const distributed = Object.values(platformSales).reduce((sum, value) => sum + value, 0)
  if (platforms[0]) platformSales[platforms[0].id] += sales - distributed
  const gross = sales * scale.price
  const publisherCut = project.publisher?.royalty ?? 0
  const blendedRoyalty = platforms.reduce((sum, platform, index) => sum + platform.royalty * platformWeights[index] / weightTotal, 0) || primaryPlatform?.royalty || .7
  const effectiveRoyalty = Math.min(0.98, blendedRoyalty + (project.directMargin ?? 0))
  const netRoyalty = Math.max(.12, effectiveRoyalty * (1 - publisherCut) - (project.licenseRoyalty ?? licensed.royalty))
  const operations = platforms.reduce((sum, platform, index) => sum + operatingShare(state.date.year, platform.type) * platformWeights[index] / weightTotal, 0) || operatingShare(state.date.year, primaryPlatform?.type)
  const studioRoyalty = netRoyalty * operations
  const revenue = Math.round(gross * studioRoyalty * (1 - Math.min(0.75, state.studio.equity ?? 0)))
  const newFollowers = Math.round(sales * (score / 100) * (phenomenon ? .06 : breakout ? .1 : .14))
  const reviews = createReviews(score, project, state.date.year, random)
  const leadReview = primaryReview(reviews)
  return {
    score,
    sales,
    platformSales,
    initialSales: sales,
    revenue,
    initialRevenue: revenue,
    newFollowers,
    initialFollowers: newFollowers,
    price: scale.price,
    royalty: studioRoyalty,
    netRoyalty,
    platformRoyalty: effectiveRoyalty,
    quote: leadReview.quote,
    reviews,
    breakout,
    phenomenon,
    breakoutMultiplier,
    shockMultiplier,
  }
}
