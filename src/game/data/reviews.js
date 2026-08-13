import { clamp, randomChoice, randomInt } from '../engine/utils.js'

// Datas indicam quando cada redação pode aparecer na simulação.
// A Revista Controle é a publicação fictícia da casa e garante cobertura em 1980.
export const REVIEW_OUTLETS = Object.freeze([
  { id: 'controle', name: 'Revista Controle', fromYear: 1980, format: 'REVISTA', bias: 0 },
  { id: 'cvg', name: 'Computer and Video Games', fromYear: 1981, toYear: 2014, format: 'REVISTA', bias: 1 },
  { id: 'famitsu', name: 'Famitsu', fromYear: 1986, format: 'REVISTA', bias: 1 },
  { id: 'egm', name: 'Electronic Gaming Monthly', fromYear: 1988, toYear: 2009, format: 'REVISTA', bias: 0 },
  { id: 'pc-gamer', name: 'PC Gamer', fromYear: 1993, format: 'REVISTA', bias: 1 },
  { id: 'ign', name: 'IGN', fromYear: 1996, format: 'SITE', bias: 0 },
  { id: 'gamespot', name: 'GameSpot', fromYear: 1996, format: 'SITE', bias: -1 },
  { id: 'eurogamer', name: 'Eurogamer', fromYear: 1999, format: 'SITE', bias: -1 },
  { id: 'egm-web', name: 'EGM', fromYear: 2019, format: 'SITE', bias: 0 },
  { id: 'canaltech', name: 'Canaltech', fromYear: 2012, format: 'SITE', bias: 0 },
])

const LINES = [
  { min: 92, lines: ['Acaba e deixa vontade de voltar para o começo.', 'Tem uma segurança rara até nas ideias mais estranhas.', 'Um daqueles jogos que reorganizam a conversa do ano.', 'A equipe sabia exatamente onde queria chegar.'] },
  { min: 82, lines: ['Tropeça pouco e acerta com personalidade.', 'É muito bom sem precisar fingir que não tem defeitos.', 'Tem falhas visíveis e qualidades difíceis de largar.', 'Quando os créditos sobem, ainda dá vontade de continuar.'] },
  { min: 70, lines: ['Demora a engrenar, mas encontra um ritmo bom.', 'Nem toda ideia fecha; as melhores compensam.', 'É irregular do jeito que projetos ambiciosos costumam ser.', 'Um jogo bom, especialmente quando para de explicar demais.'] },
  { min: 60, lines: ['A ideia chega antes do acabamento.', 'Funciona, mas quase sempre do jeito mais difícil.', 'Faltou lapidar e sobrou coisa para tolerar.', 'Há bons momentos aqui, separados por tropeços demais.'] },
  { min: 0, lines: ['Saiu antes de ficar pronto.', 'Há uma boa ideia soterrada por problemas básicos.', 'Os créditos são curtos. A lista de problemas, não.', 'É difícil recomendar esta versão para alguém.'] },
]

const FOCUS_NOTES = {
  gameplay: ['O controle responde bem quando o jogo para de inventar moda.', 'A base é boa; é nela que o projeto se sustenta.'],
  story: ['A história encontra voz própria sem pedir licença.', 'Os melhores momentos acontecem quando o roteiro confia no jogador.'],
  visual: ['A direção visual faz muito com o que tem.', 'É fácil reconhecer este jogo numa única imagem.'],
  innovation: ['Nem toda experiência funciona, mas nenhuma parece preguiçosa.', 'A novidade aqui muda mais do que a embalagem.'],
  multiplayer: ['Junto de outras pessoas, os defeitos viram histórias.', 'A dinâmica entre jogadores segura partidas além do esperado.'],
}

export const outletsForYear = year => REVIEW_OUTLETS.filter(outlet => year >= outlet.fromYear && year <= (outlet.toYear ?? 9999))

export function createReviews(score, project, year, random = Math.random) {
  const available = [...outletsForYear(year)]
  const count = Math.min(year < 1986 ? 2 : year < 1996 ? 3 : 4, available.length)
  const selected = []
  while (available.length && selected.length < count) {
    selected.push(available.splice(randomInt(0, available.length - 1, random), 1)[0])
  }
  const group = LINES.find(item => score >= item.min) ?? LINES.at(-1)
  const usedQuotes = new Set()
  return selected.map((outlet, index) => {
    const deviation = randomInt(-5, 5, random) + outlet.bias
    const outletScore = clamp(score + deviation, 20, 100)
    const focusLines = FOCUS_NOTES[project.focus] ?? []
    const quotePool = index === 0 || Math.abs(deviation) > 3 ? group.lines : [...group.lines, ...focusLines]
    const unused = quotePool.filter(line => !usedQuotes.has(line))
    const quote = randomChoice(unused.length ? unused : quotePool, random)
    usedQuotes.add(quote)
    return { outletId: outlet.id, outlet: outlet.name, format: outlet.format, score: outletScore, quote }
  })
}

export const primaryReview = reviews => [...reviews].sort((a, b) => Math.abs(a.score - reviews.reduce((sum, item) => sum + item.score, 0) / reviews.length) - Math.abs(b.score - reviews.reduce((sum, item) => sum + item.score, 0) / reviews.length))[0]
