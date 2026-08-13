import { CONTRACT_TEMPLATES, LOANS, PUBLISHERS } from '../data/business.js'
import { GENRES } from '../data/catalog.js'
import { makeId, randomChoice, randomInt } from './utils.js'

export function generateOpportunities(state, random = Math.random) {
  if (!state.opportunities.contracts.length || random() < 0.18) {
    state.opportunities.contracts = Array.from({ length: 3 }, () => {
      const base = randomChoice(CONTRACT_TEMPLATES, random)
      const prestige = 1 + state.player.reputation / 120
      return { ...base, id: makeId('contract'), pay: Math.round(base.pay * prestige * randomInt(90, 120, random) / 100), client: randomChoice(['Lumen Co.', 'Vértice', 'Telemax', 'Brasa Foods', 'Norte Mídia'], random) }
    })
  }
  if (state.currentProject && state.currentProject.hype >= 12 && !state.currentProject.publisher && !state.opportunities.publisherOffers.length && random() < 0.16) {
    const publisher = randomChoice(PUBLISHERS, random)
    state.opportunities.publisherOffers = [{
      ...publisher,
      id: makeId('offer'),
      projectId: state.currentProject.id,
      advance: publisherAdvance(state, publisher),
    }]
  }
}

export function acceptContract(state, contractId) {
  if (state.currentProject) return null
  const contract = state.opportunities.contracts.find(item => item.id === contractId)
  if (!contract) return null
  state.currentContract = { ...contract, monthsLeft: contract.months, started: `${state.date.month}-${state.date.year}` }
  state.opportunities.contracts = state.opportunities.contracts.filter(item => item.id !== contractId)
  return contract
}

export function workContractMonth(state) {
  const contract = state.currentContract
  if (!contract) return null
  contract.monthsLeft -= 1
  state.player.energy -= Math.round(contract.energy / contract.months)
  state.player.stress += 5
  if (contract.monthsLeft <= 0) {
    state.player.money += contract.pay
    state.player.stats[contract.skill] = Math.min(99, state.player.stats[contract.skill] + contract.gain)
    state.currentContract = null
    return contract
  }
  return false
}

export function acceptPublisher(state, offerId) {
  const offer = state.opportunities.publisherOffers.find(item => item.id === offerId)
  if (!offer || !state.currentProject || offer.projectId !== state.currentProject.id) return null
  state.currentProject.publisher = { id: offer.id, name: offer.name, style: offer.style, royalty: offer.royalty, reach: offer.reach, pressure: offer.pressure }
  state.currentProject.pressure += offer.pressure
  state.player.money += offer.advance
  state.opportunities.publisherOffers = []
  return offer
}

export function takeLoan(state, loanId) {
  const loan = LOANS.find(item => item.id === loanId)
  if (!loan || state.studio.debt.some(item => item.id === loanId)) return null
  const total = Math.round(loan.amount * (1 + loan.interest))
  state.player.money += loan.amount
  state.studio.equity += loan.equity ?? 0
  state.studio.debt.push({ id: loan.id, name: loan.name, principal: loan.amount, payment: Math.ceil(total / loan.months), monthsLeft: loan.months })
  return loan
}

export function createPublisherOfferForProject(state, random = Math.random) {
  if (!state.currentProject || state.currentProject.publisher) return null
  const publisher = randomChoice(PUBLISHERS, random)
  const preferredGenre = randomChoice(GENRES, random).id
  return { ...publisher, id: makeId('offer'), projectId: state.currentProject.id, preferredGenre, advance: publisherAdvance(state, publisher) }
}

function publisherAdvance(state, publisher) {
  const budget = state.currentProject?.estimatedCost ?? 10000
  const reputationFactor = 0.9 + state.player.reputation / 180
  return Math.round(budget * publisher.advanceFactor * reputationFactor / 100) * 100
}
