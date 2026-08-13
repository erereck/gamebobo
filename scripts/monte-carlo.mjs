import { generateCompetitorLaunch } from '../src/game/engine/market.js'

const runs = Math.max(1000, Number(process.argv[2]) || 25000)
const years = [1980, 1985, 1990, 2000, 2010, 2020]

function seeded(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let next = value
    next = Math.imul(next ^ next >>> 15, next | 1)
    next ^= next + Math.imul(next ^ next >>> 7, next | 61)
    return ((next ^ next >>> 14) >>> 0) / 4294967296
  }
}

const percentile = (sorted, ratio) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))]
const number = value => new Intl.NumberFormat('pt-BR').format(value)

console.log(`Monte Carlo Gamebobo · ${number(runs)} lançamentos por era`)
console.log('ANO  MEDIANA      P95          P99          MÁXIMO       FENÔMENOS')

for (const year of years) {
  const random = seeded(year * 7919 + runs)
  const studio = { id: 'cohort', name: 'Garagem', cohort: true, founded: year, specialty: 'puzzle', momentum: 18 }
  const launches = Array.from({ length: runs }, () => generateCompetitorLaunch(studio, `JUN ${year}`, undefined, random))
  const sales = launches.map(item => item.sales).sort((a, b) => a - b)
  const breakouts = launches.filter(item => item.breakout).length / runs * 100
  console.log(`${year}  ${number(percentile(sales, .5)).padEnd(12)} ${number(percentile(sales, .95)).padEnd(12)} ${number(percentile(sales, .99)).padEnd(12)} ${number(sales.at(-1)).padEnd(12)} ${breakouts.toFixed(2)}%`)
}
