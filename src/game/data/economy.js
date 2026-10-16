// Toda a economia mora aqui. Valores em dinheiro estão em "unidades de 1980";
// o motor multiplica por moneyScale(ano) na hora de cobrar ou pagar.

const lerpAnchors = (anchors, year) => {
  if (year <= anchors[0][0]) return anchors[0][1]
  for (let i = 1; i < anchors.length; i += 1) {
    const [y1, v1] = anchors[i]
    const [y0, v0] = anchors[i - 1]
    if (year <= y1) return v0 + (v1 - v0) * (year - y0) / (y1 - y0)
  }
  return anchors.at(-1)[1]
}

// Cópias vendidas por um jogo pequeno nota 100 numa plataforma média, sem fãs nem hype.
export const DEMAND = [[1980, 150_000], [1985, 220_000], [1990, 330_000], [1995, 480_000], [2000, 650_000], [2005, 820_000], [2010, 1_000_000], [2015, 1_250_000], [2020, 1_500_000], [2030, 1_900_000], [2040, 2_300_000], [2060, 2_800_000]]
// O que sobra para o estúdio por cópia, já descontando loja, fábrica e plataforma.
export const NET_PRICE = [[1980, 1.72], [1990, 2.35], [2000, 2.8], [2010, 2.15], [2020, 2.55], [2030, 2.75], [2040, 2.95], [2060, 3.25]]

export const demandAt = year => lerpAnchors(DEMAND, year)
export const netPriceAt = year => lerpAnchors(NET_PRICE, year)
export const moneyScale = year => (demandAt(year) * netPriceAt(year)) / (DEMAND[0][1] * NET_PRICE[0][1])

// Régua técnica da época: quanto trabalho um jogo "normal" daquele ano carrega.
export const eraBar = year => 1.06 ** (year - 1980)

export const START_MONEY = 15000
export const FOUNDER_LIVING = 380 // custo de vida mensal do fundador

export const SIZES = [
  { id: 'micro', label: 'Micro', weeks: 8, cost: 3200, reach: .2, team: 1, office: 0, cap: 80 },
  { id: 'pequeno', label: 'Pequeno', weeks: 14, cost: 13000, reach: .65, team: 1.6, office: 0, cap: 88 },
  { id: 'medio', label: 'Médio', weeks: 22, cost: 60000, reach: 1.5, team: 3, office: 1, cap: 94 },
  { id: 'grande', label: 'Grande', weeks: 32, cost: 160000, reach: 2.7, team: 6, office: 2, cap: 98 },
  { id: 'aaa', label: 'AAA', weeks: 44, cost: 650000, reach: 5, team: 11, office: 3, cap: 100 },
]
export const sizeById = id => SIZES.find(item => item.id === id)

export const PACES = {
  calmo: { id: 'calmo', label: 'Tranquilo', icon: 'snail', output: .82, energy: 1, bugs: .85 },
  normal: { id: 'normal', label: 'Normal', icon: 'play', output: 1, energy: -2.5, bugs: 1 },
  crunch: { id: 'crunch', label: 'Crunch', icon: 'fire', output: 1.38, energy: -8, bugs: 1.55 },
}

// Fases: o foco escolhido no começo de cada fase mistura a produção.
export const PHASES = [
  { id: 'prototipo', label: 'Protótipo', share: .25, base: { fun: 1.1, art: .7, sound: .6, idea: 1.4 } },
  { id: 'producao', label: 'Produção', share: .5, base: { fun: 1, art: 1.1, sound: .9, idea: .9 } },
  { id: 'polimento', label: 'Polimento', share: .25, base: { fun: .9, art: 1.2, sound: 1.2, idea: .5 } },
]

export const PHASE_FOCUS = {
  prototipo: [
    { id: 'mecanica', label: 'Mecânica', icon: 'gamepad', mix: { fun: 1.6 } },
    { id: 'conceito', label: 'Conceito', icon: 'bulb', mix: { idea: 1.6 } },
    { id: 'clima', label: 'Clima', icon: 'brush', mix: { art: 1.4, sound: 1.3 } },
  ],
  producao: [
    { id: 'conteudo', label: 'Conteúdo', icon: 'cube', mix: { fun: 1.35, idea: 1.2 } },
    { id: 'arte', label: 'Arte', icon: 'brush', mix: { art: 1.6 } },
    { id: 'trilha', label: 'Trilha', icon: 'note', mix: { sound: 1.7 } },
  ],
  polimento: [
    { id: 'acabamento', label: 'Acabamento', icon: 'sparkle', mix: { art: 1.4, fun: 1.15 }, bugFix: 1 },
    { id: 'cacabugs', label: 'Caça-bugs', icon: 'bug', mix: { fun: .8, art: .8, sound: .8, idea: .6 }, bugFix: 2.6 },
    { id: 'ousadia', label: 'Ousadia', icon: 'fire', mix: { idea: 1.7 }, bugFix: .4, bugs: 1.4 },
  ],
}

export const OFFICES = [
  { level: 0, id: 'quarto', label: 'Quarto', cap: 1, cost: 0, rent: 0, slots: 3 },
  { level: 1, id: 'garagem', label: 'Garagem', cap: 3, cost: 22000, rent: 500, slots: 5 },
  { level: 2, id: 'salinha', label: 'Salinha', cap: 6, cost: 90000, rent: 1800, slots: 7 },
  { level: 3, id: 'escritorio', label: 'Escritório', cap: 10, cost: 500000, rent: 5000, slots: 10 },
  { level: 4, id: 'sede', label: 'Sede', cap: 16, cost: 2500000, rent: 14000, slots: 13 },
  { level: 5, id: 'torre', label: 'Torre', cap: 24, cost: 6500000, rent: 32000, slots: 16 },
]

export const DECOR = [
  { id: 'plant', label: 'Planta', icon: 'plant', cost: 300, mood: 3, desc: '+humor' },
  { id: 'coffee', label: 'Cafeteira', icon: 'coffee', cost: 900, energy: 2.5, desc: '+energia' },
  { id: 'beanbag', label: 'Pufe', icon: 'sofa', cost: 700, mood: 2, energy: 1, desc: '+descanso' },
  { id: 'whiteboard', label: 'Quadro branco', icon: 'pencil', cost: 1400, gen: { idea: 1.06 }, desc: '+ideia' },
  { id: 'cat', label: 'Gato', icon: 'cat', cost: 1200, mood: 6, desc: '+humor, +caos' },
  { id: 'sofa', label: 'Sofá', icon: 'sofa', cost: 1800, energy: 3.5, desc: '+energia' },
  { id: 'fridge', label: 'Geladeira de energético', icon: 'bolt', cost: 2000, energy: 3, bugs: 1.04, desc: '+energia, +bugs' },
  { id: 'trophyshelf', label: 'Estante de troféus', icon: 'trophy', cost: 1600, mood: 2, desc: 'mostra seus prêmios' },
  { id: 'arcade', label: 'Fliperama', icon: 'arcade', cost: 2800, mood: 4, gen: { fun: 1.04 }, desc: '+diversão' },
  { id: 'foosball', label: 'Pebolim', icon: 'ball', cost: 2400, mood: 5, desc: '+humor' },
  { id: 'aquarium', label: 'Aquário', icon: 'globe', cost: 3200, mood: 4, energy: 1, desc: '+calma' },
  { id: 'neon', label: 'Letreiro neon', icon: 'sparkle', cost: 2600, fans: 1.04, desc: '+fãs' },
]
export const decorById = id => DECOR.find(item => item.id === id)

// Pesquisa. engine = multiplica a produção de todo mundo.
export const TECHS = [
  { id: 'motor8', label: 'Motor 8-bit', icon: 'chip', year: 1983, rp: 30, cost: 2500, engine: 1.25 },
  { id: 'kitsom', label: 'Kit de som', icon: 'note', year: 1982, rp: 20, cost: 1500, gen: { sound: 1.15 } },
  { id: 'pixelart', label: 'Editor de sprites', icon: 'brush', year: 1984, rp: 25, cost: 2000, gen: { art: 1.15 } },
  { id: 'pesquisa', label: 'Pesquisa de mercado', icon: 'eye', year: 1985, rp: 30, cost: 3000, reveal: true },
  { id: 'designdoc', label: 'Documento de design', icon: 'book', year: 1986, rp: 35, cost: 3000, gen: { idea: 1.15 } },
  { id: 'motor16', label: 'Motor 16-bit', icon: 'chip', year: 1988, rp: 60, cost: 7000, engine: 1.25 },
  { id: 'qa', label: 'Testes de qualidade', icon: 'bug', year: 1990, rp: 50, cost: 6000, bugs: .75 },
  { id: 'motor3d', label: 'Motor 3D', icon: 'cube', year: 1994, rp: 110, cost: 18000, engine: 1.3 },
  { id: 'online', label: 'Código de rede', icon: 'wifi', year: 1996, rp: 90, cost: 14000, gen: { fun: 1.05 } },
  { id: 'orquestra', label: 'Trilha orquestrada', icon: 'headphones', year: 1997, rp: 80, cost: 12000, gen: { sound: 1.15 } },
  { id: 'shaders', label: 'Shaders', icon: 'sparkle', year: 2001, rp: 150, cost: 28000, engine: 1.25 },
  { id: 'marketingdig', label: 'Marketing digital', icon: 'megaphone', year: 2003, rp: 100, cost: 16000, hype: 1.3 },
  { id: 'fisica', label: 'Física realista', icon: 'ball', year: 2004, rp: 140, cost: 26000, engine: 1.15 },
  { id: 'hd', label: 'Motor HD', icon: 'tv', year: 2006, rp: 210, cost: 42000, engine: 1.25 },
  { id: 'conquistas', label: 'Conquistas', icon: 'medal', year: 2007, rp: 110, cost: 18000, sales: 1.05 },
  { id: 'mocap', label: 'Captura de movimento', icon: 'users', year: 2008, rp: 170, cost: 36000, gen: { art: 1.12 } },
  { id: 'procedural', label: 'Geração procedural', icon: 'dice', year: 2010, rp: 180, cost: 34000, gen: { idea: 1.15 } },
  { id: 'telemetria', label: 'Telemetria', icon: 'chart', year: 2012, rp: 170, cost: 32000, bugs: .8, gen: { fun: 1.05 } },
  { id: 'pbr', label: 'Render PBR', icon: 'sun', year: 2013, rp: 280, cost: 60000, engine: 1.25 },
  { id: 'streamkit', label: 'Kit de streamer', icon: 'phone', year: 2014, rp: 150, cost: 30000, hype: 1.25 },
  { id: 'crossplay', label: 'Crossplay', icon: 'handshake', year: 2018, rp: 200, cost: 46000, sales: 1.08 },
  { id: 'raytrace', label: 'Ray tracing', icon: 'spark', year: 2019, rp: 330, cost: 80000, engine: 1.2 },
  { id: 'iaassist', label: 'IA assistente', icon: 'robot', year: 2025, rp: 400, cost: 110000, engine: 1.25 },
  { id: 'nuvemtech', label: 'Servidores na nuvem', icon: 'globe', year: 2027, rp: 300, cost: 90000, sales: 1.06, bugs: .9 },
  { id: 'neural', label: 'Motor neural', icon: 'bulb', year: 2034, rp: 520, cost: 160000, engine: 1.25 },
]
export const techById = id => TECHS.find(item => item.id === id)

// Quanto um estúdio em dia com as ferramentas da época produz a mais que em 1980.
export const expectedEngine = year => TECHS.filter(tech => tech.engine && tech.year <= year - 1).reduce((m, tech) => m * tech.engine, 1)
// Talento médio do mercado: acompanha a régua técnica que as ferramentas não cobrem.
export const eraSkillFactor = year => Math.max(1, eraBar(year) / expectedEngine(year))

export const MARKETING = [
  { id: 'panfleto', label: 'Panfleto na locadora', icon: 'newspaper', from: 1980, to: 2002, cost: 600, hype: 8 },
  { id: 'revista', label: 'Anúncio em revista', icon: 'book', from: 1980, to: 2010, cost: 2200, hype: 15 },
  { id: 'outdoor', label: 'Outdoor', icon: 'building', from: 1980, to: 9999, cost: 5000, hype: 20 },
  { id: 'tv', label: 'Comercial de TV', icon: 'tv', from: 1986, to: 2016, cost: 11000, hype: 32 },
  { id: 'feira', label: 'Estande em feira', icon: 'users', from: 1988, to: 9999, cost: 7000, hype: 24, fansPct: .03 },
  { id: 'banner', label: 'Banner no portal', icon: 'globe', from: 1997, to: 2012, cost: 2600, hype: 16 },
  { id: 'trailer', label: 'Trailer online', icon: 'play', from: 2006, to: 9999, cost: 4000, hype: 22 },
  { id: 'streamer', label: 'Chave pro streamer', icon: 'phone', from: 2012, to: 9999, cost: 2500, gamble: { chance: .55, win: 34, lose: 5 } },
  { id: 'dancinha', label: 'Dancinha viral', icon: 'note', from: 2019, to: 9999, cost: 900, gamble: { chance: .3, win: 42, lose: 2 } },
]

export const ERAS = [
  { id: 'fliper', label: 'Era do Fliperama', from: 1980, to: 1984, sky: ['#ff8fa3', '#ffd6a5'], monitor: 'crt', floor: '#c9a27a', wall: '#f1e3c8' },
  { id: 'cartucho', label: 'Era do Cartucho', from: 1985, to: 1993, sky: ['#7bdff2', '#f7d6e0'], monitor: 'crt', floor: '#b98b64', wall: '#efe6d2' },
  { id: 'cd', label: 'Era do CD', from: 1994, to: 2002, sky: ['#9b8cff', '#ffd1a1'], monitor: 'crt', floor: '#8f8a83', wall: '#e3e8ee' },
  { id: 'lanhouse', label: 'Era da Lan House', from: 2003, to: 2007, sky: ['#69d2a4', '#f6f2b4'], monitor: 'flat', floor: '#7f8a96', wall: '#e8eef2' },
  { id: 'app', label: 'Era dos Apps', from: 2008, to: 2013, sky: ['#5ec8f2', '#fdf6e3'], monitor: 'flat', floor: '#d8c3a5', wall: '#f7f4ef' },
  { id: 'stream', label: 'Era do Streamer', from: 2014, to: 2020, sky: ['#b28dff', '#ffc8dd'], monitor: 'dual', floor: '#e0d4c3', wall: '#f4f1ee' },
  { id: 'algoritmo', label: 'Era do Algoritmo', from: 2021, to: 2029, sky: ['#3ec1d3', '#ffe7b3'], monitor: 'dual', floor: '#c7b8a6', wall: '#eef0f2' },
  { id: 'futuro', label: 'Futuro Bobo', from: 2030, to: 9999, sky: ['#4b3fbf', '#7ff0d8'], monitor: 'holo', floor: '#9aa3b5', wall: '#e9ecf5' },
]
export const eraAt = year => ERAS.find(era => year >= era.from && year <= era.to) ?? ERAS.at(-1)

export const START_ERAS = [
  { year: 1980, label: '1980', tag: 'Fliperama', icon: 'arcade' },
  { year: 1988, label: '1988', tag: 'Cartucho', icon: 'cartridge' },
  { year: 1995, label: '1995', tag: 'CD', icon: 'disc' },
  { year: 2004, label: '2004', tag: 'Lan house', icon: 'users' },
  { year: 2012, label: '2012', tag: 'Indie', icon: 'phone' },
  { year: 2020, label: '2020', tag: 'Streamer', icon: 'headphones' },
]

export const WEEKS_PER_MONTH = 4
export const WEEKS_PER_YEAR = 48
export const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
