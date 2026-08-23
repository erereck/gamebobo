export const ACCESSORIES = Object.freeze([
  { id: 'zapper', name: 'NES Zapper', fromYear: 1985, toYear: 1994, platforms: ['famicom-nes'], costMultiplier: .12, months: .45, reach: .12, quality: 1, genres: ['action', 'shooter'], copy: 'A mira vira parte da promessa — e também do teste.' },
  { id: 'dance-mat', name: 'Tapete de dança', fromYear: 1999, toYear: 2012, platforms: ['playstation', 'playstation-2', 'xbox', 'gamecube', 'wii'], costMultiplier: .16, months: .65, reach: .16, quality: 1, genres: ['rhythm'], themes: ['music'], copy: 'O chão deixa de ser mobília e entra no design.' },
  { id: 'eyetoy', name: 'EyeToy', fromYear: 2003, toYear: 2008, platforms: ['playstation-2'], costMultiplier: .14, months: .65, reach: .13, quality: 1, copy: 'A câmera precisa entender gente, luz ruim e sala apertada.' },
  { id: 'guitar', name: 'Controle-guitarra', fromYear: 2005, toYear: 2015, platforms: ['playstation-2', 'xbox-360', 'playstation-3', 'wii'], costMultiplier: .22, months: .8, reach: .28, quality: 2, genres: ['rhythm'], themes: ['music'], copy: 'Uma caixa enorme na loja pode virar o próprio anúncio.' },
  { id: 'balance-board', name: 'Wii Balance Board', fromYear: 2007, toYear: 2013, platforms: ['wii'], costMultiplier: .18, months: .7, reach: .2, quality: 1, copy: 'Peso e equilíbrio entram no controle; calibrar vira parte da produção.' },
  { id: 'kinect', name: 'Kinect', fromYear: 2010, toYear: 2017, platforms: ['xbox-360', 'xbox-one'], costMultiplier: .2, months: .85, reach: .24, quality: 1, copy: 'Sem botão para culpar: reconhecimento corporal precisa segurar a ideia.' },
])

export const MOTION_PLATFORMS = Object.freeze(['wii', 'wii-u', 'switch'])
export const CONTROL_SCHEMES = Object.freeze([
  { id: 'standard', label: 'Controles tradicionais', costMultiplier: 0, months: 0, innovation: 0 },
  { id: 'motion', label: 'Movimento obrigatório', costMultiplier: .1, months: .55, innovation: 5 },
  { id: 'hybrid', label: 'Movimento opcional', costMultiplier: .07, months: .35, innovation: 3 },
])

export const accessoryForId = id => ACCESSORIES.find(item => item.id === id) ?? null
export const controlSchemeForId = id => CONTROL_SCHEMES.find(item => item.id === id) ?? CONTROL_SCHEMES[0]

export function availableAccessories(platformIds, year) {
  return ACCESSORIES.filter(item => year >= item.fromYear && year <= (item.toYear ?? 9999) && platformIds.some(id => item.platforms.includes(id)))
}

export const supportsMotion = platformIds => platformIds.some(id => MOTION_PLATFORMS.includes(id))
