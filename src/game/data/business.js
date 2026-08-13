export const PUBLISHERS = [
  { id: 'foxglove', name: 'Foxglove Publishing', style: 'indie', advanceFactor: 0.82, royalty: 0.22, pressure: 8, reach: 1.45, demand: 'Quer personalidade e uma data honesta.' },
  { id: 'megafox', name: 'MegaFox Entertainment', style: 'mass', advanceFactor: 1.38, royalty: 0.42, pressure: 18, reach: 2.4, demand: 'Pede mercado grande, campanha e controle do prazo.' },
  { id: 'redwood', name: 'Redwood Interactive', style: 'prestige', advanceFactor: 1.08, royalty: 0.34, pressure: 13, reach: 1.85, demand: 'Nota importa mais que volume.' },
  { id: 'pocket', name: 'Pocket Rocket', style: 'casual', advanceFactor: 0.94, royalty: 0.28, pressure: 10, reach: 1.7, demand: 'Quer sessão curta e público amplo.' },
]

export const CONTRACT_TEMPLATES = [
  { id: 'port', title: 'Port de catálogo', months: 2, pay: 16000, energy: 16, skill: 'programming', gain: 2, description: 'Adaptar um jogo antigo para outra plataforma.' },
  { id: 'advergame', title: 'Jogo publicitário', months: 3, pay: 28000, energy: 22, skill: 'marketing', gain: 3, description: 'A marca quer “viral”, mas não sabe explicar como.' },
  { id: 'outsourcing-art', title: 'Pacote de arte', months: 2, pay: 19000, energy: 18, skill: 'art', gain: 2, description: 'Cenários para um estúdio maior que não vai colocar seu nome na capa.' },
  { id: 'prototype', title: 'Protótipo sob encomenda', months: 2, pay: 22000, energy: 20, skill: 'design', gain: 3, description: 'Uma editora quer testar uma ideia antes de bancar o jogo.' },
  { id: 'consulting', title: 'Consultoria de sistemas', months: 1, pay: 12000, energy: 12, skill: 'design', gain: 1, description: 'Reuniões longas para responder perguntas curtas.' },
]

export const LOANS = [
  { id: 'small', name: 'Crédito pessoal', amount: 30000, months: 12, interest: 0.18 },
  { id: 'studio', name: 'Crédito empresarial', amount: 150000, months: 24, interest: 0.26 },
  { id: 'venture', name: 'Investidor-anjo', amount: 500000, months: 36, interest: 0.38, equity: 0.12 },
]
