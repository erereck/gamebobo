// Eventos ligados a momentos reais da indústria. Mesmo formato de events.js.
export const REAL_EVENTS = [
  { id: 'crash-1983', icon: 'storm', title: 'O crash dos videogames chegou', text: 'Lojas devolvem cartuchos às pilhas.', when: { phase: 'any', minYear: 1983, maxYear: 1984 }, weight: 4, choices: [
    { label: 'Corta custos', effects: { money: 2500, mood: -10 }, result: 'Sobreviveu no aperto.' },
    { label: 'Aposta no PC', effects: { rp: 15, money: -1500 }, result: 'O computador não quebrou.' },
    { label: 'Ignora a crise', gamble: { chance: 0.35, win: { fansPct: 0.15 }, lose: { money: -4000 } }, winText: 'Sobrou espaço na prateleira.', loseText: 'A crise lembrou de você.' },
  ] },
  { id: 'selo-nintendo', icon: 'shield', title: 'A Nintendo exige o selo dela', text: 'Sem selo, nada de cartucho no NES.', when: { phase: 'any', minYear: 1985, maxYear: 1992, minGames: 1 }, weight: 3, choices: [
    { label: 'Paga o selo', effects: { money: -3000, salesMult: 1.2 }, result: 'Selo dourado na caixa.' },
    { label: 'Fica no PC', effects: { rp: 8 }, result: 'Liberdade tem seu preço.' },
  ] },
  { id: 'tectoy-traduz', icon: 'globe', title: 'A Tectoy quer traduzir seu jogo', text: 'Versão brasileira com personagem da TV.', when: { phase: 'any', minYear: 1989, maxYear: 1998, minGames: 1 }, weight: 3, choices: [
    { label: 'Fecha negócio', effects: { money: 4000, fansPct: 0.08 }, result: 'Sucesso nas lojas de bairro.' },
    { label: 'Mantém original', effects: { mood: 6 }, result: 'Arte intacta, bolso vazio.' },
  ] },
  { id: 'santa-ifigenia', icon: 'disc', title: 'Seu jogo no CD pirata da Santa Ifigênia', text: 'Coletânea com 300 jogos por R$ 10.', when: { phase: 'any', minYear: 1996, maxYear: 2008, minGames: 1 }, weight: 3, funny: true, choices: [
    { label: 'Processa', effects: { money: -2000, mood: -5 }, result: 'Ganhou nada. Perdeu tempo.' },
    { label: 'Vira marketing', effects: { fansPct: 0.12, salesMult: 0.9 }, result: 'Todo mundo conhece seu jogo.' },
  ] },
  { id: 'lan-house', icon: 'users', title: 'Lan house quer campeonato do seu jogo', when: { phase: 'any', minYear: 1999, maxYear: 2010, minGames: 1 }, weight: 3, choices: [
    { label: 'Patrocina', effects: { money: -2500, fansPct: 0.1 }, result: 'Final com 40 moleques gritando.' },
    { label: 'Manda pôster', effects: { money: -300, fansPct: 0.03 }, result: 'Pôster na parede, pelo menos.' },
  ] },
  { id: 'orkut-comunidade', icon: 'heartbreak', title: 'Comunidade no Orkut: "Eu odeio {lastgame}"', text: 'Já tem 4 mil membros.', when: { phase: 'any', minYear: 2004, maxYear: 2011, minGames: 1 }, weight: 2, funny: true, choices: [
    { label: 'Entra e responde', gamble: { chance: 0.4, win: { fansPct: 0.08 }, lose: { fansPct: -0.06, mood: -8 } }, winText: 'Viraram fãs com o bom humor.', loseText: 'Virou print. Pra sempre.' },
    { label: 'Finge que não viu', effects: { mood: -4 }, result: 'Melhor assim.' },
  ] },
  { id: 'steam-convite', icon: 'globe', title: 'A Valve chama seu jogo pra Steam', when: { phase: 'any', minYear: 2005, minGames: 2 }, weight: 3, choices: [
    { label: 'Entra na loja', effects: { salesMult: 1.25, money: -1000 }, result: 'Lista de desejos lotada.' },
    { label: 'Loja própria', effects: { rp: 10 }, result: 'Três clientes. Fiéis.' },
  ] },
  { id: 'app-store-destaque', icon: 'phone', title: 'A Apple destacou você na App Store', when: { phase: 'any', minYear: 2008, maxYear: 2018, minGames: 1 }, weight: 2, choices: [
    { label: 'Lança update', effects: { money: -1500, fansPct: 0.12 }, result: 'Downloads explodiram.' },
    { label: 'Só comemora', effects: { mood: 10, fansPct: 0.05 }, result: 'Bolo no escritório.' },
  ] },
  { id: 'twitch-streamer', icon: 'tv', title: 'Streamer gigante abriu seu jogo na Twitch', when: { phase: 'any', minYear: 2012, minGames: 1 }, weight: 3, choices: [
    { label: 'Manda mensagem', gamble: { chance: 0.55, win: { fansPct: 0.2, salesMult: 1.15 }, lose: { mood: -5 } }, winText: 'Ele leu ao vivo!', loseText: 'Ninguém viu no chat.' },
    { label: 'Assiste calado', effects: { mood: 8, fansPct: 0.05 }, result: 'Ele gostou da trilha.' },
  ] },
  { id: 'kickstarter', icon: 'cash', title: 'Fãs querem financiar seu próximo jogo', text: 'Campanha coletiva, metas e brindes.', when: { phase: 'idle', minYear: 2012, minGames: 2, minFans: 2000 }, weight: 2, choices: [
    { label: 'Abre campanha', gamble: { chance: 0.6, win: { money: 12000, fansPct: 0.05 }, lose: { mood: -12, fansPct: -0.03 } }, winText: 'Meta batida em 2 dias.', loseText: 'Faltou 4% pra meta.' },
    { label: 'Prefere sozinho', effects: { mood: 3 }, result: 'Sem brinde pra enviar.' },
  ] },
  { id: 'pokemon-go', icon: 'paw', title: 'Pokémon GO esvaziou o escritório', text: 'A equipe toda foi pra praça.', when: { phase: 'any', minYear: 2016, maxYear: 2017, minStaff: 2 }, weight: 6, funny: true, choices: [
    { label: 'Vai junto', effects: { mood: 15, energy: 10, weeks: 1 }, result: 'Pegaram um Snorlax.' },
    { label: 'Proíbe celular', effects: { mood: -12, pts: { fun: 1 } }, result: 'Revolta silenciosa.' },
  ] },
  { id: 'game-pass', icon: 'gift', title: 'O Game Pass quer seu catálogo', when: { phase: 'any', minYear: 2017, minGames: 3 }, weight: 2, choices: [
    { label: 'Aceita o cheque', effects: { money: 9000, salesMult: 0.85 }, result: 'Dinheiro garantido, vendas menores.' },
    { label: 'Recusa', effects: { salesMult: 1.05 }, result: 'Cada cópia conta.' },
  ] },
  { id: 'home-office', icon: 'home', title: 'Todo mundo vai trabalhar de casa', text: 'O escritório fica vazio por meses.', when: { phase: 'any', minYear: 2020, maxYear: 2020, minStaff: 2 }, weight: 8, choices: [
    { label: 'Manda PCs', effects: { money: -3000, mood: 8 }, result: 'Reunião com gato no colo.' },
    { label: 'Improvisa', effects: { mood: -6, bugs: 4 }, result: 'Internet caiu na demo.' },
  ] },
  { id: 'ia-gerativa', icon: 'robot', title: 'Investidor quer arte toda feita por IA', when: { phase: 'any', minYear: 2023, minStaff: 2 }, weight: 2, choices: [
    { label: 'Topa', effects: { money: 6000, fansPct: -0.08, mood: -10 }, result: 'Fãs contaram os dedos.' },
    { label: 'Recusa', effects: { mood: 10, fansPct: 0.03 }, result: 'A equipe te abraçou.' },
  ] },
]
