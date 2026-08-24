import test from 'node:test'
import assert from 'node:assert/strict'
import { hydrateV7 } from '../persistence/migrateV7.js'
import { acquireSubsidiary } from './production.js'
import { reduceGame } from './reducer.js'
import { createInitialState } from './state.js'
import { hireCandidate } from './studio.js'
import {
  assignTeamMember,
  createProductionTeam,
  productionPaceForUnit,
  productionUnitForId,
  productionUnits,
  staffForProductionUnit,
} from './teamManagement.js'

const fixed = () => .5

const staff = (id, skill = 70, productionTeamId = 'founder') => ({
  id: `person-${id}`,
  name: `Pessoa ${id}`,
  roleId: id % 2 ? 'programmer' : 'designer',
  personalityId: 'calm',
  skill,
  potential: 88,
  salary: 4000,
  morale: 78,
  energy: 100,
  loyalty: 75,
  months: 0,
  projects: 0,
  awards: 0,
  productionTeamId,
})

const projectPayload = title => ({
  title,
  projectType: 'original',
  genres: ['action'],
  themes: ['space'],
  genre: 'action',
  theme: 'space',
  focus: 'gameplay',
  scale: 'small',
  platforms: ['pc'],
  platform: 'pc',
  delegatedPlatformIds: [],
  productionUnitId: 'founder',
  promiseId: 'precise-controls',
  franchiseId: '',
  sourceGameIds: [],
  licenseIds: [],
  accessoryId: '',
  controlScheme: 'standard',
})

test('new hires enter the principal production team by default', () => {
  const state = createInitialState({ startYear: 2006 }, fixed)
  state.player.money = 1_000_000
  state.studio.officeLevel = 4
  const candidate = staff(1)
  delete candidate.productionTeamId
  state.studio.candidates = [candidate]

  const hired = hireCandidate(state, candidate.id)

  assert.ok(hired)
  assert.equal(hired.productionTeamId, 'founder')
  assert.equal(state.studio.team[0].productionTeamId, 'founder')
})

test('a custom team accepts many members and every concentration step increases production pace', () => {
  const state = createInitialState({ startYear: 2020 }, fixed)
  state.studio.team = Array.from({ length: 20 }, (_, index) => staff(index + 1, 72))
  const team = createProductionTeam(state)

  const checkpoints = []
  for (let index = 0; index < 20; index += 1) {
    assignTeamMember(state, state.studio.team[index].id, team.id)
    if ([0, 1, 3, 7, 11, 19].includes(index)) checkpoints.push(productionPaceForUnit(state, team.id))
  }

  assert.equal(staffForProductionUnit(state, team.id).length, 20)
  assert.equal(new Set(state.studio.team.map(person => person.productionTeamId)).size, 1)
  checkpoints.slice(1).forEach((pace, index) => assert.ok(pace > checkpoints[index]))
})

test('more employees on the principal team produce more real project progress in a month', () => {
  let solo = createInitialState({ startYear: 2006 }, fixed)
  solo.player.money = 10_000_000
  solo = reduceGame(solo, { type: 'START_PROJECT', payload: projectPayload('Solo') }, fixed)
  solo = reduceGame(solo, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, fixed)
  const soloProgress = solo.currentProject?.progress ?? solo.games.find(game => game.title === 'Solo')?.totalMonths ?? 0

  let crowded = createInitialState({ startYear: 2006 }, fixed)
  crowded.player.money = 10_000_000
  crowded.studio.officeLevel = 6
  crowded.studio.team = Array.from({ length: 12 }, (_, index) => staff(index + 1, 72, 'founder'))
  crowded = reduceGame(crowded, { type: 'START_PROJECT', payload: projectPayload('Cheio') }, fixed)
  crowded = reduceGame(crowded, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, fixed)
  const crowdedProgress = crowded.currentProject?.progress ?? crowded.games.find(game => game.title === 'Cheio')?.totalMonths ?? 0

  assert.ok(crowdedProgress > soloProgress)
})

test('an empty custom team exists but cannot open a production front until somebody joins it', () => {
  const state = createInitialState({ startYear: 2006 }, fixed)
  const team = createProductionTeam(state)

  let unit = productionUnitForId(state, team.id)
  assert.equal(unit.canWork, false)
  assert.equal(unit.pace, 0)

  state.studio.team = [staff(1)]
  assignTeamMember(state, state.studio.team[0].id, team.id)
  unit = productionUnitForId(state, team.id)
  assert.equal(unit.canWork, true)
  assert.ok(unit.pace > 0)
})

test('owned studios keep their native team and get faster when internal employees reinforce them', () => {
  const state = createInitialState({ startYear: 2020 }, fixed)
  state.player.money = 50_000_000
  state.studio.team = Array.from({ length: 6 }, (_, index) => staff(index + 1, 84))
  const acquired = acquireSubsidiary(state, 'glass-engine')
  assert.ok(acquired)

  const unitId = 'glass-engine-1'
  const before = productionUnitForId(state, unitId)
  assert.ok(before.canWork)
  assert.equal(before.assignedMembers, 0)

  state.studio.team.slice(0, 4).forEach(person => assignTeamMember(state, person.id, unitId))
  const after = productionUnitForId(state, unitId)

  assert.equal(after.assignedMembers, 4)
  assert.equal(after.memberCount, before.memberCount + 4)
  assert.ok(after.pace > before.pace)
})

test('existing schema 7 saves put unassigned employees on the principal team', () => {
  const legacy = createInitialState({ startYear: 2006 }, fixed)
  legacy.studio.team = [staff(1), staff(2)]
  delete legacy.studio.productionTeams
  legacy.studio.team.forEach(person => { delete person.productionTeamId })

  const hydrated = hydrateV7(legacy)

  assert.deepEqual(hydrated.studio.productionTeams, [])
  assert.equal(hydrated.studio.team.every(person => person.productionTeamId === 'founder'), true)
})

test('legacy active internal units are converted into explicit teams without orphaning the project', () => {
  const legacy = createInitialState({ startYear: 2006 }, fixed)
  legacy.studio.team = Array.from({ length: 5 }, (_, index) => staff(index + 1))
  legacy.studio.team.forEach(person => { delete person.productionTeamId })
  delete legacy.studio.productionTeams
  legacy.parallelProjects = [{
    id: 'project-legacy',
    title: 'Projeto antigo',
    genre: 'action',
    theme: 'space',
    platform: 'pc',
    productionUnitId: 'internal-1',
    productionUnitName: 'Equipe interna 2',
  }]

  const hydrated = hydrateV7(legacy)
  const migratedUnit = productionUnits(hydrated).find(unit => unit.id === 'internal-1')

  assert.ok(migratedUnit)
  assert.equal(migratedUnit.assignedMembers, 4)
  assert.equal(hydrated.parallelProjects[0].productionUnitId, 'internal-1')
  assert.equal(hydrated.studio.team[4].productionTeamId, 'founder')
})
