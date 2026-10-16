// Conquistas. Recompensa proporcional à raridade:
// comum: 1500 ou rp 10 · raro: 5000 / rp 20 / fãs 3% · épico: 15000 / rp 35 / fãs 8% · lendário: 60000 / fãs 20%.

export const ACHIEVEMENTS = [
  // lançamentos
  { id: 'assoprou-a-fita', label: 'Assoprou a fita', icon: 'cartridge', rarity: 'comum', cond: { stat: 'gamesReleased', gte: 1 }, reward: { money: 1500 } },
  { id: 'linha-de-producao', label: 'Linha de produção', icon: 'gear', rarity: 'comum', cond: { stat: 'gamesReleased', gte: 5 }, reward: { rp: 10 } },
  { id: 'fabrica-de-cartucho', label: 'Fábrica de cartucho', icon: 'building', rarity: 'raro', cond: { stat: 'gamesReleased', gte: 10 }, reward: { money: 5000 } },
  { id: 'catalogo-de-locadora', label: 'Catálogo de locadora', icon: 'book', rarity: 'epico', cond: { stat: 'gamesReleased', gte: 25 }, reward: { money: 15000 } },
  { id: 'prateleira-infinita', label: 'Prateleira infinita', icon: 'crown', rarity: 'lendario', cond: { stat: 'gamesReleased', gte: 50 }, reward: { money: 60000 } },

  // imprensa
  { id: 'microfone-na-cara', label: 'Microfone na cara', icon: 'megaphone', rarity: 'comum', cond: { stat: 'interviews', gte: 1 }, reward: { rp: 10 } },
  { id: 'figurinha-da-tv', label: 'Figurinha da TV', icon: 'tv', rarity: 'raro', cond: { stat: 'interviews', gte: 10 }, reward: { fansPct: 0.03 } },
  { id: 'lacrou', label: 'Lacrou', icon: 'fire', rarity: 'raro', cond: { stat: 'spicyWins', gte: 5 }, reward: { money: 5000 } },
  { id: 'assessoria-pediu-demissao', label: 'Assessoria pediu demissão', icon: 'warning', rarity: 'epico', cond: { stat: 'spicyLosses', gte: 8 }, reward: { rp: 35 } },

  // notas
  { id: 'passou-de-ano', label: 'Passou de ano', icon: 'check', rarity: 'comum', cond: { stat: 'bestScore', gte: 7 }, reward: { money: 1500 } },
  { id: 'capa-de-revista', label: 'Capa de revista', icon: 'newspaper', rarity: 'raro', cond: { stat: 'bestScore', gte: 8.5 }, reward: { fansPct: 0.03 } },
  { id: 'obra-prima-de-padaria', label: 'Obra-prima de padaria', icon: 'star', rarity: 'epico', cond: { stat: 'bestScore', gte: 9.5 }, reward: { fansPct: 0.08 } },
  { id: 'nota-dez-mae', label: 'Nota dez, mãe!', icon: 'trophy', rarity: 'lendario', cond: { stat: 'bestScore', gte: 10 }, reward: { fansPct: 0.2 } },
  { id: 'hall-da-fama', label: 'Hall da fama', icon: 'medal', rarity: 'epico', cond: { stat: 'hallOfFame', gte: 1 }, reward: { money: 15000 } },
  { id: 'panteao-bobo', label: 'Panteão bobo', icon: 'castle', rarity: 'lendario', cond: { stat: 'hallOfFame', gte: 5 }, reward: { money: 60000 } },
  { id: 'quatro-dez', label: 'Quatro dez!', icon: 'crown', rarity: 'lendario', cond: { stat: 'perfectGames', gte: 1 }, reward: { fansPct: 0.2 } },

  // vendas
  { id: 'dez-mil-fitas', label: 'Dez mil fitas', icon: 'cartridge', rarity: 'comum', cond: { stat: 'totalCopies', gte: 10000 }, reward: { money: 1500 } },
  { id: 'cem-mil-sopradas', label: 'Cem mil sopradas', icon: 'disc', rarity: 'raro', cond: { stat: 'totalCopies', gte: 100000 }, reward: { money: 5000 } },
  { id: 'milhao-de-copias', label: 'Milhão de cópias', icon: 'chart', rarity: 'epico', cond: { stat: 'totalCopies', gte: 1000000 }, reward: { money: 15000 } },
  { id: 'tem-em-toda-casa', label: 'Tem em toda casa', icon: 'globe', rarity: 'lendario', cond: { stat: 'totalCopies', gte: 10000000 }, reward: { money: 60000 } },
  { id: 'hit-de-verao', label: 'Hit de verão', icon: 'fire', rarity: 'raro', cond: { stat: 'bestCopies', gte: 250000 }, reward: { fansPct: 0.03 } },
  { id: 'fenomeno-de-vendas', label: 'Fenômeno de vendas', icon: 'rocket', rarity: 'epico', cond: { stat: 'bestCopies', gte: 2000000 }, reward: { fansPct: 0.08 } },
  { id: 'topo-da-parada', label: 'Topo da parada', icon: 'up', rarity: 'raro', cond: { stat: 'chartNumberOnes', gte: 1 }, reward: { money: 5000 } },
  { id: 'dono-do-ranking', label: 'Dono do ranking', icon: 'crown', rarity: 'epico', cond: { stat: 'chartNumberOnes', gte: 10 }, reward: { fansPct: 0.08 } },

  // fãs
  { id: 'fa-clube-do-bairro', label: 'Fã-clube do bairro', icon: 'fans', rarity: 'comum', cond: { stat: 'fans', gte: 1000 }, reward: { money: 1500 } },
  { id: 'fa-clube-estadual', label: 'Fã-clube estadual', icon: 'users', rarity: 'raro', cond: { stat: 'fans', gte: 50000 }, reward: { fansPct: 0.03 } },
  { id: 'torcida-organizada', label: 'Torcida organizada', icon: 'megaphone', rarity: 'epico', cond: { stat: 'fans', gte: 500000 }, reward: { fansPct: 0.08 } },
  { id: 'multidao-de-fas', label: 'Multidão de fãs', icon: 'confetti', rarity: 'lendario', cond: { stat: 'fans', gte: 5000000 }, reward: { money: 60000 } },

  // dinheiro
  { id: 'colchao-de-dinheiro', label: 'Colchão de dinheiro', icon: 'money', rarity: 'raro', cond: { stat: 'money', gte: 100000 }, reward: { rp: 20 } },
  { id: 'piscina-de-moedas', label: 'Piscina de moedas', icon: 'coin', rarity: 'epico', cond: { stat: 'money', gte: 1000000 }, reward: { rp: 35 } },
  { id: 'banco-particular', label: 'Banco particular', icon: 'building', rarity: 'lendario', cond: { stat: 'money', gte: 5000000 }, reward: { fansPct: 0.2 } },
  { id: 'primeiro-milhao', label: 'Primeiro milhão', icon: 'chart', rarity: 'raro', cond: { stat: 'totalRevenue', gte: 1000000 }, reward: { money: 5000 } },
  { id: 'imperio-do-joystick', label: 'Império do joystick', icon: 'gamepad', rarity: 'epico', cond: { stat: 'totalRevenue', gte: 20000000 }, reward: { money: 15000 } },

  // equipe e escritório
  { id: 'virou-panelinha', label: 'Virou panelinha', icon: 'team', rarity: 'comum', cond: { stat: 'staffCount', gte: 3 }, reward: { money: 1500 } },
  { id: 'time-de-society', label: 'Time de society', icon: 'ball', rarity: 'raro', cond: { stat: 'staffCount', gte: 8 }, reward: { money: 5000 } },
  { id: 'firma-de-verdade', label: 'Firma de verdade', icon: 'briefcase', rarity: 'epico', cond: { stat: 'staffCount', gte: 15 }, reward: { money: 15000 } },
  { id: 'saiu-da-garagem', label: 'Saiu da garagem', icon: 'door', rarity: 'comum', cond: { stat: 'officeLevel', gte: 1 }, reward: { money: 1500 } },
  { id: 'sala-comercial', label: 'Sala comercial', icon: 'building', rarity: 'raro', cond: { stat: 'officeLevel', gte: 2 }, reward: { money: 5000 } },
  { id: 'arranha-ceu-bobo', label: 'Arranha-céu bobo', icon: 'castle', rarity: 'epico', cond: { stat: 'officeLevel', gte: 4 }, reward: { fansPct: 0.08 } },
  { id: 'primeiro-enfeite', label: 'Primeiro enfeite', icon: 'plant', rarity: 'comum', cond: { stat: 'decorOwned', gte: 1 }, reward: { rp: 10 } },
  { id: 'escritorio-de-revista', label: 'Escritório de revista', icon: 'sofa', rarity: 'raro', cond: { stat: 'decorOwned', gte: 8 }, reward: { money: 5000 } },
  { id: 'dorme-na-firma', label: 'Dorme na firma', icon: 'zzz', rarity: 'comum', cond: { stat: 'crunchWeeks', gte: 10 }, reward: { rp: 10 } },
  { id: 'olheiras-eternas', label: 'Olheiras eternas', icon: 'coffee', rarity: 'raro', cond: { stat: 'crunchWeeks', gte: 50 }, reward: { money: 5000 } },
  { id: 'chefe-ouvinte', label: 'Chefe ouvinte', icon: 'bulb', rarity: 'comum', cond: { stat: 'idealsAccepted', gte: 10 }, reward: { rp: 10 } },
  { id: 'porta-sempre-aberta', label: 'Porta sempre aberta', icon: 'door', rarity: 'raro', cond: { stat: 'idealsAccepted', gte: 50 }, reward: { rp: 20 } },

  // prêmios
  { id: 'trofeu-na-estante', label: 'Troféu na estante', icon: 'trophy', rarity: 'raro', cond: { stat: 'awardsWon', gte: 1 }, reward: { fansPct: 0.03 } },
  { id: 'tapete-vermelho', label: 'Tapete vermelho', icon: 'medal', rarity: 'epico', cond: { stat: 'awardsWon', gte: 5 }, reward: { money: 15000 } },
  { id: 'lenda-da-premiacao', label: 'Lenda da premiação', icon: 'crown', rarity: 'lendario', cond: { stat: 'awardsWon', gte: 15 }, reward: { fansPct: 0.2 } },

  // criação
  { id: 'parte-dois', label: 'Parte dois', icon: 'disc', rarity: 'comum', cond: { stat: 'sequelsReleased', gte: 1 }, reward: { money: 1500 } },
  { id: 'franquia-de-respeito', label: 'Franquia de respeito', icon: 'shield', rarity: 'raro', cond: { stat: 'sequelsReleased', gte: 5 }, reward: { fansPct: 0.03 } },
  { id: 'mistureba', label: 'Mistureba', icon: 'flask', rarity: 'comum', cond: { stat: 'combosDiscovered', gte: 10 }, reward: { rp: 10 } },
  { id: 'cientista-maluco', label: 'Cientista maluco', icon: 'bolt', rarity: 'raro', cond: { stat: 'combosDiscovered', gte: 50 }, reward: { rp: 20 } },
  { id: 'paladar-refinado', label: 'Paladar refinado', icon: 'chefhat', rarity: 'raro', cond: { stat: 'greatCombos', gte: 5 }, reward: { money: 5000 } },
  { id: 'ecletico', label: 'Eclético', icon: 'puzzle', rarity: 'comum', cond: { stat: 'genresTried', gte: 5 }, reward: { rp: 10 } },
  { id: 'faz-de-tudo', label: 'Faz de tudo', icon: 'wand', rarity: 'epico', cond: { stat: 'genresTried', gte: 20 }, reward: { rp: 35 } },
  { id: 'multiplataforma', label: 'Multiplataforma', icon: 'gamepad', rarity: 'comum', cond: { stat: 'platformsUsed', gte: 3 }, reward: { money: 1500 } },
  { id: 'colecionador-de-consoles', label: 'Colecionador de consoles', icon: 'tv', rarity: 'raro', cond: { stat: 'platformsUsed', gte: 10 }, reward: { money: 5000 } },
  { id: 'laboratorio-de-garagem', label: 'Laboratório de garagem', icon: 'flask', rarity: 'comum', cond: { stat: 'researchDone', gte: 5 }, reward: { money: 1500 } },
  { id: 'cientista-do-pixel', label: 'Cientista do pixel', icon: 'graduation', rarity: 'raro', cond: { stat: 'researchDone', gte: 20 }, reward: { rp: 20 } },

  // trajetória
  { id: 'bico-honesto', label: 'Bico honesto', icon: 'hammer', rarity: 'comum', cond: { stat: 'freelasDone', gte: 1 }, reward: { money: 1500 } },
  { id: 'rei-do-bico', label: 'Rei do bico', icon: 'briefcase', rarity: 'raro', cond: { stat: 'freelasDone', gte: 10 }, reward: { money: 5000 } },
  { id: 'quebrou-e-voltou', label: 'Quebrou e voltou', icon: 'parachute', rarity: 'comum', cond: { stat: 'bankruptcies', gte: 1 }, reward: { money: 1500 } },
  { id: 'micou-feio', label: 'Micou feio', icon: 'thumbsdown', rarity: 'comum', cond: { stat: 'flops', gte: 1 }, reward: { rp: 10 } },
  { id: 'chuva-de-bugs', label: 'Chuva de bugs', icon: 'bug', rarity: 'raro', cond: { stat: 'flops', gte: 5 }, reward: { rp: 20 } },
  { id: 'uma-decada-de-bugs', label: 'Uma década de bugs', icon: 'calendar', rarity: 'raro', cond: { stat: 'yearsActive', gte: 10 }, reward: { money: 5000 } },
  { id: 'patrimonio-nacional', label: 'Patrimônio nacional', icon: 'medal', rarity: 'epico', cond: { stat: 'yearsActive', gte: 30 }, reward: { fansPct: 0.08 } },
  { id: 'firma-imortal', label: 'Firma imortal', icon: 'crown', rarity: 'lendario', cond: { stat: 'yearsActive', gte: 50 }, reward: { money: 60000 } },
  { id: 'ja-vi-de-tudo', label: 'Já vi de tudo', icon: 'eye', rarity: 'comum', cond: { stat: 'eventsSeen', gte: 25 }, reward: { rp: 10 } },
  { id: 'nada-me-surpreende', label: 'Nada me surpreende', icon: 'exclaim', rarity: 'raro', cond: { stat: 'eventsSeen', gte: 100 }, reward: { money: 5000 } },
  { id: 'fregues-do-camelo', label: 'Freguês do camelô', icon: 'handshake', rarity: 'comum', cond: { stat: 'cameloDeals', gte: 1 }, reward: { money: 1500 } },
  { id: 'socio-do-camelo', label: 'Sócio do camelô', icon: 'coin', rarity: 'raro', cond: { stat: 'cameloDeals', gte: 10 }, reward: { rp: 20 } },
];
