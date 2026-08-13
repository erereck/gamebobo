import { CORPORATE_PARTNERS, corporatePartnerById } from '../data/corporatePartners.js'
import { LICENSE_CATALOG } from '../data/licenses.js'
import { clamp, makeId, randomChoice, randomInt } from './utils.js'
import { addHistory, dateLabel } from './world.js'
import { licenseFromState } from './licensing.js'

const monthIndex = date => date.year * 12 + date.month
const scaleRank = { micro: 0, small: 1, medium: 2, large: 3, blockbuster: 4 }

export function createCorporateState(year = 2003) {
  return {
    relationships: Object.fromEntries(CORPORATE_PARTNERS.map(company => [company.id, {
      trust: company.availableFrom <= year ? 4 : 0, completed: 0, failed: 0, licensedWorks: 0, pitches: 0,
      lastPitchAt: -99999, status: 'fora do radar',
    }])),
    offers: [], partnerships: [], activeCommission: null, ownership: null, archive: [],
  }
}

export function calculateStudioValuation(state) {
  const cash = Math.max(0, state.player.money)
  const catalog = state.games.reduce((sum, game) => sum + Math.max(0, game.revenue ?? 0) * 1.35 + Math.max(0, game.sales ?? 0) * 2.4, 0)
  const team = state.studio.team.reduce((sum, person) => sum + person.skill * person.potential * 165 + person.projects * 75000 + (person.awards ?? 0) * 600000, 0)
  const ownedOriginals = new Set(state.games.filter(game => !game.licenseIds?.length).map(game => game.franchiseId)).size
  const originalIps = state.games.filter(game => !game.licenseIds?.length).reduce((sum, game) => sum + (game.score ?? 0) ** 2 * Math.max(1, Math.log10(Math.max(10, game.sales ?? 10))) * 130, 0)
  const licensePortfolio = state.licenses.active.reduce((sum, contract) => {
    const ip = licenseFromState(state, contract.licenseId)
    return sum + (ip?.popularity ?? 0) * Math.max(0, contract.expiresYear - state.date.year) * Math.max(0, contract.trust) * 1100
  }, 0)
  const reputation = (state.studio.reputation ** 2) * 16000
  const technology = state.studio.unlockedTechs.length * 900000 + state.studio.research * 18000
  const debt = state.studio.debt.reduce((sum, item) => sum + item.payment * item.monthsLeft, 0)
  const total = Math.max(250000, Math.round((cash + catalog + team + originalIps + licensePortfolio + reputation + technology - debt) / 10000) * 10000)
  return { total, cash, catalog: Math.round(catalog), team: Math.round(team), originalIps: Math.round(originalIps), licensePortfolio: Math.round(licensePortfolio), reputation: Math.round(reputation), technology: Math.round(technology), debt, ownedOriginals }
}

export const relationshipStatus = relationship => relationship.trust >= 80 ? 'confiança rara' : relationship.trust >= 60 ? 'parceiro preferencial' : relationship.trust >= 38 ? 'relação provada' : relationship.trust >= 18 ? 'em observação' : relationship.trust >= 6 ? 'primeiro contato' : 'fora do radar'

export function pitchCompany(state, companyId, random = Math.random) {
  const company = corporatePartnerById(companyId)
  const relationship = state.corporate.relationships[companyId]
  const now = monthIndex(state.date)
  if (!company || company.availableFrom > state.date.year || !relationship || now - relationship.lastPitchAt < 6) return null
  const cost = 1800 + state.studio.team.length * 350
  if (state.player.money < cost) return null
  state.player.money -= cost
  relationship.lastPitchAt = now
  relationship.pitches += 1
  const avgScore = state.games.length ? state.games.slice(0, 5).reduce((sum, game) => sum + game.score, 0) / Math.min(5, state.games.length) : 0
  const proof = state.player.reputation * .25 + state.studio.reputation * .2 + avgScore * .25 + state.games.length * 1.5 + state.studio.team.length
  const gain = proof < 18 ? 1 : clamp(Math.round(proof / 12) + randomInt(-1, 2, random), 2, 9)
  relationship.trust = clamp(relationship.trust + gain, 0, 100)
  relationship.status = relationshipStatus(relationship)
  addHistory(state, `Portfólio enviado para ${company.name}`, `A conversa custou ${cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}. Confiança agora: ${relationship.trust}.`, { kind: 'corporate' })
  return { gain, cost }
}

export function partnershipEligibility(state, companyId) {
  const company = corporatePartnerById(companyId)
  const relationship = state.corporate.relationships[companyId]
  const reasons = []
  if (!company || company.availableFrom > state.date.year) reasons.push('Empresa ainda não participa deste mercado.')
  if ((relationship?.trust ?? 0) < 38) reasons.push(`Confiança ${relationship?.trust ?? 0}/38.`)
  if (state.games.length < 2) reasons.push(`Catálogo ${state.games.length}/2 jogos.`)
  if (state.studio.reputation < 28) reasons.push(`Reputação do estúdio ${state.studio.reputation}/28.`)
  if (state.corporate.partnerships.some(item => item.companyId === companyId)) reasons.push('Parceria já assinada.')
  return { allowed: reasons.length === 0, reasons }
}

export function requestPartnership(state, companyId, random = Math.random) {
  const eligible = partnershipEligibility(state, companyId)
  const company = corporatePartnerById(companyId)
  if (!company || !eligible.allowed || state.corporate.offers.some(item => item.companyId === companyId)) return null
  const relationship = state.corporate.relationships[companyId]
  const offer = { id: makeId('corporate-offer'), type: 'partnership', companyId, monthsLeft: 4, reach: .06 + Math.min(.08, relationship.trust / 1000), funding: 25000 + state.games.length * 5000, termYears: 3, exclusivity: 0 }
  state.corporate.offers.unshift(offer)
  return offer
}

const commissionEligibility = (state, companyId) => {
  const relationship = state.corporate.relationships[companyId]
  return Boolean(relationship && relationship.trust >= 58 && state.player.reputation >= 42 && state.studio.reputation >= 38 && state.games.length >= 3 && !state.corporate.activeCommission)
}

export function createCommissionOffer(state, companyId, random = Math.random) {
  const company = corporatePartnerById(companyId)
  if (!company || !commissionEligibility(state, companyId) || state.corporate.offers.some(item => item.companyId === companyId && item.type === 'commission')) return null
  const candidates = company.ipIds.map(id => licenseFromState(state, id)).filter(ip => ip && ip.availableFrom <= state.date.year)
  if (!candidates.length) return null
  const ip = randomChoice(candidates, random)
  const genres = ip.genres.filter(id => state.world.knownGenres.some(genre => genre.id === id))
  const oddGenres = ['puzzle', 'simulation', 'racing', 'strategy'].filter(id => state.world.knownGenres.some(genre => genre.id === id))
  const offbeat = state.corporate.relationships[companyId].trust >= 72 && oddGenres.length && random() < .28
  const genre = offbeat ? randomChoice(oddGenres, random) : genres.length ? randomChoice(genres, random) : randomChoice(state.world.knownGenres, random).id
  const concept = offbeat ? randomChoice(['Spin-off de bolso', 'Experimento lateral', 'Jogo de festival', 'Projeto menor entre lançamentos'], random) : randomChoice(['Capítulo paralelo', 'Projeto de catálogo', 'Nova leitura da franquia', 'Produção principal'], random)
  const valuation = calculateStudioValuation(state).total
  const offer = {
    id: makeId('corporate-offer'), type: 'commission', companyId, licenseId: ip.id, genre, concept, offbeat: Boolean(offbeat),
    monthsLeft: 4, deadlineMonths: randomInt(12, 22, random), scoreFloor: randomInt(76, 84, random),
    upfront: Math.round(Math.max(50000, valuation * .012) / 10000) * 10000,
    bonus: Math.round(Math.max(180000, valuation * .04) / 10000) * 10000,
    royalty: .08, creativeFreedom: clamp(Math.min(35 + state.corporate.relationships[companyId].trust / 2, state.corporate.ownership?.companyId === companyId ? state.corporate.ownership.autonomy + 10 : 100), 40, 88),
    parentMandate: state.corporate.ownership?.companyId === companyId,
  }
  state.corporate.offers.unshift(offer)
  return offer
}

export function acquisitionEligibility(state, companyId) {
  const company = corporatePartnerById(companyId)
  const relationship = state.corporate.relationships[companyId]
  const valuation = calculateStudioValuation(state)
  const reasons = []
  if (!company || company.availableFrom > state.date.year) reasons.push('Empresa indisponível.')
  if (state.corporate.ownership) reasons.push('O estúdio já possui controladora.')
  if ((relationship?.trust ?? 0) < 72) reasons.push(`Confiança ${relationship?.trust ?? 0}/72.`)
  if (state.games.length < 5) reasons.push(`Catálogo ${state.games.length}/5 jogos.`)
  if (state.studio.team.length < 3) reasons.push(`Equipe ${state.studio.team.length}/3 pessoas.`)
  if (state.studio.reputation < 58) reasons.push(`Reputação ${state.studio.reputation}/58.`)
  if (valuation.total < (company?.acquisitionFloor ?? Infinity)) reasons.push('Valor ainda abaixo do radar de aquisição.')
  return { allowed: reasons.length === 0, reasons, valuation }
}

export function createAcquisitionOffer(state, companyId, random = Math.random) {
  const company = corporatePartnerById(companyId)
  const eligible = acquisitionEligibility(state, companyId)
  if (!company || !eligible.allowed || state.corporate.offers.some(item => item.type === 'acquisition')) return null
  const premium = randomInt(118, 152, random) / 100
  const price = Math.round(eligible.valuation.total * premium / 100000) * 100000
  const offer = { id: makeId('corporate-offer'), type: 'acquisition', companyId, monthsLeft: 5, price, autonomy: company.autonomy, retainedBrand: random() > .18, earnout: Math.round(price * .16), valuation: eligible.valuation }
  state.corporate.offers.unshift(offer)
  return offer
}

function grantCommissionLicense(state, offer) {
  const ip = licenseFromState(state, offer.licenseId)
  if (!ip) return null
  const existing = state.licenses.active.find(item => item.licenseId === ip.id)
  if (existing) return existing
  const contract = { id: makeId('license-contract'), licenseId: ip.id, owner: ip.owner, started: dateLabel(state.date), startYear: state.date.year, startMonth: state.date.month, expiresYear: state.date.year + 3, expiresMonth: state.date.month, upfront: 0, royalty: offer.royalty, exclusive: false, trust: 55, projects: 0, breaches: 0, status: 'active', clauses: [...ip.clauses], corporateCommission: true }
  state.licenses.active.unshift(contract)
  return contract
}

export function respondCorporateOffer(state, offerId, response, random = Math.random) {
  const offer = state.corporate.offers.find(item => item.id === offerId)
  if (!offer) return null
  if (offer.type === 'commission' && response === 'accept' && (state.currentProject || state.currentContract || state.corporate.activeCommission)) return null
  const company = corporatePartnerById(offer.companyId)
  const relationship = state.corporate.relationships[offer.companyId]
  if (response === 'reject') {
    relationship.trust = clamp(relationship.trust - (offer.type === 'acquisition' ? 3 : 1), 0, 100)
    state.corporate.offers = state.corporate.offers.filter(item => item.id !== offerId)
    addHistory(state, `Proposta da ${company.name} recusada`, 'A porta continua aberta, mas a empresa anotou a resposta.', { highlight: offer.type === 'acquisition', kind: 'corporate' })
    return { rejected: true, offer }
  }
  if (response === 'counter' && offer.type === 'acquisition') {
    const chance = .3 + state.player.stats.charisma / 200 + relationship.trust / 500
    if (random() < chance) {
      offer.price = Math.round(offer.price * randomInt(108, 122, random) / 100000) * 100000
      offer.autonomy = Math.max(20, offer.autonomy - randomInt(2, 7, random))
      offer.countered = true
      return { countered: true, offer }
    }
    relationship.trust = clamp(relationship.trust - 5, 0, 100)
    state.corporate.offers = state.corporate.offers.filter(item => item.id !== offerId)
    return { countered: false, offer }
  }
  if (response !== 'accept') return null
  if (offer.type === 'partnership') {
    state.corporate.partnerships.push({ id: makeId('partnership'), companyId: offer.companyId, startedYear: state.date.year, expiresYear: state.date.year + offer.termYears, reach: offer.reach, exclusivity: offer.exclusivity, projects: 0 })
    state.player.money += offer.funding
    relationship.trust = clamp(relationship.trust + 6, 0, 100)
  }
  if (offer.type === 'commission') {
    grantCommissionLicense(state, offer)
    state.player.money += offer.upfront
    state.corporate.activeCommission = { ...offer, accepted: dateLabel(state.date), monthsLeft: offer.deadlineMonths, projectId: null }
    relationship.trust = clamp(relationship.trust + 2, 0, 100)
  }
  if (offer.type === 'acquisition') {
    const founderShare = Math.max(.15, 1 - (state.studio.equity ?? 0))
    const payout = Math.round(offer.price * founderShare)
    state.player.money += payout
    state.studio.equity = .75
    state.studio.parentCompany = company.name
    state.studio.autonomy = offer.autonomy
    state.corporate.ownership = { companyId: offer.companyId, acquiredYear: state.date.year, price: offer.price, founderPayout: payout, autonomy: offer.autonomy, retainedBrand: offer.retainedBrand, earnout: offer.earnout }
    relationship.trust = clamp(relationship.trust + 10, 0, 100)
  }
  relationship.status = relationshipStatus(relationship)
  state.corporate.archive.unshift({ ...offer, answered: dateLabel(state.date), result: 'accepted' })
  state.corporate.offers = state.corporate.offers.filter(item => item.id !== offerId)
  addHistory(state, offer.type === 'acquisition' ? `${company.name} comprou ${state.studio.name}` : offer.type === 'commission' ? `${company.name} encomendou um jogo` : `Parceria assinada com ${company.name}`, offer.type === 'acquisition' ? `Negócio de ${offer.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}; autonomia inicial em ${offer.autonomy}%.` : 'A relação deixou de ser só conversa.', { highlight: true, kind: 'corporate' })
  return offer
}

export function attachCommissionToProject(state, project) {
  const commission = state.corporate.activeCommission
  if (!commission) return
  commission.projectId = project.id
  project.corporateCommissionId = commission.id
  project.reach = (project.reach ?? 0) + .12
  project.pressure += Math.round((100 - commission.creativeFreedom) / 8)
}

export function resolveCorporateRelease(state, game) {
  const commission = state.corporate.activeCommission
  if (!commission || commission.projectId !== game.id && game.corporateCommissionId !== commission.id) return null
  const company = corporatePartnerById(commission.companyId)
  const relationship = state.corporate.relationships[commission.companyId]
  const success = game.score >= commission.scoreFloor
  const bonus = success ? Math.round(commission.bonus * (1 + Math.max(0, game.score - commission.scoreFloor) / 80)) : Math.round(commission.bonus * .2)
  state.player.money += bonus
  relationship.completed += success ? 1 : 0
  relationship.failed += success ? 0 : 1
  relationship.trust = clamp(relationship.trust + (success ? Math.round((game.score - commission.scoreFloor) / 2) + 10 : -14), 0, 100)
  relationship.status = relationshipStatus(relationship)
  state.corporate.archive.unshift({ ...commission, result: success ? 'delivered' : 'missed-score', score: game.score, gameId: game.id, answered: dateLabel(state.date), bonus })
  state.corporate.partnerships.filter(item => item.companyId === commission.companyId).forEach(item => { item.projects += 1 })
  state.corporate.activeCommission = null
  state.queue.push({ id: makeId('corporate-result'), kind: 'info', tag: success ? 'ENTREGA APROVADA' : 'ENTREGA ACEITA, RELAÇÃO FERIDA', title: success ? `${company.name} quer trabalhar de novo` : `${company.name} esperava mais`, body: success ? `${game.title} bateu a meta e liberou ${bonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}. A próxima conversa terá menos supervisão.` : `${game.title} ficou abaixo da nota ${commission.scoreFloor}. Parte do bônus entrou, mas a confiança caiu.`, details: [`NOTA ${game.score}`, `CONFIANÇA ${relationship.trust}`, success ? 'HISTÓRICO ENTREGUE' : 'PORTA MAIS ESTREITA'] })
  return { success, bonus }
}

export function recordCorporateRelease(state, game) {
  const licenseIds = game.licenseIds ?? []
  CORPORATE_PARTNERS.forEach(company => {
    const relationship = state.corporate.relationships[company.id]
    if (!relationship || company.availableFrom > state.date.year) return
    const handledIp = licenseIds.some(id => company.ipIds.includes(id))
    const specialtyFit = company.specialty === game.genre
    if (!handledIp && !(specialtyFit && game.score >= 86)) return
    const gain = handledIp ? clamp(Math.round((game.score - 62) / 6), -5, 7) : 1
    relationship.trust = clamp(relationship.trust + gain, 0, 100)
    if (handledIp) relationship.licensedWorks = (relationship.licensedWorks ?? 0) + 1
    relationship.status = relationshipStatus(relationship)
  })
}

export function tickCorporate(state, random = Math.random) {
  state.corporate.offers.forEach(offer => { offer.monthsLeft -= 1 })
  state.corporate.offers = state.corporate.offers.filter(offer => offer.monthsLeft > 0)
  state.corporate.partnerships = state.corporate.partnerships.filter(item => item.expiresYear >= state.date.year)
  if (state.corporate.activeCommission) {
    state.corporate.activeCommission.monthsLeft -= 1
    if (state.corporate.activeCommission.monthsLeft <= 0) {
      const commission = state.corporate.activeCommission
      const company = corporatePartnerById(commission.companyId)
      const relationship = state.corporate.relationships[commission.companyId]
      relationship.trust = clamp(relationship.trust - 20, 0, 100)
      relationship.failed += 1
      state.corporate.archive.unshift({ ...commission, result: 'expired', answered: dateLabel(state.date) })
      state.corporate.activeCommission = null
      state.queue.push({ id: makeId('corporate-fail'), kind: 'info', tag: 'PRAZO PERDIDO', title: `${company.name} recolheu o projeto`, body: 'A janela acabou antes da entrega. O adiantamento não volta, mas a confiança também não.', details: ['-20 CONFIANÇA', 'BRIEF ENCERRADO', 'IP DEVOLVIDA'] })
    }
  }
  const parent = state.corporate.ownership
  if (parent) {
    const support = Math.round((state.studio.monthlyBurn ?? 0) * .18)
    state.player.money += support
  }
  if (state.queue.some(item => item.kind === 'decision') || state.corporate.offers.length >= 2) return
  const available = CORPORATE_PARTNERS.filter(company => company.availableFrom <= state.date.year)
  const commissionCompany = available.find(company => commissionEligibility(state, company.id) && random() < (state.corporate.ownership?.companyId === company.id ? .11 : state.corporate.partnerships.some(item => item.companyId === company.id) ? .065 : .025))
  if (commissionCompany) {
    const offer = createCommissionOffer(state, commissionCompany.id, random)
    if (offer) state.queue.push({ id: makeId('corporate-mail'), kind: 'info', tag: 'CARTA COM PAPEL BOM', title: `${commissionCompany.name} quer um jogo seu`, body: `Não é uma licença aberta. É uma encomenda com IP, meta de nota e prazo. A carta está na mesa do estúdio.`, details: ['BRIEF CORPORATIVO', `${offer.monthsLeft} MESES PARA RESPONDER`, 'CONFIANÇA COBRADA'] })
    return
  }
  if (state.date.month === 0) {
    const buyer = available.find(company => acquisitionEligibility(state, company.id).allowed && random() < .08)
    if (buyer) {
      const offer = createAcquisitionOffer(state, buyer.id, random)
      if (offer) state.queue.push({ id: makeId('acquisition-mail'), kind: 'info', tag: 'A CONVERSA MUDOU DE TAMANHO', title: `${buyer.name} perguntou quanto custa o estúdio`, body: 'Equipe, catálogo, tecnologia, reputação e acordos de IP foram colocados numa planilha. Há uma proposta de controle na mesa.', details: ['OFERTA DE AQUISIÇÃO', 'AUTONOMIA NEGOCIÁVEL', 'NÃO É FIM DE JOGO'] })
    }
  }
}

export const availableCorporatePartners = state => CORPORATE_PARTNERS.filter(company => company.availableFrom <= state.date.year)
export const corporateCompanyByIp = licenseId => CORPORATE_PARTNERS.find(company => company.ipIds.includes(licenseId))
export const minimumScaleMet = (actual, required = 'small') => (scaleRank[actual] ?? 0) >= (scaleRank[required] ?? 0)
