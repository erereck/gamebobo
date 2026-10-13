// Veículos de crítica (paródias) e frases de review.
// bias: tendência da nota (-0.6 = carrasco, +0.6 = bonzinho). Sempre há 4+ ativos por ano (1980-2045+).

export const OUTLETS = [
  // anos 80
  { id: 'jornal-do-fliperama', name: 'Jornal do Fliperama', minYear: 1980, maxYear: 1992, bias: 0.1, icon: 'newspaper' },
  { id: 'revista-videojogo', name: 'Revista VideoJogo', minYear: 1980, maxYear: 1993, bias: 0, icon: 'book' },
  { id: 'dicas-truques-ze', name: 'Dicas & Truques do Zé', minYear: 1980, maxYear: 1996, bias: 0.3, icon: 'pencil' },
  { id: 'boletim-atarizinho', name: 'Boletim do Clube Atarizinho', minYear: 1980, maxYear: 1988, bias: 0.2, icon: 'mail' },
  { id: 'reacao-games', name: 'Reação Games', minYear: 1985, maxYear: 2005, bias: 0.1, icon: 'fire' },
  // anos 90
  { id: 'super-gamer-pauer', name: 'Super Gamer Pauer', minYear: 1990, maxYear: 2002, bias: 0.2, icon: 'bolt' },
  { id: 'mundo-ninten', name: 'Mundo Ninten', minYear: 1992, maxYear: 2001, bias: 0.4, icon: 'mushroom' },
  { id: 'gamers-bobos', name: 'Gamers Bobos', minYear: 1993, maxYear: 2006, bias: -0.1, icon: 'gamepad' },
  { id: 'egmanha', name: 'EGManhã', minYear: 1995, maxYear: 2008, bias: -0.2, icon: 'eye' },
  // portais dos anos 2000
  { id: 'gameponto', name: 'GamePonto', minYear: 1998, maxYear: 2025, bias: -0.1, icon: 'globe' },
  { id: 'portal-jogaco', name: 'Portal Jogaço', minYear: 1999, maxYear: 2015, bias: 0.15, icon: 'wifi' },
  { id: 'ignao', name: 'IGNão', minYear: 2000, maxYear: 9999, bias: 0, icon: 'star' },
  { id: 'arena-bobo', name: 'Arena Bobo', minYear: 2001, maxYear: 2018, bias: 0.1, icon: 'trophy' },
  // sites dos anos 2010
  { id: 'kotaco', name: 'Kotaco', minYear: 2005, maxYear: 2040, bias: -0.3, icon: 'laugh' },
  { id: 'metacritica-media', name: 'Metacrítica Média', minYear: 2005, maxYear: 9999, bias: -0.05, icon: 'chart' },
  { id: 'blog-jogazera', name: 'Blog Jogazera', minYear: 2008, maxYear: 2020, bias: 0.25, icon: 'pencil' },
  { id: 'poligono-torto', name: 'Polígono Torto', minYear: 2012, maxYear: 9999, bias: -0.2, icon: 'cube' },
  // canais e lives
  { id: 'canal-tio-review', name: 'Canal do Tio Review', minYear: 2014, maxYear: 9999, bias: 0.3, icon: 'tv' },
  { id: 'boteco-gamer', name: 'Podcast Boteco Gamer', minYear: 2016, maxYear: 9999, bias: 0.1, icon: 'headphones' },
  { id: 'live-gameplayzao', name: 'Live do Gameplayzão', minYear: 2018, maxYear: 9999, bias: 0.35, icon: 'gamepad' },
  { id: 'notinha-60s', name: 'Notinha em 60 Segundos', minYear: 2021, maxYear: 9999, bias: -0.4, icon: 'phone' },
  // futuro
  { id: 'critico-ia-9000', name: 'Crítico IA 9000', minYear: 2027, maxYear: 9999, bias: 0, icon: 'robot' },
  { id: 'holo-review', name: 'Holo-Review', minYear: 2032, maxYear: 9999, bias: 0.15, icon: 'sparkle' },
  { id: 'neural-notas', name: 'Neural Notas', minYear: 2036, maxYear: 9999, bias: -0.25, icon: 'chip' },
];

export const QUOTES = {
  1: [
    'Prefiro assistir tinta secando.',
    'O cartucho virou calço de mesa.',
    'Até o manual tem bugs.',
    'Dei de presente pro meu inimigo.',
    'Minha avó chorou. De tristeza.',
    'É um jogo? Tem certeza?',
    'Desliguei o console e ele agradeceu.',
    'Um crime contra a eletricidade.',
    'Nota um pela capa, e olhe lá.',
  ],
  2: [
    'Divertido como fila de banco.',
    'Salva-se a música do menu.',
    'Joguei dez minutos. Pareceram dez horas.',
    'O chefão final é a paciência.',
    'Tem ideias. Nenhuma boa.',
    'Nem o gato quis jogar.',
    'Feito com pressa e sem carinho.',
    'Meu controle pediu demissão.',
  ],
  3: [
    'Começa ruim e depois piora.',
    'Tem potencial, muito bem escondido.',
    'Os bugs são a melhor parte.',
    'Jogaria de novo? Só obrigado.',
    'Uma ideia boa afogada em problemas.',
    'Mais travado que porta emperrada.',
    'Pelo menos o título é bonito.',
    'Fraco, mas o mascote é simpático.',
  ],
  4: [
    'Quase lá. Quase mesmo.',
    'Esquecível antes mesmo de acabar.',
    'Dá pra jogar num domingo chuvoso.',
    'Medíocre, mas com esforço.',
    'Promete muito, entrega um pouquinho.',
    'Mais tropeço do que pulo.',
    'Tem alma, falta polimento.',
    'Bom pra emprestar e não pedir de volta.',
  ],
  5: [
    'Nem fede nem cheira.',
    'Arroz com feijão sem tempero.',
    'Funciona. E é isso.',
    'Honesto, mas sem brilho.',
    'Joguei, gostei, esqueci.',
    'Um pastel de vento competente.',
    'Na média, e confortável lá.',
    'Serve pra passar o tempo.',
  ],
  6: [
    'Divertido, com uns tropeços.',
    'Tem seus momentos de glória.',
    'Agrada quem já é fã.',
    'Bom pra alugar no fim de semana.',
    'Sólido, mas sem coragem.',
    'Melhor que o esperado, pior que o sonhado.',
    'Um bom jogo de terça-feira.',
    'Falta tempero, mas alimenta.',
  ],
  7: [
    'Bem feito e divertido.',
    'Recomendo sem medo.',
    'Prendeu a gente até de madrugada.',
    'Polido como o chão da vó.',
    'Um acerto seguro do estúdio.',
    'Dá orgulho de jogar.',
    'Viciante. Cuidado com o horário.',
    'Merecia um pouco mais de ousadia.',
  ],
  8: [
    'Esqueci de almoçar jogando.',
    'Um baita jogo, sem exagero.',
    'Cada fase é uma surpresa boa.',
    'Caprichado do pixel ao som.',
    'Já quero a continuação.',
    'Brilhante em quase tudo.',
    'Isso aqui vai virar clássico.',
    'Liguei pros amigos pra contar.',
  ],
  9: [
    'Obra-prima com pequenas manchas.',
    'Joguei três vezes seguidas.',
    'Me fez sentir criança de novo.',
    'Referência do gênero a partir de hoje.',
    'Quase perfeito. Quase.',
    'Daqueles que a gente não esquece.',
    'Merece moldura na parede.',
    'Arrepiei no chefão final.',
  ],
  10: [
    'Perfeito. Pode emoldurar.',
    'Chorei, ri e zerei duas vezes.',
    'O jogo que eu sonhava aos oito.',
    'Não tem defeito. Procurei muito.',
    'Histórico. Guardem esse dia.',
    'Isso não é jogo, é poesia.',
    'Vendi meu carro pra comprar outra cópia.',
    'Nota dez, e ainda é pouco.',
    'Tudo agora será comparado a isso.',
  ],
};

export const GENRE_QUOTES = {
  acao: {
    high: ['Pancadaria de primeira qualidade.', 'Adrenalina pura do início ao fim.'],
    low: ['Ação? Só no nome.', 'Apertei o botão e nada aconteceu.'],
  },
  plataforma: {
    high: ['Cada pulo é uma delícia.', 'Fases desenhadas com carinho de vó.'],
    low: ['Pulo mais duro que pão velho.', 'Caí no buraco por culpa do jogo.'],
  },
  aventura: {
    high: ['Explorar nunca foi tão gostoso.', 'Cada canto esconde um segredo.'],
    low: ['Perdido, e não do jeito bom.', 'O mapa é o maior mistério.'],
  },
  rpg: {
    high: ['Cem horas que passaram voando.', 'História de fazer marmanjo chorar.'],
    low: ['Grind mais chato que lição de casa.', 'Diálogos maiores que bula de remédio.'],
  },
  estrategia: {
    high: ['Pensei tanto que suei.', 'Xadrez com explosões. Genial.'],
    low: ['A IA inimiga dormiu no ponto.', 'Estratégia vencedora: desistir e dormir.'],
  },
  simulacao: {
    high: ['Viciante como a vida, só que melhor.', 'Simula tudo, até a preguiça.'],
    low: ['Simula muito bem o tédio.', 'Mais burocrático que cartório.'],
  },
  puzzle: {
    high: ['Me senti um gênio. Duas vezes.', 'Quebra-cabeças inteligentes e justos.'],
    low: ['O enigma é por que existe.', 'Solução: desligar o console.'],
  },
  corrida: {
    high: ['Velocidade de arrepiar o bigode.', 'Curvas perfeitas, derrapagem deliciosa.'],
    low: ['Dirige feito carrinho de feira.', 'Mais lento que trânsito de sexta.'],
  },
  esporte: {
    high: ['Melhor que assistir na TV.', 'Golaço de jogabilidade.'],
    low: ['Juiz ladrão e controle pior.', 'Rebaixado na primeira rodada.'],
  },
  luta: {
    high: ['Combos que dão gosto.', 'Briga boa, sem desequilíbrio.'],
    low: ['Ganhei apertando um botão só.', 'Personagens desequilibrados demais.'],
  },
  terror: {
    high: ['Dormi de luz acesa.', 'Medo de verdade. Que delícia.'],
    low: ['Assusta tanto quanto um ursinho.', 'O único terror é o preço.'],
  },
  ritmo: {
    high: ['Meu pé não para de bater.', 'Trilha que gruda na cabeça.'],
    low: ['Áudio atrasado. Fiasco total.', 'Sem ritmo nenhum, ironicamente.'],
  },
  tiro: {
    high: ['Tiroteio preciso e satisfatório.', 'Mira justa, mapas ótimos.'],
    low: ['Errei tiro à queima-roupa.', 'Mira mais torta que antena velha.'],
  },
  mmo: {
    high: ['Perdi minha vida social. Valeu.', 'Mundo vivo, guilda animada.'],
    low: ['O servidor caiu mais que eu.', 'Mundo enorme e vazio.'],
  },
  sandbox: {
    high: ['Construí uma catedral de blocos.', 'Liberdade total, criatividade solta.'],
    low: ['Livre demais, sem graça nenhuma.', 'Um mundo enorme de nada.'],
  },
  roguelike: {
    high: ['Morri cem vezes, sorri todas.', 'Só mais uma run, juro.'],
    low: ['Aleatório demais, justo de menos.', 'Morrer cansa quando não ensina.'],
  },
  moba: {
    high: ['Partidas tensas do começo ao fim.', 'Equilibrado e cheio de estratégia.'],
    low: ['Mais tóxico que lixo radioativo.', 'Partidas de uma hora de tédio.'],
  },
  battle: {
    high: ['Vitória com gosto de final de Copa.', 'Cem jogadores, cem histórias.'],
    low: ['Caí, andei, morri. Repete.', 'A zona fecha, a diversão também.'],
  },
  party: {
    high: ['Briga de família garantida. Ótimo.', 'Amizades testadas com alegria.'],
    low: ['Festa sem graça e sem bolo.', 'Minigames que ninguém pediu.'],
  },
  cozy: {
    high: ['Um abraço em forma de jogo.', 'Relaxa mais que chá de camomila.'],
    low: ['Tão calmo que dormi.', 'Fofo, mas vazio por dentro.'],
  },
};
