export const TRAITS = [
  {
    id: 'visionary',
    name: 'Visionário',
    description: 'Ideia nova rende mais. Repetir fórmula rende menos.',
    modifiers: { innovation: 4, sequel: -3 },
  },
  {
    id: 'workaholic',
    name: 'Viciado em trabalho',
    description: 'Produz um pouco mais, mas acumula estresse rápido.',
    modifiers: { progressChance: 0.18, stressPerDevelop: 3 },
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'O teto de qualidade é maior. O calendário não ajuda.',
    modifiers: { quality: 3, projectMonths: 1 },
  },
  {
    id: 'communicator',
    name: 'Bom de conversa',
    description: 'Marketing rende mais e crises custam menos reputação.',
    modifiers: { marketing: 7, crisis: 0.7 },
  },
  {
    id: 'prodigy',
    name: 'Prodígio',
    description: 'Programa muito acima da média. O resto ainda dá trabalho.',
    modifiers: { programming: 10, charisma: -5 },
  },
]

export const EQUIPMENT = [
  { level: 0, name: 'PC montado com sobras', cost: 0, bonus: 0, unlockYear: 2003, description: 'Liga na segunda tentativa.' },
  { level: 1, name: 'PC decente', cost: 18000, bonus: 3, unlockYear: 2003, description: 'Compilar deixou de ser intervalo de almoço.' },
  { level: 2, name: 'Estação de trabalho', cost: 62000, bonus: 7, unlockYear: 2003, description: 'Dois monitores e uma cadeira que não range.' },
  { level: 3, name: 'Sala própria', cost: 180000, bonus: 11, unlockYear: 2003, description: 'Tem porta. Isso muda muita coisa.' },
  { level: 4, name: 'Fazenda de render', cost: 520000, bonus: 16, unlockYear: 2012, description: 'O calor da sala paga parte do aquecimento.' },
  { level: 5, name: 'Laboratório sintético', cost: 1600000, bonus: 22, unlockYear: 2025, description: 'Prototipar ficou rápido. Escolher o que vale fazer, não.' },
  { level: 6, name: 'Bancada neural', cost: 5200000, bonus: 30, unlockYear: 2035, description: 'A tela virou uma formalidade.' },
]
