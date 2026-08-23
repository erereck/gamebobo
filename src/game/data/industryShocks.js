export const INDUSTRY_SHOCKS = Object.freeze([
  {
    id: 'arcade-fever', start: [1980, 0], duration: 36, tag: 'FICHAS NA MÁQUINA', title: 'O fliperama ainda dita o ritmo.',
    body: 'Pontuação, partidas curtas e máquinas reconhecíveis concentram atenção antes de o console doméstico se estabilizar.',
    modifiers: { arcade: 1.28, action: 1.08 },
  },
  {
    id: 'crash-1983', start: [1982, 8], duration: 28, tag: 'SATURAÇÃO NAS PRATELEIRAS', title: 'A crise dos videogames aperta o varejo.',
    body: 'O excesso de cartuchos e a confiança em queda derrubam o mercado doméstico norte-americano. Arcade e computador sentem menos o impacto.',
    modifiers: { console: .58, computer: 1.08, arcade: 1.12 },
  },
  {
    id: 'nes-recovery', start: [1985, 9], duration: 30, tag: 'CONSOLE VOLTA A RESPIRAR', title: 'O NES reabre espaço nas lojas.',
    body: 'Controle de catálogo, mascotes e uma nova linguagem de qualidade fazem o console doméstico recuperar confiança.',
    modifiers: { console: 1.2, platformer: 1.14, action: 1.08 },
  },
  {
    id: 'star-wars-return', start: [1997, 0], duration: 34, tag: 'LICENÇA VIROU EVENTO', title: 'Star Wars volta a ocupar vitrines.',
    body: 'Relançamentos e a expectativa pela nova trilogia puxam ficção científica, adaptações e licenças conhecidas para o centro da conversa.',
    modifiers: { licensed: 1.2, space: 1.18, adventure: 1.08 },
  },
  {
    id: 'rhythm-peripheral-boom', start: [2005, 10], duration: 46, tag: 'A CAIXA NÃO CABE NA SACOLA', title: 'Guitar Hero abre a era dos controles de plástico.',
    body: 'Instrumentos, tapetes e outros periféricos transformam hardware estranho em espetáculo social.',
    modifiers: { accessory: 1.28, rhythm: 1.3, music: 1.22 },
  },
  {
    id: 'motion-boom', start: [2006, 10], duration: 52, tag: 'A SALA VIROU CONTROLE', title: 'O Wii muda quem topa jogar.',
    body: 'Movimento e leitura imediata de gesto ampliam o público e empurram concorrentes para câmeras e sensores.',
    modifiers: { motion: 1.3, party: 1.18, sports: 1.14 },
  },
  {
    id: 'mobile-gold-rush', start: [2008, 6], duration: 50, tag: 'TODO BOLSO É UMA LOJA', title: 'A corrida por jogos mobile começa.',
    body: 'Distribuição digital, toque e preço baixo atraem equipes de todos os tamanhos para um mercado novo.',
    modifiers: { mobile: 1.34, puzzle: 1.12, casual: 1.12 },
  },
  {
    id: 'indie-digital-wave', start: [2010, 0], duration: 54, tag: 'PEQUENO PODE PARECER GRANDE', title: 'Lojas digitais dão palco ao estúdio pequeno.',
    body: 'PC e consoles abrem mais espaço para jogos baratos, autorais e fáceis de recomendar pela internet.',
    modifiers: { indie: 1.22, computer: 1.12, innovation: 1.1 },
  },
  {
    id: 'battle-royale-boom', start: [2017, 2], duration: 38, tag: 'CEM ENTRAM', title: 'Battle royale engole a conversa online.',
    body: 'Clipes, transmissão e histórias emergentes puxam multiplayer competitivo para uma escala rara.',
    modifiers: { multiplayer: 1.22, shooter: 1.15 },
  },
  {
    id: 'stay-home-2020', start: [2020, 2], duration: 22, tag: 'TODO MUNDO EM CASA', title: 'Jogos viram ponto de encontro.',
    body: 'O tempo dentro de casa aumenta vendas digitais e dá peso incomum a experiências sociais, acolhedoras e de longa duração.',
    modifiers: { global: 1.16, multiplayer: 1.1, simulation: 1.1 },
  },
])

export const industryShockKey = shock => `${shock.id}:${shock.start[0]}-${shock.start[1]}`

export function shockStartsAt(shock, date) {
  return shock.start[0] === date.year && shock.start[1] === date.month
}
