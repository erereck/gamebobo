import { LICENSE_CATALOG, LICENSE_KINDS } from '../data/licenses.js'
import { LICENSE_CLAUSES } from '../data/licenseClauses.js'
import { clamp, makeId, randomChoice, randomInt } from './utils.js'
import { addHistory, dateLabel } from './world.js'

const eraPriceFactor = year => year < 1990 ? .08 : year < 2000 ? .22 : year < 2010 ? .52 : year < 2020 ? .82 : 1

export function createLicensingState(year = 2003) {
  return {
    mode: 'historical-reference',
    catalog: Object.fromEntries(LICENSE_CATALOG.map(ip => [ip.id, { popularity: ip.popularity, prestige: ip.prestige, trust: 50, history: [] }])),
    active: [],
    offers: [],
    exclusives: [],
    auctions: [],
    negotiations: [],
    lastAuctionYear: year - 1,
    customCatalog: [],
  }
}

export const licensesForState = state => [...LICENSE_CATALOG, ...(state.licenses?.customCatalog ?? [])]
export const licenseFromState = (state, id) => licensesForState(state).find(item => item.id === id)

export function quoteLicense(state, licenseId) {
  const ip = licenseFromState(state, licenseId)
  const dynamic = state.licenses.catalog[licenseId]
  if (!ip || !dynamic) return null
  const fame = .7 + dynamic.popularity / 200
  const trust = 1.08 - dynamic.trust / 500
  return Math.max(120000, Math.round(ip.baseCost * eraPriceFactor(state.date.year) * fame * trust / 10000) * 10000)
}

export function licenseEligibility(state, licenseId) {
  const ip = licenseFromState(state, licenseId)
  if (!ip) return { allowed: false, reasons: ['IP fora do catálogo.'] }
  const reasons = []
  if (state.date.year < ip.availableFrom) reasons.push(`Direitos entram no mercado em ${ip.availableFrom}.`)
  if (state.player.reputation < ip.minReputation) reasons.push(`Reputação ${state.player.reputation}/${ip.minReputation}.`)
  if (state.awards.trophies.length < ip.minTrophies) reasons.push(`Exige ${ip.minTrophies} troféu${ip.minTrophies === 1 ? '' : 's'}; você tem ${state.awards.trophies.length}.`)
  if (state.licenses.active.some(item => item.licenseId === licenseId)) reasons.push('Já existe um contrato ativo.')
  const exclusive = state.licenses.exclusives.find(item => item.licenseId === licenseId && item.expiresYear >= state.date.year)
  if (exclusive) reasons.push(`${exclusive.holder} controla os direitos exclusivos até ${exclusive.expiresYear}.`)
  return { allowed: !reasons.length, reasons }
}

export function requestLicense(state, licenseId, random = Math.random) {
  const ip = licenseFromState(state, licenseId)
  const eligibility = licenseEligibility(state, licenseId)
  if (!ip) return null
  if (!eligibility.allowed) {
    state.licenses.negotiations.unshift({ id: makeId('negotiation'), licenseId, date: dateLabel(state.date), result: 'refused', note: eligibility.reasons[0] })
    state.queue.push({ id: makeId('license-refusal'), kind: 'info', tag: 'PEDIDO RECUSADO', title: `${ip.owner} não abriu a mesa`, body: eligibility.reasons.join(' '), details: ['SEM COBRANÇA', ip.name.toUpperCase(), 'TENTE MAIS TARDE'] })
    return null
  }
  const dynamic = state.licenses.catalog[licenseId]
  const quote = quoteLicense(state, licenseId)
  const confidence = state.player.reputation + state.studio.reputation * .35 + dynamic.trust * .25
  if (confidence < ip.minReputation + 20 && random() < .32) {
    dynamic.trust = clamp(dynamic.trust - 2, 0, 100)
    state.licenses.negotiations.unshift({ id: makeId('negotiation'), licenseId, date: dateLabel(state.date), result: 'refused', note: 'O catálogo publicado ainda parece curto.' })
    state.queue.push({ id: makeId('license-refusal'), kind: 'info', tag: 'NEGOCIAÇÃO ENCERRADA', title: `${ip.owner} pediu mais histórico`, body: `A conversa sobre ${ip.name} terminou antes dos valores. O licenciante quer ver mais consistência no catálogo.`, details: ['SEM COBRANÇA', `CONFIANÇA ${dynamic.trust}`, 'PORTA ENTREABERTA'] })
    return null
  }
  const offer = {
    id: makeId('license-offer'), licenseId, created: dateLabel(state.date), monthsLeft: 4,
    upfront: Math.round(quote * randomInt(92, 108, random) / 100),
    royalty: clamp(ip.royalty + randomInt(-2, 3, random) / 100, .08, .24),
    durationYears: ip.durationYears,
    exclusive: random() < .16,
  }
  state.licenses.offers = state.licenses.offers.filter(item => item.licenseId !== licenseId)
  state.licenses.offers.unshift(offer)
  state.licenses.negotiations.unshift({ id: makeId('negotiation'), licenseId, date: dateLabel(state.date), result: 'offer', note: `${offer.durationYears} anos, ${Math.round(offer.royalty * 100)}% sobre vendas.` })
  addHistory(state, `Proposta por ${ip.name}`, `${ip.owner} colocou valores e condições na mesa.`, { highlight: true, kind: 'license' })
  return offer
}

const createContract = (state, offer) => {
  const ip = licenseFromState(state, offer.licenseId)
  const contract = {
    id: makeId('license-contract'), licenseId: offer.licenseId, owner: ip.owner,
    started: dateLabel(state.date), startYear: state.date.year, startMonth: state.date.month,
    expiresYear: state.date.year + offer.durationYears, expiresMonth: state.date.month,
    upfront: offer.upfront, royalty: offer.royalty, exclusive: offer.exclusive,
    trust: 50, projects: 0, breaches: 0, status: 'active', clauses: [...ip.clauses],
  }
  state.licenses.active.unshift(contract)
  return contract
}

export function acceptLicenseOffer(state, offerId) {
  const offer = state.licenses.offers.find(item => item.id === offerId)
  if (!offer || state.player.money < offer.upfront) return null
  const ip = licenseFromState(state, offer.licenseId)
  if (offer.renewalContractId) {
    const existing = state.licenses.active.find(item => item.id === offer.renewalContractId)
    if (!existing) return null
    state.player.money -= offer.upfront
    existing.expiresYear += offer.durationYears
    existing.royalty = offer.royalty
    existing.upfront += offer.upfront
    existing.trust = clamp(existing.trust + 4, 0, 100)
    state.licenses.offers = state.licenses.offers.filter(item => item.id !== offerId)
    addHistory(state, `Direitos de ${ip.name} renovados`, `Nova vigência até ${existing.expiresYear}; royalties em ${Math.round(existing.royalty * 100)}%.`, { highlight: true, kind: 'license' })
    return existing
  }
  state.player.money -= offer.upfront
  const contract = createContract(state, offer)
  state.licenses.offers = state.licenses.offers.filter(item => item.id !== offerId)
  if (contract.exclusive) state.licenses.exclusives.push({ licenseId: offer.licenseId, holder: state.studio.name, expiresYear: contract.expiresYear, player: true })
  addHistory(state, `Direitos de ${ip.name} assinados`, `${offer.durationYears} anos e ${Math.round(offer.royalty * 100)}% de royalties.`, { highlight: true, kind: 'license' })
  return contract
}

export function renewLicense(state, contractId, random = Math.random) {
  const contract = state.licenses.active.find(item => item.id === contractId)
  if (!contract) return null
  const ip = licenseFromState(state, contract.licenseId)
  const dynamic = state.licenses.catalog[contract.licenseId]
  if (contract.trust < 35 || dynamic.trust < 35) {
    state.queue.push({ id: makeId('renewal-refusal'), kind: 'info', tag: 'SEM RENOVAÇÃO', title: `${ip.owner} encerrou a conversa`, body: `A confiança em torno de ${ip.name} está baixa demais para um novo contrato.`, details: [`CONFIANÇA ${Math.min(contract.trust, dynamic.trust)}`, 'CONTRATO VAI EXPIRAR', 'SEM REEMBOLSO'] })
    return null
  }
  const upfront = Math.round(quoteLicense(state, ip.id) * (1.05 + contract.projects * .08))
  const offer = { id: makeId('license-offer'), licenseId: ip.id, renewalContractId: contract.id, monthsLeft: 3, created: dateLabel(state.date), upfront, royalty: clamp(ip.royalty + randomInt(-1, 3, random) / 100, .08, .24), durationYears: ip.durationYears, exclusive: contract.exclusive }
  state.licenses.offers.unshift(offer)
  return offer
}

export function placeLicenseBid(state, auctionId, amount) {
  const auction = state.licenses.auctions.find(item => item.id === auctionId)
  const bid = Math.round(Number(amount) || 0)
  if (!auction || !licenseEligibility(state, auction.licenseId).allowed || bid < auction.minimum || bid > state.player.money) return false
  auction.playerBid = bid
  auction.bids = auction.bids.filter(item => !item.player)
  auction.bids.push({ bidder: state.studio.name, amount: bid, player: true, royalty: auction.royalty })
  auction.minimum = Math.round(bid * 1.08 / 10000) * 10000
  return true
}

function resolveAuction(state, auction) {
  const ip = licenseFromState(state, auction.licenseId)
  const winner = [...auction.bids].sort((a, b) => b.amount - a.amount)[0]
  if (!winner) return
  if (winner.player && state.player.money >= winner.amount) {
    state.player.money -= winner.amount
    createContract(state, { licenseId: auction.licenseId, upfront: winner.amount, royalty: winner.royalty, durationYears: auction.durationYears, exclusive: true })
  }
  const holder = winner.player ? state.studio.name : winner.bidder
  state.licenses.exclusives = state.licenses.exclusives.filter(item => item.licenseId !== auction.licenseId)
  state.licenses.exclusives.push({ licenseId: auction.licenseId, holder, expiresYear: state.date.year + auction.durationYears, player: Boolean(winner.player) })
  state.queue.push({ id: makeId('auction-result'), kind: 'info', tag: 'DIREITOS EXCLUSIVOS', title: `${holder} ficou com ${ip.name}`, body: `${winner.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} garantiram uma janela de ${auction.durationYears} anos.`, details: [winner.player ? 'VOCÊ VENCEU' : 'MERCADO FECHADO', `ROYALTY ${Math.round(winner.royalty * 100)}%`, `ATÉ ${state.date.year + auction.durationYears}`] })
  addHistory(state, `${holder} venceu a disputa por ${ip.name}`, `Direitos exclusivos até ${state.date.year + auction.durationYears}.`, { highlight: true, kind: 'license' })
}

export function competitorBidCapacity(studio, year) {
  const age = Math.max(0, year - (studio.founded ?? year))
  const catalogSales = (studio.games ?? []).reduce((sum, game) => sum + (game.sales ?? 0), 0)
  if (studio.cohort) {
    const garageBase = year < 1985 ? 35000 : year < 1995 ? 140000 : year < 2005 ? 360000 : year < 2015 ? 900000 : 1600000
    return Math.round(garageBase + age * garageBase * .42 + catalogSales * 3.2)
  }
  const majorBase = year < 1985 ? 1800000 : year < 1995 ? 14000000 : year < 2005 ? 38000000 : year < 2015 ? 90000000 : 180000000
  const maturity = clamp(.55 + age / 28, .55, 1.45)
  return Math.round(majorBase * maturity + catalogSales * 5)
}

function maybeCreateAuction(state, random) {
  if (state.licenses.auctions.length || state.date.year === state.licenses.lastAuctionYear || random() > .045) return
  const candidates = licensesForState(state).filter(ip => ip.availableFrom <= state.date.year && !state.licenses.active.some(item => item.licenseId === ip.id) && !state.licenses.exclusives.some(item => item.licenseId === ip.id && item.expiresYear >= state.date.year))
  if (!candidates.length) return
  const ip = randomChoice(candidates, random)
  const base = quoteLicense(state, ip.id)
  const bidders = [...state.competitors].sort(() => random() - .5)
  const bids = bidders.map(studio => {
    const capacity = competitorBidCapacity(studio, state.date.year)
    const desired = base * randomInt(72, 118, random) / 100
    const amount = Math.floor(Math.min(desired, capacity * .55) / 10000) * 10000
    return { bidder: studio.name, amount, royalty: clamp(ip.royalty + randomInt(-2, 4, random) / 100, .08, .24), player: false, studioId: studio.id }
  }).filter(bid => bid.amount >= Math.max(10000, base * .4)).slice(0, 3)
  if (!bids.length) return
  state.licenses.auctions.push({ id: makeId('license-auction'), licenseId: ip.id, monthsLeft: 3, durationYears: ip.durationYears, royalty: ip.royalty, bids, playerBid: null, minimum: Math.round(Math.max(...bids.map(item => item.amount)) * 1.08 / 10000) * 10000 })
  state.licenses.lastAuctionYear = state.date.year
}

export function tickLicensing(state, random = Math.random) {
  state.licenses.offers.forEach(offer => { offer.monthsLeft -= 1 })
  state.licenses.offers = state.licenses.offers.filter(offer => offer.monthsLeft > 0)
  state.licenses.exclusives = state.licenses.exclusives.filter(item => item.expiresYear >= state.date.year)
  state.licenses.active.forEach(contract => {
    const expired = state.date.year > contract.expiresYear || (state.date.year === contract.expiresYear && state.date.month >= contract.expiresMonth)
    if (!expired) return
    contract.status = 'expired'
    const ip = licenseFromState(state, contract.licenseId)
    state.queue.push({ id: makeId('license-expired'), kind: 'info', tag: 'CONTRATO ENCERRADO', title: `${ip.name} voltou ao mercado`, body: `${ip.owner} encerrou a vigência. Jogos já lançados continuam no seu histórico, mas projetos novos não podem usar a IP.`, details: [`${contract.projects} PROJETO(S)`, `CONFIANÇA ${contract.trust}`, contract.breaches ? `${contract.breaches} VIOLAÇÃO(ÕES)` : 'SEM VIOLAÇÕES'] })
  })
  state.licenses.active = state.licenses.active.filter(item => item.status === 'active')
  state.licenses.auctions.forEach(auction => { auction.monthsLeft -= 1 })
  state.licenses.auctions.filter(item => item.monthsLeft <= 0).forEach(auction => resolveAuction(state, auction))
  state.licenses.auctions = state.licenses.auctions.filter(item => item.monthsLeft > 0)
  maybeCreateAuction(state, random)
}

export function projectLicenseReadout(state, project) {
  const ids = project.licenseIds ?? []
  const ips = ids.map(id => licenseFromState(state, id)).filter(Boolean)
  const contracts = ids.map(id => state.licenses.active.find(item => item.licenseId === id)).filter(Boolean)
  const royalty = contracts.reduce((sum, item) => sum + item.royalty, 0)
  const genreFit = ips.filter(ip => ip.genres.includes(project.genre)).length
  const themeFit = ips.filter(ip => ip.themes.includes(project.theme)).length
  const crossover = ids.length === 2
  const forbiddenCrossover = crossover && contracts.some(contract => contract.clauses.includes('noCrossover'))
  const familyMismatch = contracts.some(contract => contract.clauses.includes('familyRating')) && (project.genre === 'horror' || project.theme === 'crime')
  return {
    ips, contracts, royalty, crossover, forbiddenCrossover,
    qualityBonus: genreFit * 3 + themeFit * 2 - (crossover ? 2 : 0),
    reachMultiplier: ids.length ? 1 + ips.reduce((sum, ip) => sum + (state.licenses.catalog[ip.id]?.popularity ?? ip.popularity), 0) / 360 : 1,
    volatility: (crossover ? 10 : ids.length ? 3 : 0) + (familyMismatch ? 7 : 0),
    familyMismatch,
  }
}

export function maybeQueueLicenseEvent(state, random = Math.random) {
  const project = state.currentProject
  if (!project?.licenseIds?.length || state.queue.some(item => item.kind === 'decision') || project.licenseEventIds?.length >= 2 || random() > .13) return
  const licenseId = randomChoice(project.licenseIds, random)
  const ip = licenseFromState(state, licenseId)
  const contract = state.licenses.active.find(item => item.licenseId === licenseId)
  if (!contract) return
  project.licenseEventIds ??= []
  const eventId = project.licenseIds.length === 2 ? 'crossover-approval' : randomChoice(['script-note', 'brand-review'], random)
  if (project.licenseEventIds.includes(eventId)) return
  project.licenseEventIds.push(eventId)
  const events = {
    'crossover-approval': { title: `Quem cede na capa de ${project.title}?`, body: `${ip.owner} quer seu personagem em primeiro plano. O outro licenciante mandou a mesma exigência.`, choices: [
      { id: 'split', label: 'Dividir o destaque', outcome: 'A composição ficou mais trabalhosa, mas ninguém saiu humilhado.', effects: { project: { quality: 2, months: 1 }, license: { trust: 2 } } },
      { id: 'pick', label: `Dar razão a ${ip.owner}`, outcome: 'A aprovação veio rápido. O outro lado anotou o desaforo.', effects: { project: { hype: 5 }, license: { trust: 4, otherTrust: -6 } } },
    ] },
    'script-note': { title: `${ip.owner} devolveu o roteiro`, body: `Uma cena de ${project.title} passou perto demais de quebrar as regras de ${ip.name}.`, choices: [
      { id: 'rewrite', label: 'Reescrever a cena', outcome: 'O cronograma perdeu tempo; a relação ficou limpa.', effects: { project: { months: 1, quality: 2 }, license: { trust: 4 } } },
      { id: 'negotiate', label: 'Defender a ideia', outcome: 'A cena ficou. A conversa deixou marcas.', effects: { project: { innovation: 3, pressure: 5 }, license: { trust: -7, breach: 1 } } },
    ] },
    'brand-review': { title: `Aprovação visual de ${ip.name}`, body: `O guia de marca e a direção do jogo discordam em detalhes que ninguém percebe até virar manchete.`, choices: [
      { id: 'guide', label: 'Seguir o guia', outcome: 'A IP ficou reconhecível e a equipe refez algumas telas.', effects: { project: { months: 1 }, license: { trust: 3 } } },
      { id: 'voice', label: 'Manter nossa leitura', outcome: 'O jogo ganhou personalidade e uma advertência contratual.', effects: { project: { quality: 3, innovation: 2 }, license: { trust: -5, breach: 1 } } },
    ] },
  }
  const event = events[eventId]
  state.queue.push({ id: makeId('license-decision'), kind: 'decision', source: 'license', eventId, tag: 'MESA DE DIREITOS', title: event.title, body: event.body, choices: event.choices, context: { licenseId } })
}

export function recordLicensedRelease(state, game) {
  if (!game.licenseIds?.length) return
  game.licenseIds.forEach(licenseId => {
    const ip = licenseFromState(state, licenseId)
    const dynamic = state.licenses.catalog[licenseId]
    const contract = state.licenses.active.find(item => item.licenseId === licenseId)
    if (!ip || !dynamic) return
    const popDelta = clamp(Math.round((game.score - 64) / 6 + Math.log10(Math.max(1, game.sales)) - 4), -8, 12)
    dynamic.popularity = clamp(dynamic.popularity + popDelta, 10, 100)
    dynamic.trust = clamp(dynamic.trust + Math.round((game.score - 68) / 5), 0, 100)
    dynamic.history.unshift({ id: game.id, year: state.date.year, title: game.title, studio: state.studio.name, score: game.score, sales: game.sales, popularityDelta: popDelta })
    if (contract) {
      contract.projects += 1
      contract.trust = clamp(contract.trust + Math.round((game.score - 68) / 4), 0, 100)
    }
    const direction = popDelta > 0 ? `Popularidade ${dynamic.popularity - popDelta} → ${dynamic.popularity}.` : popDelta < 0 ? `Popularidade caiu para ${dynamic.popularity}.` : 'O interesse pela franquia não mudou.'
    addHistory(state, `${game.title} mexeu com ${ip.name}`, direction, { highlight: Math.abs(popDelta) >= 5, kind: 'license' })
  })
}

export const clauseList = contract => contract.clauses.map(id => LICENSE_CLAUSES[id]).filter(Boolean)

export function importLicensePack(state, rawPack) {
  const items = Array.isArray(rawPack) ? rawPack : rawPack?.licenses
  if (!Array.isArray(items)) {
    state.queue.push({ id: makeId('license-pack-error'), kind: 'info', tag: 'ARQUIVO RECUSADO', title: 'Esse pacote não abriu', body: 'O JSON precisa ser válido e conter um array chamado “licenses”.', details: ['NADA FOI ALTERADO', 'VEJA LICENSE_PACKS.MD', 'TENTE OUTRO ARQUIVO'] })
    return { imported: 0, errors: ['O arquivo precisa conter um array "licenses".'] }
  }
  const existingIds = new Set(licensesForState(state).map(item => item.id))
  const kinds = new Set(LICENSE_KINDS.map(item => item.id))
  const validClauses = new Set(Object.keys(LICENSE_CLAUSES))
  const errors = []
  const imported = []
  items.forEach((item, index) => {
    const rawId = String(item?.id ?? item?.name ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
    const id = rawId.startsWith('mod-') ? rawId : `mod-${rawId}`
    if (!rawId || !item?.name || !item?.owner || existingIds.has(id)) {
      errors.push(`Entrada ${index + 1}: ID repetido ou nome/titular ausente.`)
      return
    }
    const normalized = {
      id, name: String(item.name).slice(0, 60), owner: String(item.owner).slice(0, 80),
      kind: kinds.has(item.kind) ? item.kind : 'franchise',
      availableFrom: clamp(Number(item.availableFrom) || 1980, 1980, 2200),
      popularity: clamp(Number(item.popularity) || 50, 1, 100), prestige: clamp(Number(item.prestige) || 50, 1, 100),
      minReputation: clamp(Number(item.minReputation) || 20, 0, 100), minTrophies: clamp(Number(item.minTrophies) || 0, 0, 20),
      baseCost: Math.max(100000, Number(item.baseCost) || 1000000), royalty: clamp(Number(item.royalty) || .12, .05, .3),
      durationYears: clamp(Number(item.durationYears) || 4, 1, 12),
      genres: Array.isArray(item.genres) ? item.genres.slice(0, 8) : [], themes: Array.isArray(item.themes) ? item.themes.slice(0, 8) : [],
      audiences: Array.isArray(item.audiences) ? item.audiences.slice(0, 5) : ['geral'],
      clauses: Array.isArray(item.clauses) ? item.clauses.filter(id => validClauses.has(id)) : [], custom: true,
    }
    imported.push(normalized)
    existingIds.add(id)
  })
  state.licenses.customCatalog.push(...imported)
  imported.forEach(ip => { state.licenses.catalog[ip.id] = { popularity: ip.popularity, prestige: ip.prestige, trust: 50, history: [] } })
  if (imported.length) state.queue.push({ id: makeId('license-pack'), kind: 'info', tag: 'PACOTE INSTALADO', title: `${imported.length} licença(s) entraram no arquivo`, body: 'Os dados ficam guardados neste save. Valores e cláusulas passam pelas mesmas regras do catálogo-base.', details: [rawPack?.name?.toUpperCase?.() ?? 'PACOTE EXTERNO', `${errors.length} AVISO(S)`, 'CONTEÚDO LOCAL'] })
  return { imported: imported.length, errors }
}
