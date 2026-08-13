export const COMPETITOR_EVENTS = [
  {
    id: 'bundle-invite', fromYear: 2007,
    tag: 'E-MAIL DE {studio}',
    title: '{studio} quer montar um pacote com seus jogos.',
    body: 'A proposta é simples: desconto conjunto, divulgação cruzada e uma semana dividindo a mesma vitrine.',
    choices: [
      { id: 'join', label: 'Entrar no pacote', hint: 'Mais alcance, preço menor', outcome: 'As duas comunidades passaram uma semana se comparando.', effects: { player: { money: 5000, followers: 420 }, audience: { trust: 2 }, competitor: { relation: 14 } } },
      { id: 'counter', label: 'Propor um evento maior', hint: 'R$ 3.000', outcome: 'Virou entrevista, desconto e uma pequena game jam.', effects: { player: { money: -3000, followers: 780, reputation: 2 }, competitor: { relation: 20 } } },
      { id: 'decline', label: 'Recusar com educação', hint: 'Nada muda muito', outcome: 'Responderam com um “quem sabe na próxima”.', effects: { competitor: { relation: -2 } } },
    ],
  },
  {
    id: 'public-comparison',
    tag: 'PERGUNTA DE ENTREVISTA',
    title: 'Compararam seu estúdio com {studio}.',
    body: 'A pergunta veio pronta para virar manchete. Qualquer resposta mais afiada vai circular sem o resto da entrevista.',
    choices: [
      { id: 'respect', label: 'Elogiar o trabalho deles', hint: 'Sem manchete fácil', outcome: 'A resposta foi madura o bastante para render pouco clique.', effects: { player: { reputation: 2 }, competitor: { relation: 9 } } },
      { id: 'different', label: 'Dizer que fazem coisas diferentes', hint: 'Protege sua identidade', outcome: 'A matéria usou a palavra “diplomático”.', effects: { studio: { reputation: 2 }, competitor: { relation: 2 } } },
      { id: 'jab', label: 'Mandar uma indireta', hint: 'A rivalidade cresce', outcome: 'O corte de vinte segundos teve mais público que a entrevista inteira.', effects: { player: { followers: 520, reputation: -1 }, competitor: { relation: -18 } } },
    ],
  },
  {
    id: 'shared-talent',
    tag: 'GENTE DA INDÚSTRIA',
    title: 'Uma pessoa de {studio} quer conversar.',
    body: 'Não pediu emprego. Ainda. Quer entender como é trabalhar aqui e se o próximo projeto tem espaço.',
    choices: [
      { id: 'open', label: 'Conversar sem promessa', hint: '+ candidato no futuro', outcome: 'A conversa ficou entre vocês. Por enquanto.', effects: { studio: { reputation: 1 }, competitor: { relation: -5 }, flag: { industryContact: true } } },
      { id: 'tell-studio', label: 'Avisar o outro estúdio', hint: 'Ganha confiança', outcome: 'A resposta foi curta, mas agradecida.', effects: { competitor: { relation: 16 }, player: { reputation: 1 } } },
      { id: 'recruit', label: 'Fazer uma proposta', hint: 'R$ 12.000', outcome: 'A proposta não ficou tão secreta quanto parecia.', effects: { player: { money: -12000 }, studio: { reputation: 3 }, competitor: { relation: -24 }, flag: { aggressiveRecruiting: true } } },
    ],
  },
]
