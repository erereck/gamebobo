export const GAME_EVENTS = Object.freeze([
  { id: 'city-fair', name: 'Feira de informática da cidade', tier: 'LOCAL', fromYear: 1980, months: [1, 4, 7, 10], minReputation: 0, cost: 350, followers: 18, reputation: 0, research: 2, hype: 2, copy: 'Uma mesa, extensão emprestada e gente parando para apertar dois botões.' },
  { id: 'regional-meet', name: 'Encontro regional de jogos', tier: 'REGIONAL', fromYear: 1985, months: [2, 8], minReputation: 10, cost: 1400, followers: 90, reputation: 1, research: 4, hype: 4, copy: 'Desenvolvedores, lojistas e imprensa especializada dividem o mesmo corredor.' },
  { id: 'e3', name: 'E3', tier: 'INTERNACIONAL', fromYear: 1995, toYear: 2019, months: [5], minReputation: 48, cost: 18000, followers: 1100, reputation: 3, research: 7, hype: 11, copy: 'Los Angeles, reuniões curtas e um pavilhão onde todo anúncio disputa o mesmo minuto.' },
  { id: 'gamescom', name: 'gamescom', tier: 'INTERNACIONAL', fromYear: 2009, months: [7], minReputation: 42, cost: 15000, followers: 900, reputation: 3, research: 7, hype: 9, copy: 'Colônia recebe público, imprensa e uma quantidade imprudente de builds.' },
  { id: 'bgs', name: 'Brasil Game Show', tier: 'NACIONAL', fromYear: 2009, months: [9], minReputation: 24, cost: 7500, followers: 520, reputation: 2, research: 5, hype: 8, copy: 'A feira brasileira abre espaço para público, negócios e uma fila em volta do estande.' },
  { id: 'game-awards', name: 'The Game Awards', tier: 'PALCO GLOBAL', fromYear: 2014, months: [11], minReputation: 72, cost: 26000, followers: 2200, reputation: 4, research: 5, hype: 14, copy: 'Um trailer curto diante da indústria inteira. O convite vale mais que o carpete.' },
  { id: 'digital-indie', name: 'Mostra digital independente', tier: 'ONLINE', fromYear: 2020, toYear: 2021, months: [4], minReputation: 8, cost: 1100, followers: 280, reputation: 1, research: 3, hype: 6, copy: 'Uma transmissão montada de casa conecta demos, entrevistas e públicos distantes.' },
  { id: 'summer-game-fest', name: 'Summer Game Fest', tier: 'PALCO GLOBAL', fromYear: 2020, months: [5], minReputation: 58, cost: 21000, followers: 1800, reputation: 4, research: 6, hype: 13, copy: 'A temporada de anúncios digitais coloca o trailer diante de uma audiência mundial.' },
])

export const eventExistsInYear = (event, year) => year >= event.fromYear && year <= (event.toYear ?? 9999)
export const eventsThisMonth = state => GAME_EVENTS.filter(event => eventExistsInYear(event, state.date.year) && event.months.includes(state.date.month))
export const attendedEventKey = (event, year) => `${event.id}:${year}`
