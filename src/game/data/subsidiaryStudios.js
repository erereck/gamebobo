export const SUBSIDIARY_STUDIOS = Object.freeze([
  { id: 'pixel-patio', name: 'Pixel Patio', fromYear: 1985, baseCost: 95000, monthly: 5200, skill: 58, specialty: 'action', capacity: 1, description: 'Equipe pequena de conversão e ação arcade. Aprende hardware rápido.' },
  { id: 'lotus-byte', name: 'Lotus Byte', fromYear: 1993, baseCost: 210000, monthly: 9800, skill: 64, specialty: 'rpg', capacity: 1, description: 'RPG, ferramentas internas e uma paciência incomum com conteúdo grande.' },
  { id: 'cobalt-room', name: 'Cobalt Room', fromYear: 1998, baseCost: 360000, monthly: 14500, skill: 68, specialty: 'adventure', capacity: 1, description: 'Narrativa, aventura e acabamento. Cresceu fazendo trabalho para terceiros.' },
  { id: 'turbo-mint', name: 'Turbo Mint', fromYear: 2002, baseCost: 620000, monthly: 21000, skill: 72, specialty: 'racing', capacity: 1, description: 'Portabilidade, desempenho e jogos rápidos. Ótima para projetos simultâneos.' },
  { id: 'noisy-orbit', name: 'Noisy Orbit', fromYear: 2006, baseCost: 980000, monthly: 31000, skill: 76, specialty: 'rhythm', capacity: 1, description: 'Especialistas em áudio, periféricos e ideias que precisam funcionar numa sala cheia.' },
  { id: 'paper-fox', name: 'Paper Fox', fromYear: 2012, baseCost: 1650000, monthly: 47000, skill: 80, specialty: 'simulation', capacity: 2, description: 'Dois times pequenos com cultura independente e boa leitura de sistemas.' },
  { id: 'glass-engine', name: 'Glass Engine', fromYear: 2018, baseCost: 3100000, monthly: 82000, skill: 84, specialty: 'action', capacity: 2, description: 'Produção moderna, multiplataforma e pipeline forte o bastante para segurar duas frentes.' },
])

export const subsidiaryForId = id => SUBSIDIARY_STUDIOS.find(item => item.id === id) ?? null

export function subsidiaryPrice(state, studio) {
  const years = Math.max(0, state.date.year - studio.fromYear)
  const marketInflation = 1 + years * .035
  const buyerScale = 1 + state.studio.team.length * .025 + (state.studio.subsidiaries?.length ?? 0) * .12 + state.studio.reputation / 350
  return Math.round(studio.baseCost * marketInflation * buyerScale / 1000) * 1000
}
