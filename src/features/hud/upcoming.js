import { historicRival, historicWeek } from '../../game/engine/market.js'
import { ALL_HISTORIC_GAMES } from '../../game/data/history.js'
import { PLATFORMS } from '../../game/data/platforms.js'

// "Em 3 meses", "No mês que vem", "Em 1 ano e 2 meses": abre a frase, que o letreiro corta o fim.
export const inMonths = months => {
  if (months <= 1) return 'No mês que vem'
  if (months < 12) return `Em ${months} meses`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return `Em ${years} ano${years > 1 ? 's' : ''}${rest ? ` e ${rest} ${rest > 1 ? 'meses' : 'mês'}` : ''}`
}

// Contagem regressiva de consoles e dos jogos mais esperados: o calendário de verdade no letreiro.
export function upcomingNews(state) {
  const nowMonth = state.year * 12 + Math.floor(state.week / 4)
  const news = []
  for (const platform of PLATFORMS) {
    const months = platform.year * 12 + platform.month - nowMonth
    if (months > 0 && months <= 18 && platform.year > 1980) news.push({ text: `${inMonths(months)}: ${platform.label} chega às lojas`, soon: months })
  }
  const tw = (state.year - 1980) * 48 + state.week
  for (const entry of ALL_HISTORIC_GAMES) {
    const weeks = historicWeek(entry) - tw
    if (weeks <= 0 || weeks > 40 || /^(fifa|pes|cod)-/.test(entry.id)) continue
    if (!entry.trend && entry.copies < 8) continue
    // Clássico de estúdio que você comprou não sai mais (mesma regra do mercado): nada de contagem.
    const rivalId = historicRival(entry)
    if (rivalId && state.acquired?.includes(rivalId)) continue
    news.push({ text: `${inMonths(Math.max(1, Math.round(weeks / 4)))}: sai ${entry.title}`, soon: weeks / 4 })
  }
  // O nº 1 das paradas tem vaga cativa: não disputa as cinco vagas com as contagens.
  const top = state.chart?.[0]
  const soon = news.sort((a, b) => a.soon - b.soon).slice(0, top ? 4 : 5)
  if (top) soon.push({ text: top.mine ? `${top.title} é o nº 1 das paradas!` : `Nº 1 das paradas: ${top.title} (${top.studio})` })
  return soon
}
