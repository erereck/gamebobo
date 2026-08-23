export const FRANCHISE_EVENTS = [
  {
    id: 'anniversary-window', fromYear: 1990,
    tag: 'ANIVERSÁRIO REDONDO',
    title: '{franchise} voltou a aparecer nas revistas.',
    body: 'Uma data redonda fez retrospectivas, rankings e gente perguntando por que a série sumiu — mesmo que ela nem tenha sumido tanto assim.',
    choices: [
      { id: 'celebrate', label: 'Fazer uma campanha comemorativa', hint: 'R$ 4.000', outcome: 'Arte antiga, entrevista e bastidor reacenderam a memória.', effects: { player: { money: -4000, followers: 520 }, audience: { nostalgic: 320, trust: 3 } } },
      { id: 'prototype', label: 'Mostrar um protótipo perdido', hint: '+ pesquisa', outcome: 'Uma tela feia virou assunto por ser justamente feia e antiga.', effects: { studio: { research: 6 }, player: { followers: 310 }, audience: { hardcore: 180 } } },
      { id: 'quiet', label: 'Deixar a data passar', hint: 'Sem custo', outcome: 'Os fãs fizeram a comemoração sozinhos.', effects: { audience: { nostalgic: 90 } } },
    ],
  },
  {
    id: 'spinoff-demand', fromYear: 1994,
    tag: 'E SE FOSSE OUTRO JOGO?',
    title: 'Os fãs querem ver {franchise} fora do próprio gênero.',
    body: 'Uma revista publicou uma brincadeira: “e se isso virasse corrida, puzzle, RPG, luta?”. O desenho pegou mais do que a matéria.',
    choices: [
      { id: 'encourage', label: 'Entrar na brincadeira', hint: '+ inovação', outcome: 'O estúdio publicou conceitos absurdos e deixou a porta aberta.', effects: { player: { followers: 420 }, studio: { research: 4 }, audience: { hardcore: 150, trust: 2 } } },
      { id: 'protect', label: 'Defender a identidade da série', hint: '+ confiança', outcome: 'A resposta foi conservadora, mas clara.', effects: { audience: { trust: 4, nostalgic: 110 } } },
      { id: 'poll', label: 'Abrir votação', hint: 'Muito barulho', outcome: 'Quatro opções viraram quarenta e sete sugestões.', effects: { player: { followers: 760 }, audience: { hardcore: 260, trust: 1 } } },
    ],
  },
  {
    id: 'crossover-pressure', fromYear: 1998,
    tag: 'TODO MUNDO NO MESMO CARTAZ',
    title: 'Pedem um crossover para {franchise}.',
    body: 'A cultura de mascotes, convidados e universos compartilhados fez os fãs começarem a montar elencos impossíveis.',
    choices: [
      { id: 'fan-art', label: 'Compartilhar fanarts', hint: 'Seguro', outcome: 'Você alimentou o incêndio sem prometer nada.', effects: { player: { followers: 620 }, audience: { trust: 3, hardcore: 190 } } },
      { id: 'meetings', label: 'Abrir conversas de licença', hint: 'R$ 7.000', outcome: 'Nada foi assinado, mas a equipe aprendeu como esse tipo de acordo funciona.', effects: { player: { money: -7000, reputation: 1 }, studio: { research: 8 } } },
      { id: 'no-way', label: 'Dizer que não faz sentido', hint: 'Esfria o meme', outcome: 'O meme durou mais duas semanas só por causa da resposta.', effects: { player: { followers: 160 }, audience: { trust: 1 } } },
    ],
  },
  {
    id: 'canon-argument', fromYear: 1995,
    tag: 'FÓRUM EM GUERRA',
    title: 'Uma frase dividiu os fãs de {franchise}.',
    body: 'Metade jura que entendeu a história. A outra metade jura que vocês esqueceram o próprio jogo.',
    choices: [
      { id: 'clarify', label: 'Publicar uma explicação curta', hint: 'Acalma agora', outcome: 'A resposta fechou uma dúvida e abriu outras duas.', effects: { audience: { trust: 4 }, player: { followers: 180 } } },
      { id: 'mystery', label: 'Não explicar nada', hint: 'O debate continua', outcome: 'O tópico passou de cem páginas.', effects: { player: { followers: 420 }, audience: { hardcore: 120, trust: -2 } } },
      { id: 'make-canon', label: 'Transformar a teoria em cânone', hint: 'Arriscado', outcome: 'Os fãs sentiram que estavam escrevendo junto.', effects: { player: { followers: 650, reputation: 2 }, audience: { hardcore: 220, trust: 3 } } },
    ],
  },
  {
    id: 'remake-schism', fromYear: 2002,
    tag: '“NÃO MEXE NO ORIGINAL”',
    title: 'A palavra “remake” dividiu os fãs de {franchise}.',
    body: 'Uns querem reconstrução total. Outros querem exatamente o mesmo jogo com resolução maior e absolutamente mais nada.',
    choices: [
      { id: 'ask', label: 'Perguntar o que deve mudar', hint: '+ hardcore', outcome: 'A enquete não trouxe consenso; trouxe um documento de quarenta páginas.', effects: { player: { followers: 450 }, audience: { hardcore: 300, trust: 4 } } },
      { id: 'vision', label: 'Dizer que remake precisa ter visão própria', hint: '+ reputação', outcome: 'A fala virou citação em matéria de opinião.', effects: { player: { reputation: 2, followers: 260 }, audience: { trust: -1 } } },
      { id: 'preserve', label: 'Prometer preservar o espírito', hint: '+ nostálgicos', outcome: 'A frase vaga foi exatamente vaga o bastante.', effects: { audience: { nostalgic: 310, trust: 3 }, player: { followers: 300 } } },
    ],
  },
  {
    id: 'remaster-demand', fromYear: 2007,
    tag: 'ABAIXO-ASSINADO',
    title: 'Querem {franchise} de volta.',
    body: 'Um vídeo comparando o jogo antigo com lançamentos atuais puxou uma campanha por remaster. Não é uma multidão, mas é barulhenta.',
    choices: [
      { id: 'patch', label: 'Atualizar o jogo antigo', hint: 'R$ 6.000', outcome: 'O jogo voltou à primeira página por alguns dias.', effects: { player: { money: -6000, followers: 500 }, audience: { nostalgic: 280, trust: 5 }, game: { salesRate: 0.16, trust: 4 } } },
      { id: 'tease', label: 'Responder com uma imagem vaga', hint: '+ hype futuro', outcome: 'Um quadrado preto virou doze teorias.', effects: { player: { followers: 300 }, audience: { nostalgic: 180 } } },
      { id: 'move-on', label: 'Dizer que acabou', hint: 'Encerra a especulação', outcome: 'Alguns agradeceram a honestidade. Outros não.', effects: { audience: { trust: 2, nostalgic: -90 }, player: { reputation: 1 } } },
    ],
  },
  {
    id: 'fan-project', fromYear: 2005,
    tag: 'FEITO POR FÃS',
    title: 'Fizeram um jogo dentro de {franchise}.',
    body: 'É gratuito, estranho e claramente feito por amor. A licença, porém, é sua.',
    choices: [
      { id: 'bless', label: 'Dar sua bênção', hint: 'A comunidade cresce', outcome: 'O autor colocou “aprovado pelo estúdio” na tela inicial.', effects: { player: { followers: 900, reputation: 2 }, audience: { hardcore: 450, trust: 7 } } },
      { id: 'hire', label: 'Contratar o autor como consultor', hint: 'R$ 8.000', outcome: 'A conversa começou como fã e terminou como trabalho.', effects: { player: { money: -8000, followers: 600 }, studio: { research: 8, reputation: 3 }, audience: { trust: 5 } } },
      { id: 'remove', label: 'Pedir a remoção', hint: 'Protege a marca', outcome: 'O jogo sumiu. Os vídeos sobre ele, não.', effects: { player: { reputation: -2 }, audience: { hardcore: -350, trust: -8 } } },
    ],
  },
  {
    id: 'adaptation-call', fromYear: 2010,
    tag: 'A FRANQUIA SAIU DA TELA',
    title: 'Uma produtora quer conversar sobre {franchise}.',
    body: 'Não é contrato ainda. É aquele estágio em que executivos usam a palavra “universo” mais vezes do que o necessário.',
    choices: [
      { id: 'listen', label: 'Ouvir a proposta', hint: 'R$ 12.000 em consultoria', outcome: 'A reunião não virou filme, mas rendeu dinheiro e visibilidade.', effects: { player: { money: 12000, followers: 620, reputation: 1 }, audience: { trust: 1 } } },
      { id: 'creative', label: 'Exigir participação criativa', hint: '+ confiança', outcome: 'A conversa ficou mais difícil e os fãs gostaram quando souberam.', effects: { player: { reputation: 2, followers: 380 }, audience: { trust: 6, hardcore: 160 } } },
      { id: 'games-only', label: 'Manter a série nos jogos', hint: '+ nostálgicos', outcome: 'A resposta virou parte da identidade da marca.', effects: { audience: { nostalgic: 220, trust: 4 } } },
    ],
  },
]
