// Traços aparecem no comportamento do boneco no escritório e na produção.
export const TRAITS = [
  { id: 'cafe', label: 'Cafeína', icon: 'coffee', out: 1.08, desc: 'Vive na cafeteira. Rende mais.' },
  { id: 'tagarela', label: 'Tagarela', icon: 'dots', out: .95, teamMood: 3, desc: 'Conversa demais. Anima a sala.' },
  { id: 'coruja', label: 'Coruja', icon: 'moon', crunchOut: 1.12, crunchEnergy: .5, desc: 'Brilha no crunch.' },
  { id: 'perfeccionista', label: 'Perfeccionista', icon: 'target', out: .92, bugs: .6, desc: 'Lento, mas quase sem bug.' },
  { id: 'caotico', label: 'Gênio caótico', icon: 'tornado', gen: { idea: 1.3 }, bugs: 1.4, desc: 'Ideias geniais, bugs idem.' },
  { id: 'zen', label: 'Zen', icon: 'plant', energy: .6, desc: 'Quase não cansa.' },
  { id: 'gamer', label: 'Gamerzão', icon: 'gamepad', gen: { fun: 1.15 }, desc: 'Sabe o que é divertido.' },
  { id: 'meme', label: 'Rei do meme', icon: 'laugh', hype: 1.2, desc: 'Divulgação rende mais.' },
  { id: 'ligeiro', label: 'Ligeiro', icon: 'bolt', out: 1.12, bugs: 1.2, desc: 'Rápido e meio desastrado.' },
  { id: 'estrela', label: 'Estrela', icon: 'star', out: 1.15, salary: 1.4, desc: 'Muito bom. Sabe disso.' },
  { id: 'mentor', label: 'Mentor', icon: 'graduation', teamXp: 1.25, desc: 'Todo mundo evolui junto.' },
  { id: 'preguica', label: 'Preguiçoso', icon: 'zzz', out: .85, salary: .7, desc: 'Barato. Dorme na mesa.' },
  { id: 'ouvido', label: 'Ouvido absoluto', icon: 'headphones', gen: { sound: 1.25 }, desc: 'Trilha impecável.' },
  { id: 'olho', label: 'Olho clínico', icon: 'eye', gen: { art: 1.2 }, desc: 'Pixel nenhum escapa.' },
]
export const traitById = id => TRAITS.find(item => item.id === id)

export const FOUNDER_PROFILES = [
  { id: 'programador', label: 'Programador', icon: 'code', skills: { fun: 34, art: 12, sound: 10, idea: 22 }, trait: 'gamer' },
  { id: 'artista', label: 'Artista', icon: 'brush', skills: { fun: 16, art: 34, sound: 12, idea: 20 }, trait: 'olho' },
  { id: 'musico', label: 'Músico', icon: 'headphones', skills: { fun: 16, art: 14, sound: 34, idea: 18 }, trait: 'ouvido' },
  { id: 'visionario', label: 'Visionário', icon: 'bulb', skills: { fun: 20, art: 14, sound: 10, idea: 34 }, trait: 'caotico' },
]

export const ROLES = {
  fun: { label: 'Programação', short: 'Prog', icon: 'code' },
  art: { label: 'Arte', short: 'Arte', icon: 'brush' },
  sound: { label: 'Som', short: 'Som', icon: 'headphones' },
  idea: { label: 'Design', short: 'Design', icon: 'bulb' },
}

export const PILLARS = [
  { id: 'fun', label: 'Diversão', short: 'DIV', icon: 'gamepad', color: '#ff7a45' },
  { id: 'art', label: 'Visual', short: 'VIS', icon: 'brush', color: '#3fb8ff' },
  { id: 'sound', label: 'Som', short: 'SOM', icon: 'note', color: '#b57bff' },
  { id: 'idea', label: 'Ideia', short: 'IDE', icon: 'bulb', color: '#ffc93c' },
]

export const LOOKS = {
  skin: ['#f6d3b3', '#eabf98', '#d9a066', '#b97a4a', '#8d5a36', '#5f3b24', '#f2c7a5', '#c68b59'],
  hair: ['#1f1a17', '#3b2416', '#6b3e1f', '#a0522d', '#d9a441', '#e8d6a8', '#b33a3a', '#4a4a4a', '#2f5d9b', '#d36ba6', '#e0e0e0'],
  hairStyle: ['curto', 'coque', 'black', 'careca', 'longo', 'moicano', 'franja', 'cacheado', 'rabo'],
  shirt: ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#38d9a9', '#4dabf7', '#748ffc', '#b197fc', '#f783ac', '#343a40', '#f1f3f5', '#20c997'],
  pants: ['#2b3a55', '#3d405b', '#5c4033', '#22223b', '#6c757d', '#1b4332', '#495057'],
  extra: ['nada', 'nada', 'nada', 'oculos', 'fone', 'bone', 'oculos'],
}

export const AWARDS = [
  { id: 'goty', label: 'Jogo do Ano', icon: 'trophy' },
  { id: 'visual', label: 'Melhor Visual', icon: 'brush', pillar: 'art' },
  { id: 'trilha', label: 'Melhor Trilha', icon: 'note', pillar: 'sound' },
  { id: 'ideia', label: 'Mais Inovador', icon: 'bulb', pillar: 'idea' },
  { id: 'vendas', label: 'Mais Vendido', icon: 'coin' },
  { id: 'indie', label: 'Indie do Ano', icon: 'heart' },
]

// Títulos de legado: a fama acumulada do estúdio vira um nome na plaquinha.
export const LEGACY_TITLES = [
  { min: 0, label: 'Dev de quarto' },
  { min: 40, label: 'Promessa da garagem' },
  { min: 120, label: 'Indie querido' },
  { min: 300, label: 'Estúdio respeitado' },
  { min: 650, label: 'Fábrica de hits' },
  { min: 1200, label: 'Gigante do controle' },
  { min: 2200, label: 'Referência mundial' },
  { min: 4000, label: 'Lenda dos games' },
  { min: 7000, label: 'Imortal do joystick' },
]
