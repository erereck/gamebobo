import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateQuality, calculateRelease } from './scoring.js'
import { createInitialState } from './state.js'

const fixed = () => 0.5

const sequence = (...values) => {
  let index = 0
  return () => values[index++] ?? 0.5
}

const standardProject = {
  genre: 'rpg', focus: 'story', scale: 'micro', platform: 'pc',
  quality: 5, innovation: 2, pressure: 20, bugs: 0, reach: 0, hype: 0,
}

test('quality stays inside the supported score range', () => {
  const state = createInitialState(fixed)
  const project = { genre: 'rpg', focus: 'story', scale: 'micro', platform: 'pc', quality: 0, innovation: 0, pressure: 8 }
  const score = calculateQuality(state, project, fixed)
  assert.ok(score >= 24 && score <= 99)
})

test('a release produces positive sales and revenue', () => {
  const state = createInitialState(fixed)
  const release = calculateRelease(state, standardProject, fixed)
  assert.ok(release.sales > 0)
  assert.ok(release.revenue > 0)
  assert.ok(release.newFollowers > 0)
})

test('a normal modern production lands above disaster territory without making 80 automatic', () => {
  const state = createInitialState({ startYear: 2020 }, fixed)
  const score = calculateQuality(state, standardProject, fixed)
  assert.ok(score >= 60)
  assert.ok(score < 80)
})

test('a truly broken production can still score below 60', () => {
  const initial = createInitialState({ startYear: 2020 }, fixed)
  const state = {
    ...initial,
    player: {
      ...initial.player,
      stress: 100,
      health: 10,
      stats: { programming: 1, design: 1, art: 1, marketing: 1 },
    },
  }
  const disaster = {
    ...standardProject,
    scale: 'blockbuster',
    quality: -10,
    innovation: 0,
    pressure: 100,
    bugs: 50,
  }
  assert.ok(calculateQuality(state, disaster, fixed) < 60)
})

test('commercial culture buys reach rather than review score', () => {
  const balanced = createInitialState({ startYear: 2020 }, fixed)
  const commercial = {
    ...balanced,
    studio: { ...balanced.studio, cultureId: 'commercial' },
  }
  const balancedRelease = calculateRelease(balanced, standardProject, fixed)
  const commercialRelease = calculateRelease(commercial, standardProject, fixed)
  assert.equal(commercialRelease.score, balancedRelease.score)
  assert.ok(commercialRelease.sales > balancedRelease.sales)
})

test('a phenomenon is possible but obeys the audience ceiling of its era', () => {
  const project = {
    ...standardProject,
    scale: 'blockbuster',
    quality: 100,
    innovation: 20,
    hype: 100,
    reach: 2,
  }
  const makeState = year => {
    const initial = createInitialState({ startYear: year }, fixed)
    return {
      ...initial,
      player: {
        ...initial.player,
        followers: 10_000_000,
        stats: { programming: 100, design: 100, art: 100, marketing: 100 },
      },
    }
  }
  // luck, ordinary-sales variance, breakout, phenomenon and phenomenon multiplier
  const modern = calculateRelease(makeState(2020), project, sequence(.5, .5, 0, 0, 1))
  const early = calculateRelease(makeState(1980), project, sequence(.5, .5, 0, 0, 1))
  assert.equal(modern.phenomenon, true)
  assert.equal(modern.sales, 500_000_000)
  assert.equal(early.phenomenon, true)
  assert.equal(early.sales, 1_000_000)
})

test('a 99-point Mega Drive game earns demand from quality without needing a breakout', () => {
  const state = createInitialState({ startYear: 1991, traitId: 'perfectionist' }, fixed)
  state.player.stats = { programming: 100, design: 100, art: 100, marketing: 70, charisma: 50 }
  state.market.genre = 'action'
  state.market.angle = 'hard'
  state.market.platforms['mega-drive'] = 20
  const release = calculateRelease(state, {
    ...standardProject,
    genre: 'action',
    focus: 'gameplay',
    platform: 'mega-drive',
    quality: 30,
    innovation: 10,
    pressure: 10,
    promiseId: 'precise-controls',
    promiseFit: 2,
    launchPlan: 'standard',
  }, fixed)
  assert.equal(release.score, 99)
  assert.equal(release.breakout, false)
  assert.ok(release.sales >= 150_000)
})

test('a 94-point Mega Drive game follows distribution tiers instead of a lottery floor', () => {
  const makeState = marketing => {
    const state = createInitialState({ startYear: 1991, traitId: 'perfectionist' }, fixed)
    state.player.stats = { programming: 80, design: 80, art: 70, marketing, charisma: 50 }
    state.market.genre = 'action'
    state.market.angle = 'hard'
    state.market.platforms['mega-drive'] = 20
    return state
  }
  const project = {
    ...standardProject,
    genre: 'action', focus: 'gameplay', platform: 'mega-drive', quality: 8,
    innovation: 8, pressure: 10, promiseId: 'precise-controls', promiseFit: 2,
    launchPlan: 'standard',
  }
  const weak = calculateRelease(makeState(20), { ...project, quality: 11, launchPlan: 'shadow' }, fixed)
  const standard = calculateRelease(makeState(70), project, fixed)
  const campaign = calculateRelease(makeState(70), { ...project, launchPlan: 'campaign', hype: 14 }, fixed)
  const majorPublisher = calculateRelease(makeState(70), { ...project, launchPlan: 'campaign', hype: 14, publisher: { reach: 2.4, royalty: .42, style: 'mass' } }, fixed)
  const lifetime = release => Math.round(release.sales * 1.427)

  assert.ok([weak, standard, campaign, majorPublisher].every(release => release.score === 94))
  assert.ok(lifetime(weak) >= 300_000 && lifetime(weak) <= 600_000)
  assert.ok(lifetime(standard) >= 700_000 && lifetime(standard) <= 1_000_000)
  assert.ok(lifetime(campaign) >= 1_000_000 && lifetime(campaign) <= 1_400_000)
  assert.ok(lifetime(majorPublisher) >= 1_500_000 && lifetime(majorPublisher) <= 2_300_000)
  assert.ok(weak.sales < standard.sales && standard.sales < campaign.sales && campaign.sales < majorPublisher.sales)
})

test('press coverage follows history and stays close to the underlying quality', () => {
  const early = calculateRelease(createInitialState({ startYear: 1980 }, fixed), standardProject, fixed)
  assert.equal(early.reviews.some(review => review.outlet === 'IGN'), false)
  assert.equal(early.reviews.some(review => review.outlet === 'Canaltech'), false)
  assert.ok(early.reviews.every(review => Math.abs(review.score - early.score) <= 6))

  const modern = calculateRelease(createInitialState({ startYear: 2012 }, fixed), standardProject, fixed)
  assert.equal(modern.reviews.length, 4)
  assert.ok(modern.reviews.every(review => Math.abs(review.score - modern.score) <= 6))
  assert.equal(new Set(modern.reviews.map(review => review.quote)).size, modern.reviews.length)

  const current = calculateRelease(createInitialState({ startYear: 2020 }, fixed), standardProject, fixed)
  assert.equal(current.reviews.some(review => review.outlet === 'Computer and Video Games'), false)
})
