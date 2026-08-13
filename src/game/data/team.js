export const TEAM_NAMES = ['Lia', 'Caio', 'Nina', 'Breno', 'Maya', 'João', 'Tati', 'Davi', 'Iara', 'Ravi', 'Bia', 'Zeca', 'Luna', 'Tom', 'Aline', 'Guto']
export const TEAM_SURNAMES = ['Moraes', 'Santos', 'Ito', 'Freire', 'Lima', 'Nogueira', 'Costa', 'Vidal', 'Rocha', 'Aoki', 'Campos', 'Reis']

export const ROLES = [
  { id: 'programmer', label: 'Programação', primary: 'programming', salary: 3400 },
  { id: 'artist', label: 'Arte', primary: 'art', salary: 3200 },
  { id: 'designer', label: 'Design', primary: 'design', salary: 3300 },
  { id: 'producer', label: 'Produção', primary: 'charisma', salary: 3900 },
  { id: 'marketer', label: 'Marketing', primary: 'marketing', salary: 3500 },
  { id: 'writer', label: 'Roteiro', primary: 'design', salary: 3000 },
]

export const PERSONALITIES = [
  { id: 'calm', name: 'Calmo', effect: 'Moral cai menos em projeto atrasado.', moraleShield: 3 },
  { id: 'brilliant', name: 'Brilhante', effect: 'Entrega muito, pede aumento cedo.', contribution: 4, salaryPressure: 0.12 },
  { id: 'social', name: 'Agregador', effect: 'Melhora a moral de quem trabalha junto.', teamMorale: 2 },
  { id: 'stubborn', name: 'Teimoso', effect: 'Qualidade alta, conflitos mais prováveis.', quality: 3, conflict: 0.12 },
  { id: 'chaotic', name: 'Caótico', effect: 'Resultado varia mais que o normal.', variance: 5 },
  { id: 'loyal', name: 'Leal', effect: 'Tolera fase ruim e propostas externas.', retention: 0.2 },
]

export const CULTURES = [
  { id: 'balanced', name: 'Ritmo sustentável', description: 'Produção previsível. Moral e saúde duram mais.', modifiers: { progress: 0, stress: -4, morale: 3 } },
  { id: 'craft', name: 'Acabamento acima do prazo', description: 'Qualidade primeiro. Projeto costuma escorregar.', modifiers: { quality: 5, months: 1 } },
  { id: 'experimental', name: 'Laboratório aberto', description: 'Inovação recebe bônus. Sequências ficam desconfortáveis.', modifiers: { innovation: 7, sequel: -3 } },
  { id: 'commercial', name: 'Olho na prateleira', description: 'Marketing e vendas sobem. Fãs hardcore desconfiam.', modifiers: { marketing: 6, hardcoreTrust: -3 } },
  { id: 'crunch', name: 'Tudo para sexta', description: 'Rápido por alguns meses. Moral e saúde pagam.', modifiers: { progress: 0.18, stress: 7, morale: -6 } },
]

export const OFFICES = [
  { level: 0, name: 'Quarto dos fundos', capacity: 1, monthly: 0, cost: 0, bonus: 0 },
  { level: 1, name: 'Sala em coworking', capacity: 4, monthly: 2400, cost: 22000, bonus: 2 },
  { level: 2, name: 'Escritório pequeno', capacity: 9, monthly: 7800, cost: 85000, bonus: 5 },
  { level: 3, name: 'Estúdio próprio', capacity: 20, monthly: 22000, cost: 310000, bonus: 8 },
  { level: 4, name: 'Campus', capacity: 60, monthly: 76000, cost: 1800000, bonus: 12 },
]
