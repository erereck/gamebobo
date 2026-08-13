export const GENRES = [
  { id: 'rpg', label: 'RPG' },
  { id: 'action', label: 'Ação' },
  { id: 'strategy', label: 'Estratégia' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'simulation', label: 'Simulação' },
  { id: 'sports', label: 'Esporte' },
  { id: 'horror', label: 'Terror' },
  { id: 'adventure', label: 'Aventura' },
  { id: 'stealth', label: 'Furtividade' },
  { id: 'fighting', label: 'Luta' },
  { id: 'racing', label: 'Corrida' },
]

export const THEMES = [
  { id: 'fantasy', label: 'Fantasia' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'football', label: 'Futebol' },
  { id: 'school', label: 'Escola' },
  { id: 'crime', label: 'Crime' },
  { id: 'space', label: 'Espaço' },
  { id: 'romance', label: 'Romance' },
  { id: 'mythology', label: 'Mitologia' },
  { id: 'nature', label: 'Natureza' },
  { id: 'history', label: 'História real' },
  { id: 'internet', label: 'Internet' },
  { id: 'cooking', label: 'Culinária' },
  { id: 'music', label: 'Música' },
  { id: 'politics', label: 'Política' },
  { id: 'vehicles', label: 'Veículos' },
]

export const FOCUSES = [
  { id: 'gameplay', label: 'Gameplay', stat: 'programming' },
  { id: 'story', label: 'História', stat: 'design' },
  { id: 'visual', label: 'Visual', stat: 'art' },
  { id: 'innovation', label: 'Inovação', stat: 'design' },
  { id: 'multiplayer', label: 'Multiplayer', stat: 'programming' },
  { id: 'systems', label: 'Sistemas', stat: 'design' },
  { id: 'atmosphere', label: 'Atmosfera', stat: 'art' },
]

export { PLATFORM_HISTORY as PLATFORMS } from './platformHistory.js'

export const SCALES = {
  micro: { id: 'micro', label: 'Micro', months: 3, cost: 3600, reach: 0.62, price: 14 },
  small: { id: 'small', label: 'Pequeno', months: 5, cost: 9200, reach: 1, price: 26 },
  medium: { id: 'medium', label: 'Médio', months: 8, cost: 24800, reach: 1.62, price: 42 },
  large: { id: 'large', label: 'Grande', months: 13, cost: 96000, reach: 2.65, price: 58, officeLevel: 2, teamSize: 4 },
  blockbuster: { id: 'blockbuster', label: 'Arrasa-quarteirão', months: 20, cost: 480000, reach: 4.5, price: 72, officeLevel: 3, teamSize: 10 },
}

export const STATS = [
  { id: 'programming', label: 'Programação' },
  { id: 'art', label: 'Arte' },
  { id: 'design', label: 'Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'charisma', label: 'Carisma' },
]

export const MARKET_ANGLES = [
  { id: 'short', label: 'jogos curtos', focus: 'gameplay', copy: 'O público quer terminar alguma coisa no fim de semana.' },
  { id: 'hard', label: 'jogos difíceis', focus: 'gameplay', copy: 'Revistas começaram a tratar dificuldade como medalha.' },
  { id: 'story', label: 'histórias fortes', focus: 'story', copy: 'Personagens estão vendendo mais revista que gráfico.' },
  { id: 'pretty', label: 'visual caprichado', focus: 'visual', copy: 'Screenshots estão decidindo compra antes das análises.' },
  { id: 'weird', label: 'ideias novas', focus: 'innovation', copy: 'Há espaço para coisa que ninguém sabe explicar direito.' },
  { id: 'together', label: 'jogar em grupo', focus: 'multiplayer', copy: 'Cabo de rede virou item de festa.' },
  { id: 'deep', label: 'sistemas que se cruzam', focus: 'systems', copy: 'Tem gente publicando planilha para explicar o que descobriu jogando.' },
  { id: 'mood', label: 'jogos com clima próprio', focus: 'atmosphere', copy: 'Uma boa cena está vendendo mais que uma lista de recursos.' },
]

export const labelOf = (collection, id) => collection.find(item => item.id === id)?.label ?? id
