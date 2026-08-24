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
  const platformRecords = platformIds.map(id => PLATFORMS.find(item => item.id === id)).filter(Boolean)
  const platformWeights = Object.fromEntries(platformRecords.map((platform, index) => {
    const memory = state.player.audience.platforms[platform.id] ?? 0
    const weight = Math.max(.18, platform.baseReach * (index === 0 ? 1 : .82) * (1 + Math.min(.3, memory / Math.max(1, state.player.followers) * .45)))
    return [platform.id, weight]
  }))
  const weightTotal = Object.values(platformWeights).reduce((sum, value) => sum + value, 0) || 1
  const combinedReach = platformRecords.length ? Math.min(2.35, Object.values(platformWeights).reduce((sum, value) => sum + value, 0)) : 1
  const scaleReach = SALES_SCALE_REACH[project.scale] ?? 1
  const marketDemand = qualityDemand(score, state.date.year)
  const followerDemand = Math.pow(Math.max(10, state.player.followers), .6) * 4.4
  const trustFactor = .74 + state.player.audience.trust / 190
  const reputationFactor = .78 + state.player.reputation / 150
  const hypeFactor = .86 + Math.min(1.25, (project.hype ?? 0) / 105)
  const promise = promiseForId(project.promiseId)
  const promiseReach = 1 + (promise.reach ?? 0)
  const type = projectTypeForId(project.projectType)
  const typeReach = 1 + (type.reachBonus ?? 0)
  const accessory = accessoryForId(project.accessoryId)
  const accessoryReach = 1 + (accessory?.reach ?? 0)
  const shock = marketShockMultiplier(state, project)
  const licensed = projectLicenseReadout(state, project)
  const licenseReach = 1 + licensed.reachBonus
  const launchReach = project.launchPlan === 'campaign' ? 1.18 : project.launchPlan === 'creator' ? 1.13 : project.launchPlan === 'early' ? 1.07 : .94
  const publisherReach = project.publisher ? 1 + (project.publisher.reach ?? 0) : 1
  const partnershipReach = 1 + state.corporate.partnerships.reduce((sum, item) => sum + item.reach, 0)
  const editionReach = ['remake', 'remaster', 'collection'].includes(type.id) ? 1.05 : type.id === 'port' ? .94 : 1
  const baseDemand = marketDemand * scaleReach * combinedReach * trustFactor * reputationFactor * hypeFactor * promiseReach * typeReach * accessoryReach * shock * licenseReach * launchReach * publisherReach * partnershipReach * editionReach
  const audienceFloor = followerDemand * (.75 + Math.min(.55, score / 140))
  const breakoutChance = clamp((score - 79) * .018 + state.player.reputation / 650 + Math.min(.16, (project.hype ?? 0) / 500), 0, .38)
  const phenomenonChance = clamp((score - 91) * .004 + (project.hype ?? 0) / 5000, 0, .045)
  const phenomenon = score >= 92 && random() < phenomenonChance
  const breakout = !phenomenon && score >= 82 && random() < breakoutChance
  const discovery = phenomenon ? 5 + random() * 7 : breakout ? 1.8 + random() * 2.3 : score >= 88 ? .98 + random() * .55 : .8 + random() * .38
  const potentialSales = Math.max(audienceFloor, baseDemand) * discovery
  const ceiling = audienceCeiling(state.date.year, project.scale, score, phenomenon)
  const sales = Math.max(120, Math.round(Math.min(potentialSales, ceiling)))
  const platformSales = {}
  platformRecords.forEach(platform => {
    platformSales[platform.id] = Math.round(sales * (platformWeights[platform.id] ?? 0) / weightTotal)
  })
  const royalties = platformRecords.reduce((sum, platform => sum + (platformSales[platform.id] ?? 0) / sales * platform.royalty, 0)
  const publisherRoyalty = project.publisher?.royalty ?? 0
  const licenseRoyalty = project.licenseRoyalty ?? 0
  const operationShare = platformRecords.reduce((sum, platform => sum + (platformSales[platform.id] ?? 0) / sales * operatingShare(platform.type, state.date.year), 0)
  const netShare = clamp(1 - royalties - publisherRoyalty - licenseRoyalty - operationShare, .12, .82)
  const revenue = Math.round(sales * scale.price * netShare)
  const newFollowers = Math.round(Math.min(sales * .42, sales * (.15 + score / 260)))
  const reviews = createReviews(score, project, random)
  return {
    score,
    sales,
    platformSales,
    revenue,
    newFollowers,
    breakout,
    phenomenon,
    reviews,
    review: primaryReview(reviews),
    netShare,
    shockMultiplier: shock,
  }
}
