export const PROJECT_EVENTS = [
  {
    id: 'other-machine',
    tag: 'BUILD 0.3.7',
    title: 'No computador do seu amigo, não abre.',
    body: 'Na sua máquina funciona. Na dele aparece uma janela preta e nada mais. Ele trouxe o gabinete até sua casa.',
    choices: [
      { id: 'fix', label: 'Parar e corrigir', detail: 'Mais um mês. Menos susto no lançamento.', outcome: 'Você passou quatro dias numa biblioteca que nem lembrava ter usado.', effects: { project: { quality: 5, months: 1, pressure: 5 }, player: { money: -900 } } },
      { id: 'requirements', label: 'Publicar os requisitos', detail: 'Barato. Limita o público.', outcome: 'Os requisitos cabem em três linhas. A terceira é “boa sorte”.', effects: { project: { quality: -3, reach: -0.08 } } },
      { id: 'ignore', label: 'Testar depois', detail: 'Você sabe o que “depois” costuma significar.', outcome: 'O gabinete continua no canto do quarto.', effects: { project: { quality: -7, pressure: -3 } } },
    ],
  },
  {
    id: 'combat-boring',
    tag: 'TESTE INTERNO',
    title: 'O sistema principal ficou chato.',
    body: 'Funciona, não quebra e ninguém quer jogar uma segunda vez. Tecnicamente, está pronto.',
    choices: [
      { id: 'redo', label: 'Refazer a base', detail: 'Caro e demorado.', outcome: 'Você apagou a pasta “final_agora_vai”.', effects: { project: { quality: 7, months: 2, cost: 2600, pressure: 10 } } },
      { id: 'twist', label: 'Colocar uma regra esquisita', detail: 'Pode salvar ou piorar tudo.', outcome: 'A regra parece errada até funcionar pela primeira vez.', effects: { project: { qualityRandom: [-6, 15], innovation: 8 }, story: 'uma regra improvisada segurou o jogo' } },
      { id: 'ship', label: 'Seguir o plano', detail: 'Sem atraso.', outcome: 'A tarefa foi marcada como concluída.', effects: { project: { quality: -6 } } },
    ],
  },
  {
    id: 'borrowed-art',
    tag: 'ARTE TEMPORÁRIA',
    title: 'A arte provisória ficou no jogo.',
    body: 'Você se acostumou tanto aos bonecos cinza que só percebeu ao preparar as imagens de divulgação.',
    choices: [
      { id: 'hire', label: 'Chamar uma artista', detail: 'R$ 3.400 e mais um mês.', outcome: 'Ela pediu metade adiantado e devolveu personagens que têm rosto.', effects: { project: { quality: 6, months: 1, cost: 3400 }, player: { energy: 5 } } },
      { id: 'learn', label: 'Fazer você mesmo', detail: 'Gasta energia. Você aprende alguma coisa.', outcome: 'Nem tudo ficou bonito, mas pelo menos combina.', effects: { project: { quality: 4 }, player: { energy: -14 }, stat: { art: 3 } } },
      { id: 'style', label: 'Assumir como estilo', detail: 'A imprensa pode comprar a ideia.', outcome: 'No texto de apresentação, “minimalista” aparece duas vezes.', effects: { project: { qualityRandom: [-4, 9], innovation: 4 } } },
    ],
  },
  {
    id: 'festival', fromYear: 1999,
    tag: 'INSCRIÇÕES ATÉ SEXTA',
    title: 'Um festival indie abriu inscrições.',
    body: 'A build está longe do fim. O estande custa quase o mesmo que dois meses de aluguel.',
    choices: [
      { id: 'go', label: 'Mandar a build', detail: 'R$ 1.600. Pode render público.', outcome: 'Trinta e sete pessoas jogaram. Nove ficaram até o fim da fase.', effects: { player: { money: -1600, followers: 120 }, project: { pressure: 5 } } },
      { id: 'polish', label: 'Virar a noite antes', detail: 'Melhora a demo. Cobra na energia.', outcome: 'A build travou uma vez no estande. Você fingiu que não viu.', effects: { player: { money: -1600, energy: -18, followers: 240 }, project: { quality: 4, pressure: 9 } } },
      { id: 'skip', label: 'Ficar em casa', detail: 'O projeto continua no ritmo.', outcome: 'Você viu as fotos no fórum no domingo.', effects: { player: { stress: -3 } } },
    ],
  },
  {
    id: 'funny-bug',
    tag: 'BUG #118',
    title: 'Os inimigos voam longe demais.',
    body: 'Um erro na física manda qualquer inimigo para fora da tela. Seu amigo riu tanto que pediu para jogar de novo.',
    choices: [
      { id: 'feature', label: 'Deixar e ajustar', detail: 'Vira parte do jogo.', outcome: 'Agora há um contador de distância.', effects: { project: { quality: 5, innovation: 7 }, story: 'um bug de física virou mecânica' } },
      { id: 'fix', label: 'Corrigir', detail: 'Seguro.', outcome: 'Os inimigos voltaram a cair no chão.', effects: { project: { quality: 3 } } },
      { id: 'more', label: 'Aumentar ainda mais', detail: 'Sem qualquer moderação.', outcome: 'Você precisou aumentar o tamanho do cenário.', effects: { project: { qualityRandom: [-8, 13], innovation: 10, pressure: 4 } } },
    ],
  },
  {
    id: 'date-promise', fromYear: 1995,
    tag: 'FÓRUM OFICIAL',
    title: 'Você prometeu uma data.',
    body: 'Doze pessoas responderam ao tópico. Uma delas pergunta todo dia se ainda sai sexta-feira.',
    choices: [
      { id: 'night', label: 'Virar a noite', detail: 'Avança o projeto. Cobra na qualidade.', outcome: 'A build foi enviada às 4h12.', effects: { project: { progress: 1, quality: -3, pressure: 12 }, player: { energy: -20, stress: 10 } } },
      { id: 'delay', label: 'Adiar no fórum', detail: 'A pressão cai. Alguns seguidores vão embora.', outcome: 'Três respostas: “ok”, “sabia” e uma imagem quebrada.', effects: { project: { months: 1, pressure: -9 }, player: { followers: -8, reputation: 1 } } },
      { id: 'vanish', label: 'Não responder', detail: 'Funciona até alguém notar.', outcome: 'O tópico subiu sozinho por mais quatro dias.', effects: { player: { followers: -18, reputation: -2 }, project: { pressure: -5 } } },
    ],
  },
]
