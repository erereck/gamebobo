export const FRANCHISE_EVENTS = [
  {
    id: 'canon-argument',
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
    id: 'remaster-demand',
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
    id: 'fan-project',
    tag: 'FEITO POR FÃS',
    title: 'Fizeram um jogo dentro de {franchise}.',
    body: 'É gratuito, estranho e claramente feito por amor. A licença, porém, é sua.',
    choices: [
      { id: 'bless', label: 'Dar sua bênção', hint: 'A comunidade cresce', outcome: 'O autor colocou “aprovado pelo estúdio” na tela inicial.', effects: { player: { followers: 900, reputation: 2 }, audience: { hardcore: 450, trust: 7 } } },
      { id: 'hire', label: 'Contratar o autor como consultor', hint: 'R$ 8.000', outcome: 'A conversa começou como fã e terminou como trabalho.', effects: { player: { money: -8000, followers: 600 }, studio: { research: 8, reputation: 3 }, audience: { trust: 5 } } },
      { id: 'remove', label: 'Pedir a remoção', hint: 'Protege a marca', outcome: 'O jogo sumiu. Os vídeos sobre ele, não.', effects: { player: { reputation: -2 }, audience: { hardcore: -350, trust: -8 } } },
    ],
  },
]
