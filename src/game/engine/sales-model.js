import { clamp } from './utils.js'

// Vendas potenciais de um jogo excelente com distribuição independente razoável.
// A curva cresce com a indústria, mas desacelera quando a oferta começa a disputar atenção.
const MARKET_ANCHORS = Object.freeze([
  { year: 1980, demand: 420_000 },
  { year: 1985, demand: 760_000 },
  { year: 1991, demand: 1_500_000 },
  { year: 1995, demand: 1_850_000 },
  { year: 2000, demand: 2_050_000 },
  { year: 2005, demand: 2_250_000 },
  { year: 2010, demand: 2_400_000 },
  { year: 2015, demand: 2_550_000 },
  { year: 2020, demand: 2_700_000 },
  { year: 2030, demand: 3_100_000 },
  { year: 2040, demand: 3_500_000 },
])

export const SALES_SCALE_REACH = Object.freeze({
  micro: .62,
  small: 1,
  medium: 1.35,
  large: 1.75,
  blockbuster: 2.25,
})

export function addressableDemand(year) {
  const upperIndex = MARKET_ANCHORS.findIndex(anchor => anchor.year >= year)
  if (upperIndex <= 0) return MARKET_ANCHORS[Math.max(0, upperIndex)].demand
  if (upperIndex === -1) return MARKET_ANCHORS.at(-1).demand
  const lower = MARKET_ANCHORS[upperIndex - 1]
  const upper = MARKET_ANCHORS[upperIndex]
  const progress = (year - lower.year) / (upper.year - lower.year)
  return Math.round(lower.demand + (upper.demand - lower.demand) * progress)
}

export function qualityDemand(score, year) {
  const reception = clamp((score - 48) / 51, .03, 1)
  return Math.max(180, addressableDemand(year) * reception ** 4.2)
}

export function audienceCeiling(year) {
  if (year < 1985) return 1_000_000
  if (year < 1995) return 8_000_000
  if (year < 2005) return 35_000_000
  if (year < 2015) return 180_000_000
  return 500_000_000
}

// O preço de capa não é lucro: fabricação, varejo, devoluções, operação e suporte
// continuam existindo depois do corte explícito de plataforma, editora e licença.
export function operatingShare(year, platformType) {
  if (year < 2007) return platformType === 'computer' ? .22 : .16
  return platformType === 'mobile' ? .14 : .2
}
