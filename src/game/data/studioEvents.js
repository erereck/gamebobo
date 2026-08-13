export const STUDIO_EVENTS = [
  {
    id: 'salary-talk',
    tag: 'CONVERSA DIFÍCIL',
    title: '{name} pediu um aumento.',
    body: 'A conversa foi direta: o trabalho cresceu, a responsabilidade também. A resposta vai circular pelo escritório.',
    choices: [
      { id: 'raise', label: 'Ajustar o salário', hint: 'Custa todo mês', outcome: 'A notícia melhorou o clima.', effects: { team: { salaryRate: 0.14, morale: 14, loyalty: 10 }, studio: { morale: 3 } } },
      { id: 'bonus', label: 'Pagar um bônus', hint: 'R$ 5.000 agora', outcome: 'Não resolveu para sempre, mas mostrou respeito.', effects: { player: { money: -5000 }, team: { morale: 8, loyalty: 5 } } },
      { id: 'refuse', label: 'Dizer que não cabe', hint: 'Sem custo imediato', outcome: 'A planilha venceu a conversa. Por enquanto.', effects: { team: { morale: -14, loyalty: -16 }, studio: { morale: -5 } } },
    ],
  },
  {
    id: 'creative-credit',
    tag: 'CRÉDITOS',
    title: 'De quem foi a ideia?',
    body: '{name} criou uma solução que salvou semanas de trabalho. Numa entrevista, perguntaram quem pensou nela.',
    choices: [
      { id: 'name-them', label: 'Dar o nome e o crédito', hint: 'Fortalece a equipe', outcome: 'A resposta virou assunto bom no escritório.', effects: { team: { morale: 12, loyalty: 9 }, studio: { reputation: 1 } } },
      { id: 'studio-credit', label: 'Dizer que foi “o estúdio”', hint: 'Resposta segura', outcome: 'Ninguém discutiu. Ninguém esqueceu.', effects: { team: { morale: -5, loyalty: -4 } } },
      { id: 'take-credit', label: 'Assumir a autoria', hint: '+ reputação pessoal', outcome: 'A matéria saiu bonita. O almoço do dia seguinte foi silencioso.', effects: { player: { reputation: 3 }, team: { morale: -18, loyalty: -15 }, studio: { morale: -8 } } },
    ],
  },
  {
    id: 'staff-exhaustion',
    tag: 'LUZ ACESA TARDE DEMAIS',
    title: '{name} chegou no limite.',
    body: 'Erro simples, choro no banheiro, tela desligada. Não é falta de talento. É cansaço acumulado.',
    choices: [
      { id: 'leave', label: 'Dar um mês de folga', hint: 'Projeto perde ritmo', outcome: 'A cadeira ficou vazia. A pessoa voltou inteira.', effects: { project: { progress: -0.35 }, team: { energy: 38, morale: 10, loyalty: 8 } } },
      { id: 'slow-team', label: 'Reduzir o ritmo de todos', hint: 'Menos pressão', outcome: 'O calendário piorou. O ambiente, não.', effects: { project: { progress: -0.2, pressure: -18 }, teamAll: { energy: 16, morale: 6 }, player: { stress: -8 } } },
      { id: 'push', label: 'Pedir só mais uma entrega', hint: 'Risco de saída', outcome: 'A entrega chegou. A confiança não.', effects: { project: { progress: 0.3, quality: -2 }, team: { energy: -25, morale: -24, loyalty: -22 }, studio: { morale: -8 } } },
    ],
  },
  {
    id: 'mentorship',
    tag: 'GENTE ENSINANDO GENTE',
    title: '{name} começou a orientar o resto da equipe.',
    body: 'Sem reunião marcada e sem cargo novo. Só apareceu um jeito melhor de dividir o que sabe.',
    choices: [
      { id: 'formalize', label: 'Reservar tempo para mentoria', hint: '- ritmo, + potencial', outcome: 'Virou parte do trabalho, não um favor escondido.', effects: { project: { progress: -0.15 }, teamAll: { skillChance: 0.45, morale: 4 }, team: { loyalty: 8 } } },
      { id: 'reward', label: 'Dar bônus e autonomia', hint: 'R$ 3.500', outcome: 'A iniciativa ganhou espaço para crescer.', effects: { player: { money: -3500 }, team: { skill: 2, morale: 9, loyalty: 7 } } },
      { id: 'leave-alone', label: 'Não transformar em processo', hint: 'Segue informal', outcome: 'Continuou acontecendo nos intervalos.', effects: { team: { skill: 1, morale: 2 } } },
    ],
  },
]
