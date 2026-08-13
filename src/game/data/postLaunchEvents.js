export const POST_LAUNCH_EVENTS = [
  {
    id: 'small-streamer',
    tag: 'AO VIVO · 23:48',
    title: 'Um streamer pequeno achou seu jogo.',
    body: 'Ele tem 312 pessoas assistindo e insiste em terminar hoje. O chat já deu apelido para o chefe da segunda fase.',
    choices: [
      { id: 'join', label: 'Entrar no chat', detail: 'Você vira assunto junto com o jogo.', outcome: 'Alguém perguntou quando sai a sequência. O jogo ainda tem quatro dias.', effects: { game: { salesRate: 0.22, followerRate: 0.18 }, player: { reputation: 2 }, audience: { hardcore: 60 } } },
      { id: 'gift', label: 'Mandar algumas chaves', detail: 'Alimenta a transmissão.', outcome: 'Mais dois canais começaram no dia seguinte.', effects: { game: { salesRate: 0.31, followerRate: 0.14 }, player: { money: -300 } } },
      { id: 'watch', label: 'Só assistir', detail: 'Sem interferir.', outcome: 'Ele não encontrou a sala secreta. Ninguém encontrou.', effects: { game: { salesRate: 0.14, followerRate: 0.08 } } },
    ],
  },
  {
    id: 'money-duplication',
    tag: 'TÓPICO FIXADO',
    title: 'Descobriram como duplicar dinheiro.',
    body: 'O processo leva sete passos e envolve pausar no meio de uma animação. Já existe um vídeo ensinando.',
    choices: [
      { id: 'patch', label: 'Corrigir agora', detail: 'R$ 1.200. Preserva a confiança.', outcome: 'O patch 1.0.2 saiu no mesmo dia.', effects: { player: { money: -1200, reputation: 2 }, game: { trust: 4 }, audience: { hardcore: 30 } } },
      { id: 'keep', label: 'Deixar como está', detail: 'A comunidade adotou o bug.', outcome: 'O método ganhou o nome de “caixa dois”.', effects: { game: { salesRate: 0.12, trust: -1 }, audience: { nostalgic: 35 } } },
      { id: 'official', label: 'Transformar em opção', detail: 'Trabalho extra, boa história.', outcome: 'O menu agora chama isso de modo clássico.', effects: { player: { money: -1800, reputation: 3 }, game: { salesRate: 0.18, trust: 3 }, audience: { hardcore: 50 } } },
    ],
  },
  {
    id: 'refund-wave',
    tag: 'SUPORTE LOTADO',
    title: 'Uma leva de jogadores pediu reembolso.',
    body: 'A maioria cita travamentos. Dois reclamam que o jogo “não parece com a capa”, embora não exista capa.',
    choices: [
      { id: 'hotfix', label: 'Parar tudo e corrigir', detail: 'Custa caro, estanca a queda.', outcome: 'A versão 1.0.3 chegou antes do fim de semana.', effects: { player: { money: -3200, energy: -12 }, game: { trust: 6, salesRate: 0.04 } } },
      { id: 'refund', label: 'Aceitar sem discutir', detail: 'Perde receita, ganha boa vontade.', outcome: 'O tópico de reclamações foi encerrado pelo próprio autor.', effects: { game: { revenueRate: -0.08, trust: 4 }, player: { reputation: 2 } } },
      { id: 'defend', label: 'Dizer que é caso isolado', detail: 'Pode piorar.', outcome: 'Alguém juntou 46 relatos numa planilha.', effects: { game: { salesRate: -0.09, trust: -8 }, player: { reputation: -4 } } },
    ],
  },
  {
    id: 'guide',
    tag: 'GUIA NÃO OFICIAL',
    title: 'Um jogador escreveu um guia de 38 páginas.',
    body: 'Tem mapa, tabela de dano e uma seção só para coisas que ele acha que você fez de propósito.',
    choices: [
      { id: 'credit', label: 'Divulgar o guia', detail: 'Aproxima os fãs mais dedicados.', outcome: 'O arquivo caiu duas vezes por excesso de downloads.', effects: { game: { salesRate: 0.11, trust: 3 }, audience: { hardcore: 90 } } },
      { id: 'correct', label: 'Mandar correções', detail: 'Útil. Um pouco pedante.', outcome: 'Ele aceitou duas das onze correções.', effects: { game: { trust: 2 }, player: { reputation: 1 }, audience: { hardcore: 45 } } },
      { id: 'leave', label: 'Não mexer', detail: 'A comunidade cuida disso.', outcome: 'A versão 1.1 do guia saiu na terça.', effects: { audience: { hardcore: 30 } } },
    ],
  },
  {
    id: 'speedrun',
    tag: 'RECORDE: 18:42',
    title: 'Começaram a correr contra o relógio.',
    body: 'O recorde usa um salto que atravessa metade da terceira fase. Ninguém sabe quem descobriu.',
    choices: [
      { id: 'embrace', label: 'Criar um cronômetro oficial', detail: 'Barato e bem recebido.', outcome: 'O primeiro placar teve 84 nomes.', effects: { player: { money: -700, reputation: 2 }, game: { salesRate: 0.15 }, audience: { hardcore: 70 } } },
      { id: 'patch', label: 'Corrigir o atalho', detail: 'Melhora o jogo comum, irrita quem corre.', outcome: 'A categoria “versão antiga” apareceu no mesmo dia.', effects: { game: { trust: -3 }, audience: { hardcore: -35, casual: 15 } } },
      { id: 'send-time', label: 'Publicar seu próprio tempo', detail: 'Você provavelmente vai perder.', outcome: 'Seu tempo ficou em 47º.', effects: { player: { reputation: 2 }, game: { salesRate: 0.08 }, audience: { hardcore: 40 } } },
    ],
  },
  {
    id: 'sleeper',
    tag: 'SEIS MESES DEPOIS',
    title: 'As vendas voltaram a subir.',
    body: 'Ninguém sabe apontar um motivo. Há vídeos novos, uma tradução de fã e muita gente dizendo “como eu não conhecia isso?”.',
    choices: [
      { id: 'sale', label: 'Fazer uma promoção', detail: 'Mais cópias, preço menor.', outcome: 'A loja colocou o jogo na primeira página por dois dias.', effects: { game: { salesRate: 0.42, revenueRate: -0.05, followerRate: 0.16 } } },
      { id: 'update', label: 'Lançar uma atualização', detail: 'Custa R$ 4.000. Estende a cauda.', outcome: 'Jogadores antigos voltaram para ver as mudanças.', effects: { player: { money: -4000, reputation: 3 }, game: { salesRate: 0.34, trust: 5, extendSupport: 2 }, audience: { nostalgic: 55 } } },
      { id: 'do-nothing', label: 'Não tocar em nada', detail: 'A onda segue sozinha.', outcome: 'Por uma semana, vendeu mais que no lançamento.', effects: { game: { salesRate: 0.26, followerRate: 0.11 } } },
    ],
  },
]
