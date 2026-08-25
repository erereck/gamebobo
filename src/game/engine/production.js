import { PLATFORMS, SCALES } from '../data/catalog.js'
import { getEra } from '../data/eras.js'
import { accessoryForId, controlSchemeForId } from '../data/hardwareFeatures.js'
import { projectTypeForId, sourceGamesForPayload } from '../data/projectTypes.js'
import { SUBSIDIARY_STUDIOS, subsidiaryForId, subsidiaryPrice } from '../data/subsidiaryStudios.js'
import { productionPaceForUnit, productionUnits as managedProductionUnits } from './teamManagement.js'
import { clamp, makeId, randomInt } from './utils.js'
import { modeAllowsSubsidiaries, modeProjectCostMultiplier } from './gameModes.js'

const unique = values => [...new Set((values ?? []).filter(Boolean))]

export function projectPlatforms(payload) {
  const values = unique(payload.platforms?.length ? payload.platforms : [payload.platform])
  return values.length ? values : ['pc']
}

export const productionUnits = state => managedProductionUnits(state)

export function usedProductionUnitIds(state) {
  return new Set([state.currentProject, ...(state.parallelProjects ?? [])].filter(Boolean).map(project => project.productionUnitId ?? 'founder'))
}

export function availableProductionUnits(state) {
  const used = usedProductionUnitIds(state)
  return productionUnits(state).filter(unit => unit.canWork && !used.has(unit.id))
}

export const projectCapacity = state => productionUnits(state).filter(unit => unit.canWork).length
export const projectCount = state => (state.currentProject ? 1 : 0) + (state.parallelProjects?.length ?? 0)

export function calculateProjectPlan(state, payload) {
  const scale = SCALES[payload.scale]
  if (!scale) return null
  const type = projectTypeForId(payload.projectType)
  const era = getEra(state.date.year)
  const platforms = projectPlatforms(payload)
  const sources = sourceGamesForPayload(state, payload)
  const accessory = accessoryForId(payload.accessoryId)
  const controls = controlSchemeForId(payload.controlScheme)
  const secondaryGenres = unique(payload.genres).slice(1)
  const secondaryThemes = unique(payload.themes).slice(1)
  const collectionExtra = type.id === 'collection' ? Math.max(0, sources.length - 2) : 0
  const extraPlatforms = Math.max(0, platforms.length - 1)
  const delegatedPorts = unique(payload.delegatedPlatformIds).filter(id => platforms.slice(1).includes(id)).length
  const selectedUnit = productionUnits(state).find(unit => unit.id === (payload.productionUnitId ?? 'founder'))
  const assignedEmployees = selectedUnit?.assignedMembers ?? state.studio.team.length
  const baseCost = scale.cost * era.costMultiplier * (1 + assignedEmployees * .08)
  const scopeCost = 1 + (payload.scopeMonths ?? 0) * .055
  const contentCost = 1 + secondaryGenres.length * .08 + secondaryThemes.length * .045 + collectionExtra * .11
  const platformCost = 1 + extraPlatforms * .22 + delegatedPorts * .08
  const hardwareCost = 1 + (accessory?.costMultiplier ?? 0) + controls.costMultiplier
  const estimatedCost = Math.round(baseCost * type.costMultiplier * scopeCost * contentCost * platformCost * hardwareCost * modeProjectCostMultiplier(state))
  const baseMonths = scale.months * type.monthsMultiplier
  const platformMonths = extraPlatforms * .72 - delegatedPorts * .42
  const contentMonths = secondaryGenres.length * .45 + secondaryThemes.length * .25 + collectionExtra * .55
  const hardwareMonths = (accessory?.months ?? 0) + controls.months
  const totalMonths = Math.max(2, Math.ceil(baseMonths + (payload.scopeMonths ?? 0) + platformMonths + contentMonths + hardwareMonths))
  const sourceScore = sources.length ? Math.round(sources.reduce((sum, game) => sum + (game.score ?? 65), 0) / sources.length) : 0
  const legacyQuality = sources.length ? Math.round((sourceScore - 65) * ({ port: .12, remaster: .16, remake: .09, collection: .11 }[type.id] ?? .04)) : 0
  const legacyHype = sources.length ? Math.max(0, Math.round(sources.reduce((sum, game) => sum + (game.sales ?? 0), 0) / sources.length / 120000)) : 0
  return { type, platforms, sources, accessory, controls, estimatedCost, totalMonths, legacyQuality, legacyHype }
}

export function acquireSubsidiary(state, studioId) {
  if (!modeAllowsSubsidiaries(state)) return null
  const studio = SUBSIDIARY_STUDIOS.find(item => item.id === studioId)
  if (!studio || state.date.year < studio.fromYear || state.studio.subsidiaries?.some(item => item.studioId === studioId)) return null
  const price = subsidiaryPrice(state, studio)
  if (state.player.money < price) return null
  state.player.money -= price
  state.studio.subsidiaries ??= []
  const owned = { id: makeId('subsidiary'), studioId, acquiredYear: state.date.year, price, morale: 72 }
  state.studio.subsidiaries.push(owned)
  return { ...studio, price }
}

export function subsidiaryMonthlyBurn(state) {
  return (state.studio.subsidiaries ?? []).reduce((sum, owned) => sum + (subsidiaryForId(owned.studioId)?.monthly ?? 0), 0)
}

export function advanceDelegatedProject(state, project, random = Math.random) {
  const unit = productionUnits(state).find(item => item.id === project.productionUnitId)
  if (!unit || unit.main || !unit.canWork) return false
  const specialtyBonus = unit.specialty && (project.genres ?? [project.genre]).includes(unit.specialty) ? .18 : 0
  const pace = productionPaceForUnit(state, unit.id)
  if (pace <= 0) return false
  const monthlyCost = Math.max(1, Math.round(project.estimatedCost / project.totalMonths))
  project.progress += pace + specialtyBonus
  project.costSpent += monthlyCost
  project.quality += randomInt(1, 3, random) + (specialtyBonus ? 1 : 0)
  project.bugs = Math.max(0, (project.bugs ?? 0) + randomInt(-1, 2, random))
  project.pressure = clamp((project.pressure ?? 0) + randomInt(1, 4, random), 0, 100)
  project.delegatedMonths = (project.delegatedMonths ?? 0) + 1
  state.player.money -= monthlyCost
  return project.progress >= project.totalMonths
}

export function marketShockMultiplier(state, project) {
  const platforms = (project.platforms?.length ? project.platforms : [project.platform]).map(id => PLATFORMS.find(item => item.id === id)).filter(Boolean)
  const keys = new Set(['global', project.genre, project.theme, project.focus])
  ;(project.genres ?? []).forEach(id => keys.add(id))
  ;(project.themes ?? []).forEach(id => keys.add(id))
  platforms.forEach(platform => { keys.add(platform.id); keys.add(platform.type); if (platform.type === 'mobile') keys.add('mobile') })
  if (project.licenseIds?.length) keys.add('licensed')
  if (project.accessoryId) keys.add('accessory')
  if (project.controlScheme && project.controlScheme !== 'standard') keys.add('motion')
  if (['micro', 'small'].includes(project.scale)) keys.add('indie')
  if (project.promiseAudience === 'casual') keys.add('casual')
  let multiplier = 1
  ;(state.world.activeIndustryEffects ?? []).forEach(active => {
    Object.entries(active.modifiers ?? {}).forEach(([key, value]) => { if (keys.has(key)) multiplier *= value })
  })
  return clamp(multiplier, .45, 1.85)
}
