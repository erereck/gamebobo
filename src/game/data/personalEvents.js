export const PERSONAL_EVENTS = [
  {
    id: 'parents-money',
    tag: 'FORA DO TRABALHO',
    title: 'Seus pais pediram ajuda com uma conta.',
    body: 'Não é muito. Também não é um bom mês.',
    choices: [
      { id: 'pay', label: 'Pagar', detail: 'R$ 1.400.', outcome: 'O assunto morreu ali.', effects: { player: { money: -1400, relationship: 5, stress: -2 } } },
      { id: 'half', label: 'Mandar metade', detail: 'Cabe melhor no caixa.', outcome: 'Disseram que resolvem o resto.', effects: { player: { money: -700, relationship: 2 } } },
      { id: 'no', label: 'Dizer que não dá', detail: 'Sem custo financeiro.', outcome: 'A conversa acabou mais cedo.', effects: { player: { relationship: -5, stress: 4 } } },
    ],
  },
  {
    id: 'birthday',
    tag: 'SÁBADO À NOITE',
    title: 'É aniversário do seu melhor amigo.',
    body: 'Você disse que iria. O projeto está atrasado e a build de hoje finalmente parou de travar.',
    choices: [
      { id: 'go', label: 'Fechar o computador', detail: 'Recupera energia. O projeto espera.', outcome: 'Você chegou atrasado, mas chegou.', effects: { player: { energy: 16, relationship: 5, stress: -8 }, project: { pressure: 3 } } },
      { id: 'late', label: 'Passar só uma hora', detail: 'Um pouco de cada.', outcome: 'Quando você voltou, já era domingo.', effects: { player: { energy: 5, relationship: 1, stress: -3 } } },
      { id: 'work', label: 'Ficar trabalhando', detail: 'Melhora o projeto. A mensagem fica sem resposta.', outcome: 'Às 2h, você corrigiu o bug.', effects: { player: { relationship: -6, energy: -8, stress: 5 }, project: { quality: 3 } } },
    ],
  },
  {
    id: 'friend-job',
    tag: 'CONVERSA SÉRIA',
    title: 'Um amigo quer trabalhar com você.',
    body: 'Ele sabe desenhar, está cansado do emprego e acha que seu próximo jogo pode pagar as contas dos dois.',
    choices: [
      { id: 'trial', label: 'Chamar para um teste', detail: 'R$ 2.000. Arte melhora.', outcome: 'Vocês combinaram um mês, sem promessa.', effects: { player: { money: -2000, relationship: 3 }, stat: { art: 3 }, project: { quality: 2 } } },
      { id: 'honest', label: 'Explicar que ainda não dá', detail: 'Sem custo. Relação preservada.', outcome: 'Ele entendeu. Pelo menos pareceu entender.', effects: { player: { relationship: 1 } } },
      { id: 'promise', label: 'Prometer vaga no próximo jogo', detail: 'Cria expectativa.', outcome: 'Ele começou a mandar referências naquela noite.', effects: { player: { relationship: 4, stress: 3 }, flag: { promisedFriendJob: true } } },
    ],
  },
  {
    id: 'burnout',
    tag: 'SEGUNDA-FEIRA',
    title: 'Você abriu o projeto e fechou de novo.',
    body: 'Nenhum erro. Nenhuma tarefa impossível. Só não deu para começar.',
    condition: state => state.player.stress >= 65,
    choices: [
      { id: 'week', label: 'Tirar uma semana', detail: 'O mês rende menos. Você volta melhor.', outcome: 'No terceiro dia, você parou de pensar no menu principal.', effects: { player: { energy: 24, stress: -28 }, project: { progress: -0.35, pressure: -8 } } },
      { id: 'push', label: 'Forçar o trabalho', detail: 'Avança, mas não resolve.', outcome: 'Você produziu. Não foi um bom mês.', effects: { player: { energy: -18, stress: 13 }, project: { progress: 0.5, quality: -4 } } },
      { id: 'talk', label: 'Conversar com alguém', detail: 'Custa R$ 600 e reduz o estresse.', outcome: 'A primeira conversa não resolveu tudo. Ajudou.', effects: { player: { money: -600, stress: -20, relationship: 2 } } },
    ],
  },
  {
    id: 'health-scare',
    tag: 'CORPO FORA DO PLANO',
    title: 'A tontura não passou quando você sentou.',
    body: 'Você vinha chamando de cansaço havia meses. Dessa vez, alguém precisou levar você até uma clínica.',
    condition: state => state.player.health <= 35,
    choices: [
      { id: 'stop', label: 'Parar e seguir o tratamento', detail: 'Caro, lento e necessário.', outcome: 'O calendário andou sem você. Seu corpo, finalmente, na direção contrária.', effects: { player: { money: -4800, health: 34, energy: 30, stress: -26 }, project: { progress: -0.6, pressure: -12 } } },
      { id: 'delegate', label: 'Pedir ajuda e terceirizar', detail: 'Custa dinheiro e exige confiança.', outcome: 'A build veio diferente do que você faria. Veio pronta.', effects: { player: { money: -2400, health: 22, energy: 18, stress: -16 }, project: { quality: 2 }, studio: { morale: 5 } } },
      { id: 'medicate', label: 'Voltar assim que der', detail: 'Resolve o dia, não a causa.', outcome: 'Você voltou. A caixa de remédio ficou ao lado do teclado.', effects: { player: { money: -900, health: 10, stress: 8 }, project: { progress: 0.25, quality: -3 } } },
    ],
  },
]
