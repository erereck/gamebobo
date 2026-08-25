import { PLATFORMS } from '../data/catalog.js'
import { CORPORATE_PARTNERS } from '../data/corporatePartners.js'
import { OFFICES, PERSONALITIES, ROLES, TEAM_NAMES, TEAM_SURNAMES } from '../data/team.js'
import { getEra } from '../data/eras.js'
import { makeId, randomChoice, randomInt } from './utils.js'

export const GAME_MODES = Object.freeze([
  { id: 'traditional', label: 'Tradicional', kicker: 'A CARREIRA ORIGINAL', difficulty: 'PADRÃO', description: 'O Gamebobo exatamente como sempre foi. Sem restrições extras e sem atalhos.', rules: ['Todas as plataformas', 'Todas as escalas', 'Economia e prêmios padrão'] },
  { id: 'realistic', label: 'Realista', kicker: 'PRESTÍGIO CUSTA CARO', difficulty: 'DIFÍCIL', description: 'As vendas continuam iguais, mas sobra menos dinheiro. Notas acima de 90 e troféus viram acontecimentos raros.', rules: ['Receita de jogos -30%', '90+ bem mais raro', 'Premiações mais exigentes'] },
  { id: 'portable', label: 'Portátil', kicker: 'SÓ CABE NO BOLSO', difficulty: 'ESPECIAL', description: 'Seu estúdio só trabalha com hardware portátil. Consoles de mesa, PC, mobile e arcade ficam fora do catálogo.', rules: ['Só handhelds e híbridos', 'Começa a partir de 1989', 'Multiplataforma só entre portáteis'], minStartYear: 1989 },
  { id: 'single-franchise', label: 'Franquia Singular', kicker: 'UMA SÉRIE. UMA VIDA.', difficulty: 'ESPECIAL', description: 'Seu primeiro jogo funda a única franquia da carreira. Depois dela, nunca mais existe outra IP própria.', rules: ['Primeiro jogo fixa a franquia', 'Sequels, spin-offs e remakes liberados', 'Nunca troca de série'] },
  { id: 'acquired', label: 'Estúdio Adquirido', kicker: 'SOB NOVA DIREÇÃO', difficulty: 'DIFERENTE', description: 'Você já começa comprado por uma empresa, com uma equipe pequena, estrutura melhor e briefs corporativos chegando de tempos em tempos.', rules: ['Começa com 3 funcionários', 'Controladora desde o primeiro dia', 'Encomendas corporativas recorrentes'] },
  { id: 'solo', label: 'Autor Solo', kicker: 'NINGUÉM MAIS TOCA NO CÓDIGO', difficulty: 'DIFÍCIL', description: 'Sem contratar, sem comprar estúdios e sem dividir produção. Você recebe eficiência extra, mas toda a carreira depende de uma pessoa.', rules: ['Contratação bloqueada', 'Subsidiárias bloqueadas', 'Projetos mais baratos e rápidos'] },
  { id: 'eternal-indie', label: 'Indie Eterno', kicker: 'PEQUENO POR ESCOLHA', difficulty: 'ESPECIAL', description: 'O estúdio pode crescer em gente, mas nunca vira uma fábrica AAA. Sua identidade vive em projetos micro e pequenos.', rules: ['Escala máxima: Pequeno', 'Sem comprar estúdios', 'Produção mais barata e ágil'] },
  { id: 'arcade-empire', label: 'Império Arcade', kicker: 'A FICHA NUNCA ACABA', difficulty: 'ESPECIAL', description: 'Só existe fliperama. Você atravessa o crash de 1982 e tenta manter o arcade relevante quando o resto da indústria muda de casa.', rules: ['Somente Fliperama / Arcade', 'Disponível desde 1980', 'Sobreviva às viradas do mercado'] },
  { id: 'anthology', label: 'Antologia', kicker: 'NUNCA A MESMA COISA DUAS VEZES', difficulty: 'ESPECIAL', description: 'Toda estreia precisa ser uma IP original nova. Nada de sequência, remake, remaster, port ou coletânea.', rules: ['Apenas jogos originais', 'Uma franquia nova por projeto', 'Catálogo sempre recomeça do zero'] },
])

export const gameModeForId = id => GAME_MODES.find(mode => mode.id === id) ?? GAME_MODES[0]
export const modeIdForState = state => gameModeForId(state?.careerMode?.id).id
export const modeForState = state => gameModeForId(modeIdForState(state))
export const minimumStartYearForMode = id => gameModeForId(id).minStartYear ?? 1980

export function createCareerMode(modeId = 'traditional') {
  return { id: gameModeForId(modeId).id, lockedFranchiseId: null, lockedFranchiseName: null, parentCompanyId: null }
}

export function singularFranchiseLock(state) {
  if (modeIdForState(state) !== 'single-franchise') return null
  const explicitId = state.careerMode?.lockedFranchiseId
  if (explicitId) return { id: explicitId, name: state.careerMode?.lockedFranchiseName ?? state.games.find(game => game.franchiseId === explicitId)?.franchiseName ?? 'Franquia da carreira' }
  const project = state.currentProject ?? state.parallelProjects?.[0]
  if (project?.franchiseId) return { id: project.franchiseId, name: project.franchiseName ?? project.title }
  const game = state.games?.find(item => item.franchiseId)
  return game ? { id: game.franchiseId, name: game.franchiseName ?? game.title } : null
}

export function modeAllowsPlatform(state, platform) {
  const modeId = modeIdForState(state)
  if (modeId === 'portable') return platform?.type === 'handheld' || platform?.type === 'hybrid'
  if (modeId === 'arcade-empire') return platform?.id === 'arcade'
  return true
}

export function modeAllowsScale(state, scaleId) {
  if (modeIdForState(state) === 'eternal-indie') return ['micro', 'small'].includes(scaleId)
  return true
}

export function modeAllowsProjectType(state, projectTypeId) {
  const modeId = modeIdForState(state)
  if (modeId === 'anthology') return projectTypeId === 'original'
  if (modeId === 'single-franchise') return singularFranchiseLock(state) ? projectTypeId !== 'original' : projectTypeId === 'original'
  return true
}

export function modeProjectPayloadValid(state, payload) {
  if (!modeAllowsProjectType(state, payload.projectType ?? 'original')) return false
  if (!modeAllowsScale(state, payload.scale)) return false
  const platforms = (payload.platforms?.length ? payload.platforms : [payload.platform]).filter(Boolean).map(id => PLATFORMS.find(platform => platform.id === id))
  if (!platforms.length || platforms.some(platform => !platform || !modeAllowsPlatform(state, platform))) return false

  const modeId = modeIdForState(state)
  if (modeId === 'anthology' && (payload.franchiseId || (payload.sourceGameIds?.length ?? 0))) return false

  if (modeId === 'single-franchise') {
    const lock = singularFranchiseLock(state)
    if (!lock) {
      if ((payload.projectType ?? 'original') !== 'original' || payload.franchiseId || (payload.sourceGameIds?.length ?? 0)) return false
    } else {
      if (payload.franchiseId && payload.franchiseId !== lock.id) return false
      const sources = (payload.sourceGameIds ?? []).map(id => state.games.find(game => game.id === id)).filter(Boolean)
      if (sources.some(game => game.franchiseId !== lock.id)) return false
      if (['sequel', 'spinoff'].includes(payload.projectType) && payload.franchiseId !== lock.id) return false
    }
  }
  return true
}

export function lockModeFranchise(state, franchiseId, franchiseName) {
  if (modeIdForState(state) !== 'single-franchise' || state.careerMode.lockedFranchiseId) return
  state.careerMode.lockedFranchiseId = franchiseId
  state.careerMode.lockedFranchiseName = franchiseName
}

export const modeAllowsHiring = state => modeIdForState(state) !== 'solo'
export const modeAllowsSubsidiaries = state => !['solo', 'eternal-indie'].includes(modeIdForState(state))
export const modeProjectCostMultiplier = state => modeIdForState(state) === 'solo' ? .78 : modeIdForState(state) === 'eternal-indie' ? .72 : 1
export const modeProductionPaceMultiplier = state => modeIdForState(state) === 'solo' ? 1.38 : modeIdForState(state) === 'eternal-indie' ? 1.08 : 1
export const modeRevenueMultiplier = state => modeIdForState(state) === 'realistic' ? .7 : 1
export const modeAwardPenalty = state => modeIdForState(state) === 'realistic' ? 8 : 0
export const modeAwardThresholdBonus = state => modeIdForState(state) === 'realistic' ? 6 : 0

export function adjustScoreForMode(state, score) {
  if (modeIdForState(state) !== 'realistic' || score <= 84) return score
  return Math.max(24, Math.min(97, Math.round(84 + (score - 84) * .68)))
}

function starterEmployee(state, index, random) {
  const preferredRoles = ['programmer', 'designer', 'artist']
  const role = ROLES.find(item => item.id === preferredRoles[index]) ?? ROLES[index % ROLES.length]
  const era = getEra(state.date.year)
  const skill = randomInt(58, 72, random)
  return {
    id: makeId('person'), name: `${randomChoice(TEAM_NAMES, random)} ${randomChoice(TEAM_SURNAMES, random)}`, roleId: role.id,
    personalityId: randomChoice(PERSONALITIES, random).id, skill, potential: Math.min(94, skill + randomInt(8, 20, random)),
    salary: Math.round(role.salary * Math.max(.72, era.costMultiplier * .78) / 50) * 50, morale: randomInt(68, 84, random),
    energy: 100, loyalty: randomInt(68, 88, random), months: 0, projects: 0, awards: 0, productionTeamId: 'founder',
  }
}

export function applyGameModeStart(state, options = {}, random = Math.random) {
  const mode = createCareerMode(options.modeId)
  state.careerMode = mode

  if (mode.id === 'acquired') {
    const available = CORPORATE_PARTNERS.filter(company => company.availableFrom <= state.date.year)
    const company = available.length ? randomChoice(available, random) : CORPORATE_PARTNERS[0]
    mode.parentCompanyId = company.id
    state.player.money = 55000
    state.player.reputation = 42
    state.studio.reputation = 40
    state.studio.officeLevel = Math.min(2, OFFICES.length - 1)
    state.studio.team = [0, 1, 2].map(index => starterEmployee(state, index, random))
    state.studio.equity = .6
    state.studio.parentCompany = company.name
    state.studio.autonomy = Math.min(88, company.autonomy + 14)
    state.corporate.ownership = { companyId: company.id, acquiredYear: state.date.year, price: 0, founderPayout: 0, autonomy: state.studio.autonomy, retainedBrand: true, earnout: 0, careerStart: true }
    const relationship = state.corporate.relationships[company.id]
    if (relationship) { relationship.trust = 66; relationship.status = 'parceiro preferencial' }
    state.history[0] = { ...state.history[0], title: `${company.name} já está na placa`, body: `O estúdio abre com três funcionários, uma controladora e ${state.studio.autonomy}% de autonomia. Os briefs vão chegar; o resto da carreira ainda é seu.`, highlight: true }
  }

  if (mode.id === 'solo') { state.player.money = 18000; state.history[0] = { ...state.history[0], title: 'Uma mesa. Uma pessoa.', body: 'Sem RH, sem aquisições e sem equipe paralela. Tudo que sair daqui passa pelas suas mãos.', highlight: true } }
  if (mode.id === 'eternal-indie') { state.player.money = 18000; state.history[0] = { ...state.history[0], title: 'Pequeno por escolha', body: 'O estúdio pode contratar e crescer, mas a produção fica presa ao tamanho em que ideias estranhas ainda cabem numa sala.', highlight: true } }
  if (mode.id === 'portable') state.history[0] = { ...state.history[0], title: 'A tela cabe na mão', body: 'A carreira só reconhece plataformas portáteis e híbridas como destino de lançamento.', highlight: true }
  if (mode.id === 'arcade-empire') state.history[0] = { ...state.history[0], title: 'Insira uma ficha', body: 'Console, computador e portátil não entram no plano. Esta empresa vive e morre no fliperama.', highlight: true }
  if (mode.id === 'single-franchise') state.history[0] = { ...state.history[0], title: 'Ainda sem nome para a saga', body: 'O primeiro jogo vai batizar a única franquia que este estúdio poderá desenvolver.', highlight: true }
  if (mode.id === 'anthology') state.history[0] = { ...state.history[0], title: 'Sem parte dois', body: 'Cada jogo precisa nascer como uma franquia original nova. O catálogo nunca repete a própria capa.', highlight: true }
  if (mode.id === 'realistic') state.history[0] = { ...state.history[0], title: 'Margem apertada', body: 'As cópias vendidas continuam sendo as mesmas. O difícil é transformar sucesso em caixa, 90+ e troféu.', highlight: true }
  return state
}
