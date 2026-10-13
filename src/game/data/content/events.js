// Eventos aleatórios do Gamebobo. Textos curtos, toda escolha com trade-off.
// Placeholders: {staff} (exige minStaff >= 2), {founder}, {game} e {platform} (fase 'dev'),
// {studio}, {lastgame} (exige minGames >= 1), {rival}.
// Convenção: eventos fora da fase 'dev' não usam hype/bugs/pts/weeks.

export const EVENTS = [
  // =====================================================================
  // DESENVOLVIMENTO
  // =====================================================================
  { id: 'gato-teclado', icon: 'cat', title: 'O gato sentou no teclado', when: { phase: 'dev', needsDecor: 'cat' }, weight: 1, funny: true, choices: [
    { label: 'Deixa ele', effects: { bugs: 3, pts: { idea: 2 } }, result: 'Nasceu uma mecânica nova.' },
    { label: 'Tira ele', gamble: { chance: 0.5, win: { bugs: -2 }, lose: { mood: -10 } }, winText: 'Ele saiu ronronando.', loseText: 'Arranhão no braço. Fundo.' },
  ] },
  { id: 'pombo-ar-condicionado', icon: 'tornado', title: 'Um pombo mora no ar-condicionado', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Adota o pombo', effects: { mood: 8, energy: -8 }, result: 'Mascote novo, escritório quentinho.' },
    { label: 'Chama o técnico', effects: { money: -1500, energy: 6 }, result: 'Ar gelado, pombo despejado.' },
    { label: 'Ignora', gamble: { chance: 0.5, win: { mood: 4 }, lose: { energy: -15, bugs: 2 } }, winText: 'Ele foi embora sozinho.', loseText: 'Calorão e pena no café.' },
  ] },
  { id: 'estagiario-formatou', icon: 'warning', title: 'Estagiário formatou o PC errado', text: 'Levou junto três semanas de código.', when: { phase: 'dev', minStaff: 2 }, weight: 1, funny: true, choices: [
    { label: 'Refaz tudo', effects: { weeks: 2, pts: { fun: 1 } }, result: 'A segunda versão ficou melhor.' },
    { label: 'Técnico caro', effects: { money: -3000, weeks: 1 }, result: 'Salvou quase tudo. Quase.' },
    { label: 'Benze o HD', gamble: { chance: 0.25, win: { mood: 10 }, lose: { weeks: 3, mood: -10 } }, winText: 'Milagre! Voltou tudo.', loseText: 'Nem o santo deu jeito.' },
  ] },
  { id: 'servidor-vela', icon: 'ghost', title: 'Servidor só funciona com vela acesa', when: { phase: 'dev', minYear: 1995 }, weight: 1, funny: true, choices: [
    { label: 'Mantém a vela', effects: { bugs: -3, money: -500 }, result: 'Funciona. Ninguém sabe explicar.' },
    { label: 'Chama o técnico', effects: { money: -2500, bugs: -5 }, result: 'Era um cabo solto. Decepcionante.' },
    { label: 'Apaga a vela', gamble: { chance: 0.4, win: { mood: 5 }, lose: { bugs: 8 } }, winText: 'O servidor se acalmou sozinho.', loseText: 'Caiu bem na hora da build.' },
  ] },
  { id: 'prototipo-assoprar', icon: 'cartridge', title: 'O protótipo só liga assoprando', when: { phase: 'dev', maxYear: 1998 }, weight: 1, funny: true, choices: [
    { label: 'Assopra forte', gamble: { chance: 0.6, win: { pts: { fun: 1 } }, lose: { bugs: 4, energy: -5 } }, winText: 'Ligou! Equipe aplaudiu de pé.', loseText: 'Cuspe no circuito. Ops.' },
    { label: 'Troca a placa', effects: { money: -2000, bugs: -2 }, result: 'Placa nova, zero sopro.' },
  ] },
  { id: 'chefao-sindico', icon: 'skull', title: 'Chefão inspirado no síndico vazou', text: 'O síndico viu. E se reconheceu.', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Muda o chefão', effects: { weeks: 1, mood: -5 }, result: 'Agora é um sapo genérico.' },
    { label: 'Mantém', gamble: { chance: 0.5, win: { hype: 12 }, lose: { money: -3000 } }, winText: 'O síndico virou fã!', loseText: 'Multa por barulho. Coincidência?' },
  ] },
  { id: 'crunch-proposta', icon: 'clock', title: 'Dá pra lançar antes, com crunch', when: { phase: 'dev' }, weight: 1.2, choices: [
    { label: 'Crunch!', effects: { weeks: -2, energy: -25, mood: -10 }, result: 'Adiantado. As olheiras também.' },
    { label: 'Ritmo normal', effects: { mood: 5 }, result: 'Equipe agradeceu com bolo.' },
  ] },
  { id: 'heroi-geladeira', icon: 'bug', title: 'Bug transforma o herói em geladeira', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Conserta', effects: { weeks: 1, bugs: -5 }, result: 'O herói voltou a ser gente.' },
    { label: 'Vira feature', gamble: { chance: 0.45, win: { hype: 10, pts: { idea: 2 } }, lose: { nextScore: -3 } }, winText: 'Geladeira jogável virou febre!', loseText: 'Os críticos não acharam graça.' },
  ] },
  { id: 'build-vazou', icon: 'warning', title: 'A build de {game} vazou', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Chama de demo', gamble: { chance: 0.5, win: { hype: 15 }, lose: { salesMult: 0.85 } }, winText: 'Marketing involuntário genial!', loseText: 'Todo mundo já jogou de graça.' },
    { label: 'Chama advogado', effects: { money: -4000, hype: -5 }, result: 'Caro, mas o vazamento parou.' },
  ] },
  { id: 'revista-previa', icon: 'newspaper', title: 'Revista quer prévia exclusiva', text: 'Querem fotos de {game} até sexta.', when: { phase: 'dev', maxYear: 2005 }, weight: 1, choices: [
    { label: 'Manda fotos', effects: { hype: 12, weeks: 1 }, result: 'Página dupla com pôster!' },
    { label: 'Manda montagem', gamble: { chance: 0.6, win: { hype: 15 }, lose: { hype: -5, fansPct: -0.03 } }, winText: 'Ninguém percebeu a montagem.', loseText: 'Leitores notaram. Cartas furiosas.' },
    { label: 'Sem tempo', effects: { pts: { fun: 1 } }, result: 'A equipe focou no jogo.' },
  ] },
  { id: 'streamer-beta', icon: 'tv', title: 'Streamer famoso jogou o beta', when: { phase: 'dev', minYear: 2014 }, weight: 1.2, choices: [
    { label: 'Torce junto', gamble: { chance: 0.55, win: { hype: 18 }, lose: { hype: -8 } }, winText: 'O chat inteiro quer comprar!', loseText: 'Travou na live. Ao vivo.' },
    { label: 'Patrocina ele', effects: { money: -5000, hype: 14 }, result: 'Live patrocinada, chat empolgado.' },
  ] },
  { id: 'servidor-beta-caiu', icon: 'wifi', title: 'O servidor do beta caiu', text: 'Mil jogadores na fila e a paciência acabando.', when: { phase: 'dev', minYear: 1998 }, weight: 1, choices: [
    { label: 'Servidor novo', effects: { money: -4000, hype: 5 }, result: 'Fila andou, galera feliz.' },
    { label: 'Gambiarra', gamble: { chance: 0.5, win: { pts: { idea: 1 } }, lose: { hype: -12, bugs: 5 } }, winText: 'Segurou com fita isolante!', loseText: 'Caiu de novo. Saiu fumaça.' },
  ] },
  { id: 'publisher-final', icon: 'briefcase', title: 'Publisher quer financiar {game}', text: 'Em troca, querem mudar o final.', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Aceita', effects: { money: 8000, nextScore: -3 }, result: 'Final feliz forçado, conta cheia.' },
    { label: 'Recusa', effects: { mood: 6 }, result: 'Arte preservada, cofre vazio.' },
    { label: 'Negocia', gamble: { chance: 0.4, win: { money: 6000 }, lose: { money: -1000, weeks: 1 } }, winText: 'Grana sem mexer no final!', loseText: 'Reunião infinita, nada resolvido.' },
  ] },
  { id: 'demo-feira', icon: 'megaphone', title: 'Abriu vaga pra demo na feira', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Leva a demo', gamble: { chance: 0.6, win: { hype: 15 }, lose: { hype: -8 } }, winText: 'Fila dobrando o corredor!', loseText: 'Travou na frente do jornalista.' },
    { label: 'Só um vídeo', effects: { hype: 6, money: -1500 }, result: 'Seguro, mas sem brilho.' },
  ] },
  { id: 'musica-chiclete', icon: 'note', title: '{staff} compôs uma música chiclete', when: { phase: 'dev', minStaff: 2 }, weight: 1, choices: [
    { label: 'Põe no jogo', effects: { pts: { sound: 3 }, weeks: 1 }, result: 'Escritório inteiro assoviando.' },
    { label: 'Vende pra comercial', effects: { money: 4000, mood: -5 }, result: 'Virou jingle de sabão em pó.' },
  ] },
  { id: 'monitor-fumaca', icon: 'fire', title: 'O monitor da arte soltou fumaça', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Compra outro', effects: { money: -3000 }, result: 'Novinho, cheirando a plástico.' },
    { label: 'Técnico do bairro', gamble: { chance: 0.5, win: { money: -500 }, lose: { weeks: 2, money: -1000 } }, winText: 'Resolveu com um tapinha!', loseText: 'Agora solta faísca também.' },
  ] },
  { id: 'reuniao-botao', icon: 'calendar', title: 'Reunião sobre a cor do botão', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Azul!', effects: { pts: { art: 1 }, mood: -5 }, result: 'Venceu o azul. Perdeu a paz.' },
    { label: 'Vermelho!', gamble: { chance: 0.5, win: { pts: { art: 2 } }, lose: { energy: -10 } }, winText: 'Botão lindo, debate encerrado.', loseText: 'Mais duas horas de debate.' },
    { label: 'Encerra reunião', effects: { mood: 5, bugs: 2 }, result: 'Ficou bege. Ninguém liga.' },
  ] },
  { id: 'engine-milagrosa', icon: 'gear', title: 'Engine nova promete milagres', when: { phase: 'dev', minYear: 1993 }, weight: 1, choices: [
    { label: 'Troca de engine', gamble: { chance: 0.45, win: { pts: { fun: 2, art: 3 } }, lose: { weeks: 3, bugs: 8 } }, winText: 'Milagre confirmado!', loseText: 'O milagre era só no folheto.' },
    { label: 'Fica na velha', effects: { pts: { fun: 1 } }, result: 'Velha conhecida, sem surpresas.' },
  ] },
  { id: 'vo-testou', icon: 'heart', title: 'A vó de {staff} testou o jogo', when: { phase: 'dev', minStaff: 2 }, weight: 1, funny: true, choices: [
    { label: 'Ouve a vó', effects: { pts: { fun: 2 }, weeks: 1 }, result: 'Facilitou o começo. Ela aprovou.' },
    { label: 'Ignora a vó', gamble: { chance: 0.5, win: { pts: { idea: 1 } }, lose: { mood: -8 } }, winText: 'Ela nem percebeu.', loseText: 'A vó cortou o bolo semanal.' },
  ] },
  { id: 'dublador-sumiu', icon: 'headphones', title: 'Dublador sumiu no meio da gravação', when: { phase: 'dev', minYear: 1995 }, weight: 1, choices: [
    { label: 'Dubla você', gamble: { chance: 0.4, win: { pts: { sound: 2 }, hype: 6 }, lose: { nextScore: -2 } }, winText: 'Voz marcante. Virou cult!', loseText: 'Parece um pato resfriado.' },
    { label: 'Contrata outro', effects: { money: -3000, weeks: 1 }, result: 'Profissional, rápido e caro.' },
  ] },
  { id: 'bug-impede-zerar', icon: 'bug', title: 'Bug impede zerar {game}', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Adia', effects: { weeks: 1, bugs: -8 }, result: 'Bug esmagado, cronograma amassado.' },
    { label: 'Lança assim', effects: { nextScore: -4 }, result: 'Quem chega no final, afinal?' },
  ] },
  { id: 'cafeteira-quebrou', icon: 'coffee', title: 'A cafeteira quebrou na reta final', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Compra outra', effects: { money: -1200, energy: 5 }, result: 'Café jorrando, equipe viva.' },
    { label: 'Chá de camomila', effects: { energy: -10, mood: 6 }, result: 'Equipe zen e sonolenta.' },
    { label: 'Café da padaria', gamble: { chance: 0.5, win: { energy: 10 }, lose: { energy: -8, money: -500 } }, winText: 'Veio pão de queijo junto!', loseText: 'Café frio e conta alta.' },
  ] },
  { id: 'camelo-antes', icon: 'disc', title: 'Camelô já vende {game} pirata', text: 'E o jogo nem ficou pronto ainda.', when: { phase: 'dev', minYear: 1990, maxYear: 2008 }, weight: 1, funny: true, choices: [
    { label: 'Antecipa lançamento', effects: { weeks: -1, bugs: 5 }, result: 'Corrida contra o camelô.' },
    { label: 'Ignora', effects: { salesMult: 0.9 }, result: 'Algumas vendas foram pro beleléu.' },
    { label: 'Compra uma', gamble: { chance: 0.5, win: { pts: { idea: 2 } }, lose: { mood: -4 } }, winText: 'A pirata tinha uma ideia boa!', loseText: 'Era um jogo de pescaria.' },
  ] },
  { id: 'testador-viciado', icon: 'gamepad', title: '{staff} não para de jogar {game}', when: { phase: 'dev', minStaff: 2 }, weight: 1, choices: [
    { label: 'Bom sinal!', effects: { pts: { fun: 2 }, energy: -10 }, result: 'Se até ele gostou...' },
    { label: 'Chega de jogar', effects: { mood: -5, bugs: -3 }, result: 'Voltou resmungando, mas achou bugs.' },
  ] },
  { id: 'recurso-atrasado', icon: 'clock', title: 'Recurso gigante está atrasado', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Corta ele', effects: { weeks: -1, nextScore: -1 }, result: 'Ninguém vai sentir falta. Talvez.' },
    { label: 'Mantém', effects: { weeks: 2, pts: { idea: 3 } }, result: 'A espera valeu a pena.' },
  ] },
  { id: 'jornalista-visita', icon: 'newspaper', title: 'Jornalista quer visitar o estúdio', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Faz o tour', gamble: { chance: 0.55, win: { hype: 12 }, lose: { hype: -6 } }, winText: 'Matéria linda com foto da equipe.', loseText: 'Fotografou a pia cheia de louça.' },
    { label: 'Hoje não', effects: { pts: { art: 1 } }, result: 'A bagunça segue em segredo.' },
  ] },
  { id: 'vizinho-som', icon: 'angry', title: 'Vizinho reclama dos testes de som', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Espuma na parede', effects: { money: -1500 }, result: 'Paz no prédio, eco no bolso.' },
    { label: 'Convida ele', gamble: { chance: 0.5, win: { pts: { sound: 2 }, mood: 5 }, lose: { weeks: 1 } }, winText: 'Era músico! Ajudou na trilha.', loseText: 'Ele ficou e opinou em tudo.' },
  ] },
  { id: 'acabou-luz', icon: 'bolt', title: 'Acabou a luz no bairro', text: 'O último save foi quando mesmo?', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Espera voltar', gamble: { chance: 0.5, win: { mood: 4 }, lose: { weeks: 1, bugs: 4 } }, winText: 'Voltou rápido. Nada perdido!', loseText: 'Save corrompido. Choro coletivo.' },
    { label: 'Aluga gerador', effects: { money: -2500 }, result: 'Barulhento, mas salvou o dia.' },
    { label: 'Folga geral', effects: { energy: 15, weeks: 1 }, result: 'Equipe descansada e feliz.' },
  ] },
  { id: 'ideia-banho', icon: 'bulb', title: '{staff} teve uma ideia no banho', when: { phase: 'dev', minStaff: 2 }, weight: 1, choices: [
    { label: 'Implementa', gamble: { chance: 0.5, win: { pts: { idea: 4 } }, lose: { bugs: 6, weeks: 1 } }, winText: 'Genial! Banho abençoado.', loseText: 'Devia ter ficado no banho.' },
    { label: 'Anota', effects: { rp: 8 }, result: 'Foi pro caderno de pesquisa.' },
  ] },
  { id: 'trailer-viral', icon: 'tv', title: 'O trailer de {game} viralizou', when: { phase: 'dev', minYear: 2005 }, weight: 1, choices: [
    { label: 'Compra anúncios', effects: { hype: 10, money: -2000 }, result: 'Propaganda até no ônibus!' },
    { label: 'Promete mais', gamble: { chance: 0.5, win: { hype: 20 }, lose: { hype: -5, nextScore: -2 } }, winText: 'Expectativa nas alturas!', loseText: 'Prometeu dragões. Não tem dragões.' },
  ] },
  { id: 'rival-cobica-dev', icon: 'briefcase', title: '{rival} quer contratar {staff}', when: { phase: 'dev', minStaff: 2 }, weight: 1, choices: [
    { label: 'Dá aumento', effects: { money: -3000, mood: 5 }, result: 'Ficou e ainda trouxe bolo.' },
    { label: 'Apela pro coração', gamble: { chance: 0.6, win: { mood: 8 }, lose: { mood: -12, energy: -10 } }, winText: 'Ficou! Abraço coletivo.', loseText: 'Ficou, mas de cara fechada.' },
  ] },
  { id: 'devkit-quebrado', icon: 'chip', title: 'Kit do {platform} chegou quebrado', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Pede outro', effects: { weeks: 1 }, result: 'Demorou, mas chegou outro.' },
    { label: 'Conserta aqui', gamble: { chance: 0.5, win: { rp: 12 }, lose: { money: -2000, weeks: 1 } }, winText: 'Aprendemos o hardware por dentro!', loseText: 'Agora são dois kits quebrados.' },
  ] },
  { id: 'fas-pedem-heroi', icon: 'fans', title: 'Fãs pedem herói antigo de volta', text: 'Querem o herói de {lastgame} em {game}.', when: { phase: 'dev', minGames: 1 }, weight: 1, choices: [
    { label: 'Traz ele', effects: { hype: 10, weeks: 1 }, result: 'Fãs em festa!' },
    { label: 'Herói novo', effects: { pts: { idea: 2 }, hype: -5 }, result: 'Cara nova, risco novo.' },
  ] },
  { id: 'trilha-parecida', icon: 'note', title: 'Trilha parece demais com um hit', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Refaz a trilha', effects: { weeks: 1, money: -1500 }, result: 'Original e sem processo.' },
    { label: 'Arrisca', gamble: { chance: 0.6, win: { pts: { sound: 2 } }, lose: { money: -6000 } }, winText: 'Ninguém notou a semelhança.', loseText: 'A gravadora notou. Advogado caro.' },
  ] },
  { id: 'faxineira-dica', icon: 'smile', title: 'A faxineira deu uma dica genial', text: 'Ela zerou o protótipo antes de todo mundo.', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Paga consultoria', effects: { pts: { fun: 2, idea: 1 }, money: -1500 }, result: 'Virou consultora oficial.' },
    { label: 'Assume a autoria', gamble: { chance: 0.5, win: { pts: { fun: 2, idea: 1 } }, lose: { pts: { fun: 1 }, mood: -10 } }, winText: 'Ninguém percebeu. Feio, mas funcionou.', loseText: 'Ela contou pra todo mundo.' },
  ] },
  { id: 'chuva-bugs', icon: 'storm', title: 'Chuva de bugs na versão beta', when: { phase: 'dev' }, weight: 1.2, choices: [
    { label: 'Semana de caça', effects: { weeks: 1, bugs: -10, energy: -10 }, result: 'Inseticida digital aplicado.' },
    { label: 'Contrata testers', effects: { money: -3000, bugs: -8 }, result: 'Testers caçaram quase tudo.' },
    { label: 'Reza', gamble: { chance: 0.3, win: { bugs: -10 }, lose: { bugs: 5 } }, winText: 'Os bugs sumiram sozinhos!', loseText: 'Os bugs se reproduziram.' },
  ] },
  { id: 'rival-clone', icon: 'warning', title: '{rival} anunciou um jogo igualzinho', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Acelera', effects: { weeks: -1, energy: -15 }, result: 'Chegaremos antes. Exaustos.' },
    { label: 'Diferencia', effects: { weeks: 1, pts: { idea: 3 } }, result: 'Agora o nosso tem um pato.' },
    { label: 'Faz piada', gamble: { chance: 0.5, win: { hype: 12 }, lose: { hype: -6 } }, winText: 'A piada viralizou!', loseText: 'Ninguém entendeu a piada.' },
  ] },
  { id: 'classificacao-alta', icon: 'warning', title: 'Classificação etária saiu alta demais', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Suaviza', effects: { weeks: 1, salesMult: 1.05 }, result: 'Agora sangue é suco de uva.' },
    { label: 'Mantém', effects: { salesMult: 0.92, hype: 8 }, result: 'Proibido virou propaganda.' },
  ] },
  { id: 'ferias-no-meio', icon: 'beach', title: '{staff} quer férias no meio do projeto', when: { phase: 'dev', minStaff: 3 }, weight: 1, choices: [
    { label: 'Pode ir', effects: { weeks: 1, mood: 10 }, result: 'Voltou bronzeado e inspirado.' },
    { label: 'Depois do lançamento', effects: { mood: -10, pts: { fun: 1 } }, result: 'Ficou, olhando fotos de praia.' },
  ] },
  { id: 'fantasia-mascote', icon: 'mask', title: 'Mascote em tamanho real pra divulgação', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Contrata ator', effects: { money: -2000, hype: 10 }, result: 'Sucesso na porta do shopping.' },
    { label: 'Estagiário veste', gamble: { chance: 0.5, win: { hype: 12 }, lose: { hype: 2, mood: -8 } }, winText: 'Dançou no metrô e viralizou!', loseText: 'A fantasia rasgou no palco.' },
  ] },
  { id: 'crianca-chorou', icon: 'frown', title: 'Criança testou o jogo e chorou', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Facilita tudo', effects: { pts: { fun: 2 }, weeks: 1 }, result: 'Agora até o tio consegue.' },
    { label: 'Pergunta por quê', gamble: { chance: 0.5, win: { hype: 8 }, lose: { nextScore: -2 } }, winText: 'Era choro de emoção. Ufa!', loseText: 'Era medo do chefão.' },
  ] },
  { id: 'lan-house-teste', icon: 'users', title: 'Lan house quer testar o multiplayer', when: { phase: 'dev', minYear: 2000, maxYear: 2012 }, weight: 1.2, choices: [
    { label: 'Leva o jogo', gamble: { chance: 0.6, win: { pts: { fun: 2 }, hype: 8 }, lose: { bugs: 8 } }, winText: 'A molecada pirou!', loseText: 'Derrubou a rede da lan.' },
    { label: 'Testa em casa', effects: { weeks: 1, bugs: -3 }, result: 'Seguro, lento e sem graça.' },
  ] },
  { id: 'ia-arte', icon: 'robot', title: 'IA promete fazer toda a arte', when: { phase: 'dev', minYear: 2023 }, weight: 1.2, choices: [
    { label: 'Usa a IA', gamble: { chance: 0.4, win: { pts: { art: 4 }, weeks: -1 }, lose: { nextScore: -4, fansPct: -0.04 } }, winText: 'Ficou bom. Ninguém reparou.', loseText: 'Personagens com sete dedos.' },
    { label: 'Arte humana', effects: { money: -2000, pts: { art: 2 } }, result: 'Cada traço com alma.' },
  ] },
  { id: 'metaverso-investidor', icon: 'cube', title: 'Investidor quer {game} no metaverso', when: { phase: 'dev', minYear: 2021, maxYear: 2024 }, weight: 1.2, funny: true, choices: [
    { label: 'Aceita a grana', effects: { money: 8000, weeks: 2 }, result: 'Grana boa. Ninguém visitou.' },
    { label: 'Recusa', effects: { mood: 5 }, result: 'Equipe aliviada, bolso nem tanto.' },
  ] },
  { id: 'nft-espada', icon: 'coin', title: 'Sócio quer vender espada em NFT', when: { phase: 'dev', minYear: 2021, maxYear: 2023 }, weight: 1.2, funny: true, choices: [
    { label: 'Lança NFT', gamble: { chance: 0.2, win: { money: 15000 }, lose: { fansPct: -0.08 } }, winText: 'Vendeu! Ninguém sabe pra quem.', loseText: 'Fãs revoltados, espadas encalhadas.' },
    { label: 'Nem pensar', effects: { mood: 4 }, result: 'Bolha evitada com sucesso.' },
  ] },
  { id: 'vr-tontura', icon: 'eye', title: 'Protótipo em VR deixou todos tontos', when: { phase: 'dev', minYear: 2016 }, weight: 1, choices: [
    { label: 'Ajusta câmera', effects: { weeks: 1, pts: { fun: 1 } }, result: 'Agora só enjoa um pouquinho.' },
    { label: 'Mantém radical', effects: { hype: 6, nextScore: -1 }, result: 'Vem com saquinho de brinde.' },
  ] },
  { id: 'linha-ocupada', icon: 'phone', title: 'A mãe de {staff} ocupou a linha', text: 'O upload da build caiu de novo.', when: { phase: 'dev', minYear: 1996, maxYear: 2003, minStaff: 2 }, weight: 1.2, funny: true, choices: [
    { label: 'Espera ela', effects: { weeks: 1 }, result: 'Três horas de fofoca.' },
    { label: 'Pede com jeitinho', gamble: { chance: 0.5, win: { mood: 3 }, lose: { mood: -8 } }, winText: 'Ela desligou, sorrindo.', loseText: 'Agora a família toda tá brava.' },
  ] },
  { id: 'disquete-mofou', icon: 'disc', title: 'O disquete do backup mofou', when: { phase: 'dev', minYear: 1984, maxYear: 1997 }, weight: 1, funny: true, choices: [
    { label: 'Refaz de memória', effects: { weeks: 1, energy: -10 }, result: 'Memória de elefante, costas de idoso.' },
    { label: 'Seca no sol', gamble: { chance: 0.4, win: { mood: 5 }, lose: { weeks: 2 } }, winText: 'Funcionou! Ciência de quintal.', loseText: 'Derreteu. Era verão.' },
  ] },
  { id: 'mocap-pijama', icon: 'bolt', title: 'Captura de movimento feita de pijama', when: { phase: 'dev', minYear: 2000 }, weight: 1, funny: true, choices: [
    { label: 'Usa assim', gamble: { chance: 0.5, win: { pts: { art: 3 } }, lose: { nextScore: -2 } }, winText: 'Animação perfeita, roupa ridícula.', loseText: 'O herói anda feito pinguim.' },
    { label: 'Aluga estúdio', effects: { money: -4000, pts: { art: 3 } }, result: 'Animação profissional. Conta também.' },
  ] },
  { id: 'pre-venda', icon: 'money', title: 'Abrir pré-venda de {game}?', when: { phase: 'dev', minYear: 2005 }, weight: 1, choices: [
    { label: 'Abre já', effects: { money: 6000, energy: -10 }, result: 'Grana na conta, pressão no peito.' },
    { label: 'Ainda não', effects: { pts: { fun: 1 } }, result: 'Sem pressão, foco no jogo.' },
  ] },
  { id: 'gato-cafe-servidor', icon: 'cat', title: 'O gato derrubou café no servidor', when: { phase: 'dev', needsDecor: 'cat' }, weight: 1, funny: true, choices: [
    { label: 'Secador de cabelo', gamble: { chance: 0.5, win: { mood: 5 }, lose: { bugs: 8, money: -1500 } }, winText: 'Salvo pelo secador de cabelo!', loseText: 'O servidor ronrona estranho agora.' },
    { label: 'Servidor novo', effects: { money: -3500, bugs: -2 }, result: 'O gato julgou a compra.' },
  ] },
  { id: 'copa-do-mundo', icon: 'ball', title: 'A Copa do Mundo começou', text: 'Ninguém trabalha em dia de jogo.', when: { phase: 'dev' }, weight: 0.6, choices: [
    { label: 'Telão no escritório', effects: { money: -1500, mood: 15, weeks: 1 }, result: 'Gritaria e produtividade zero.' },
    { label: 'Proíbe futebol', effects: { mood: -12, pts: { fun: 1 } }, result: 'Radinho escondido na gaveta.' },
  ] },
  { id: 'feriadao', icon: 'calendar', title: 'Feriadão chegando', when: { phase: 'dev' }, weight: 1, choices: [
    { label: 'Emenda tudo', effects: { energy: 20, weeks: 1 }, result: 'A equipe voltou renovada.' },
    { label: 'Trabalha no feriado', effects: { energy: -10, mood: -8, pts: { fun: 1, art: 1 } }, result: 'Escritório vazio, cara emburrada.' },
  ] },
  { id: 'horoscopo', icon: 'star', title: 'Horóscopo diz: péssima semana pra lançar', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Adia uma semana', effects: { weeks: 1, mood: 5 }, result: 'Mercúrio agradece a consideração.' },
    { label: 'Ignora os astros', gamble: { chance: 0.6, win: { hype: 5 }, lose: { bugs: 5 } }, winText: 'Os astros erraram feio.', loseText: 'Mercúrio retrógrado cobrou caro.' },
  ] },
  { id: 'gripe-geral', icon: 'frown', title: 'A gripe derrubou metade da equipe', when: { phase: 'dev', minStaff: 3 }, weight: 1, choices: [
    { label: 'Todos pra casa', effects: { energy: 15, weeks: 1 }, result: 'Voltaram saudáveis e gratos.' },
    { label: 'Chá e lencinho', effects: { energy: -10, mood: -4 }, result: 'Escritório virou enfermaria.' },
  ] },
  { id: 'memoria-cartucho', icon: 'cartridge', title: 'A memória do cartucho acabou', when: { phase: 'dev', maxYear: 1995 }, weight: 1.2, choices: [
    { label: 'Corta fases', effects: { weeks: -1, nextScore: -1 }, result: 'Ninguém conta as fases, né?' },
    { label: 'Cartucho maior', effects: { money: -3000 }, result: 'Mais memória, mais caro.' },
    { label: 'Compressão maluca', gamble: { chance: 0.45, win: { rp: 10, pts: { idea: 1 } }, lose: { bugs: 8 } }, winText: 'Coube tudo! Bruxaria binária.', loseText: 'Agora o herói é um quadrado.' },
  ] },
  { id: 'revista-codigo-secreto', icon: 'book', title: 'Revista pede código secreto exclusivo', when: { phase: 'dev', maxYear: 2002 }, weight: 1.2, choices: [
    { label: 'Cria um', effects: { weeks: 1, hype: 10 }, result: 'Página de truques garantida.' },
    { label: 'Inventa um falso', gamble: { chance: 0.5, win: { hype: 12 }, lose: { fansPct: -0.04 } }, winText: 'Nasceu uma lenda de recreio!', loseText: 'As crianças descobriram. Fúria.' },
  ] },
  { id: 'fliperama-shopping', icon: 'arcade', title: 'Fliperama do shopping quer o protótipo', when: { phase: 'dev', maxYear: 1995 }, weight: 1, choices: [
    { label: 'Instala lá', gamble: { chance: 0.6, win: { pts: { fun: 2 }, hype: 8 }, lose: { bugs: 5, hype: -4 } }, winText: 'As fichas acabaram em uma hora!', loseText: 'Molecada achou bug de vida infinita.' },
    { label: 'Teste caseiro', effects: { pts: { idea: 1 } }, result: 'Mais seguro, menos emoção.' },
  ] },
  { id: 'fita-novela', icon: 'tv', title: 'Gravaram novela por cima do código', text: 'O código estava na fita cassete da sala.', when: { phase: 'dev', minYear: 1980, maxYear: 1987 }, weight: 1.2, funny: true, choices: [
    { label: 'Reescreve', effects: { weeks: 2 }, result: 'Código novo, capítulo perdido.' },
    { label: 'Assiste a novela', gamble: { chance: 0.3, win: { pts: { idea: 3 }, weeks: 1 }, lose: { weeks: 2, mood: -5 } }, winText: 'A novela inspirou o enredo!', loseText: 'Perdeu o código e o final.' },
  ] },
  { id: 'acesso-antecipado', icon: 'door', title: 'Lançar em acesso antecipado?', when: { phase: 'dev', minYear: 2013 }, weight: 1, choices: [
    { label: 'Lança cedo', effects: { money: 5000, nextScore: -2, hype: 5 }, result: 'Grana entrando. Críticas também.' },
    { label: 'Espera ficar pronto', effects: { pts: { fun: 1 }, mood: 3 }, result: 'Paciência é virtude. Dizem.' },
  ] },
  { id: 'patch-dia-um', icon: 'gear', title: 'Lançar agora e corrigir depois?', when: { phase: 'dev', minYear: 2008 }, weight: 1, choices: [
    { label: 'Lança e corrige', effects: { weeks: -1, nextScore: -2 }, result: 'Atualização de 20 gigas no dia um.' },
    { label: 'Adia e lapida', effects: { weeks: 2, bugs: -8, hype: -4 }, result: 'Polido, com fãs impacientes.' },
  ] },
  { id: 'arcade-viciou', icon: 'arcade', title: 'O fliperama do escritório viciou {staff}', when: { phase: 'dev', needsDecor: 'arcade', minStaff: 2 }, weight: 1, funny: true, choices: [
    { label: 'Desliga o fliper', effects: { mood: -8, energy: 5 }, result: 'Produtividade volta, alegria não.' },
    { label: 'Torneio interno', effects: { mood: 10, weeks: 1 }, result: 'Campeão ganhou vaga na garagem.' },
  ] },
  { id: 'quadro-apagado', icon: 'pencil', title: 'Alguém apagou o quadro branco', text: 'Era o design do jogo inteiro.', when: { phase: 'dev', needsDecor: 'whiteboard' }, weight: 1, funny: true, choices: [
    { label: 'Redesenha', effects: { weeks: 1, pts: { idea: 1 } }, result: 'A versão dois ficou mais bonita.' },
    { label: 'Usa foto borrada', gamble: { chance: 0.5, win: { mood: 4 }, lose: { bugs: 6 } }, winText: 'Dava pra ler! Quase tudo.', loseText: 'Leram "pular" como "explodir".' },
  ] },
  { id: 'holograma-fugiu', icon: 'ghost', title: 'Holograma do chefão escapou do protótipo', when: { phase: 'dev', minYear: 2032 }, weight: 1.2, funny: true, choices: [
    { label: 'Desliga tudo', effects: { weeks: 1, bugs: -2 }, result: 'Ele resistiu bravamente.' },
    { label: 'Deixa passear', gamble: { chance: 0.5, win: { hype: 12 }, lose: { bugs: 8 } }, winText: 'Viralizou passeando no shopping!', loseText: 'Apagou três arquivos no caminho.' },
  ] },
  { id: 'implante-neural', icon: 'chip', title: 'Implante promete programar dormindo', when: { phase: 'dev', minYear: 2036 }, weight: 1.2, funny: true, choices: [
    { label: 'Testa', gamble: { chance: 0.4, win: { pts: { fun: 2, idea: 2 } }, lose: { energy: -20, bugs: 6 } }, winText: 'Sonhamos o jogo inteiro!', loseText: 'Programaram pesadelos. Literalmente.' },
    { label: 'Prefere café', effects: { money: -300, energy: 5 }, result: 'Tecnologia antiga, resultado garantido.' },
  ] },
  { id: 'streamer-speedrun', icon: 'clock', title: 'Speedrunner zerou o beta em 4 minutos', when: { phase: 'dev', minYear: 2012 }, weight: 1, funny: true, choices: [
    { label: 'Conserta o atalho', effects: { weeks: 1, bugs: -4 }, result: 'Agora leva cinco minutos.' },
    { label: 'Abraça o caos', gamble: { chance: 0.55, win: { hype: 12, pts: { fun: 1 } }, lose: { nextScore: -2 } }, winText: 'Comunidade speedrun adotou o jogo!', loseText: 'Críticos zeraram rápido demais.' },
  ] },
  { id: 'teclado-grudento', icon: 'code', title: 'Refrigerante derramado no teclado do líder', when: { phase: 'dev' }, weight: 1, funny: true, choices: [
    { label: 'Teclado novo', effects: { money: -400 }, result: 'Teclas macias. Que saudade.' },
    { label: 'Usa assim', effects: { bugs: 4, mood: -3 }, result: 'A tecla E grudou pra sempre.' },
  ] },

  // =====================================================================
  // ENTRE PROJETOS
  // =====================================================================
  { id: 'carta-menino', icon: 'mail', title: 'Carta de fã sobre {lastgame}', text: 'Um menino desenhou o herói com giz de cera.', when: { phase: 'idle', minGames: 1, maxYear: 1999 }, weight: 1.2, choices: [
    { label: 'Manda brinde', effects: { money: -800, fansPct: 0.03 }, result: 'Fã eterno conquistado.' },
    { label: 'Pendura na parede', effects: { mood: 10 }, result: 'Inspiração pra equipe toda.' },
  ] },
  { id: 'convencao', icon: 'megaphone', title: 'Convite pra convenção de games', when: { phase: 'idle', minFans: 500 }, weight: 1, choices: [
    { label: 'Estande grande', effects: { money: -6000, fansPct: 0.1 }, result: 'Fila de fãs pra foto!' },
    { label: 'Mesinha simples', gamble: { chance: 0.5, win: { fansPct: 0.05 }, lose: { mood: -5 } }, winText: 'Pequena e charmosa. Sucesso!', loseText: 'Ficamos do lado do banheiro.' },
    { label: 'Fica em casa', effects: { energy: 10 }, result: 'Fim de semana de descanso.' },
  ] },
  { id: 'leao-imposto', icon: 'money', title: 'O leão do imposto bateu na porta', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Paga tudo', effects: { money: -3000 }, result: 'Consciência limpa, bolso vazio.' },
    { label: 'Contador criativo', gamble: { chance: 0.6, win: { money: -1000 }, lose: { money: -6000 } }, winText: 'Economizou, tudo dentro da lei.', loseText: 'Multa, juros e sermão.' },
  ] },
  { id: 'rival-cobica-idle', icon: 'briefcase', title: '{rival} fez proposta para {staff}', when: { phase: 'idle', minStaff: 2 }, weight: 1, choices: [
    { label: 'Cobre a oferta', effects: { money: -4000, mood: 5 }, result: 'Ficou, e de salário novo.' },
    { label: 'Confia nele', gamble: { chance: 0.7, win: { mood: 6 }, lose: { mood: -15 } }, winText: 'Recusou por amizade. Que orgulho!', loseText: 'Ficou, mas suspira pela {rival}.' },
  ] },
  { id: 'rival-quer-comprar', icon: 'handshake', title: '{rival} quer comprar {studio}', when: { phase: 'idle', minGames: 3 }, weight: 1, choices: [
    { label: 'Nem pensar', effects: { mood: 10 }, result: 'Equipe cantou o hino da firma.' },
    { label: 'Ouve a oferta', effects: { money: 2000, mood: -5 }, result: 'Jantar grátis, oferta recusada.' },
  ] },
  { id: 'relancamento', icon: 'disc', title: 'Pedem relançamento de {lastgame}', when: { phase: 'idle', minGames: 2 }, weight: 1, choices: [
    { label: 'Relança', effects: { money: 5000, fansPct: -0.02 }, result: 'Grana fácil, fãs desconfiados.' },
    { label: 'Recusa', effects: { fansPct: 0.02 }, result: 'Fãs respeitaram a decisão.' },
  ] },
  { id: 'goteira', icon: 'storm', title: 'Goteira bem em cima do computador', when: { phase: 'idle' }, weight: 1, funny: true, choices: [
    { label: 'Põe um balde', gamble: { chance: 0.6, win: { mood: 2 }, lose: { money: -2500 } }, winText: 'Balde heroico salvou o dia.', loseText: 'Balde transbordou no teclado.' },
    { label: 'Conserta o teto', effects: { money: -2000, mood: 5 }, result: 'Teto novo, cabeça seca.' },
  ] },
  { id: 'curso-design', icon: 'graduation', title: 'Curso de game design na cidade', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Manda a equipe', effects: { money: -3000, rp: 20 }, result: 'Certificados na parede.' },
    { label: 'Lê a apostila', effects: { rp: 8, energy: -5 }, result: 'Aprendeu o básico e cochilou.' },
  ] },
  { id: 'game-jam', icon: 'trophy', title: 'Convite pra uma game jam', when: { phase: 'idle', minYear: 2002 }, weight: 1, choices: [
    { label: 'Participa', gamble: { chance: 0.5, win: { rp: 20, fansPct: 0.03 }, lose: { energy: -20, rp: 5 } }, winText: 'Ganhamos troféu de papelão!', loseText: 'Dormimos no meio da jam.' },
    { label: 'Descansa', effects: { energy: 15 }, result: 'Maratona de série no sofá.' },
  ] },
  { id: 'entrevista-tv', icon: 'tv', title: 'TV quer entrevistar {founder}', when: { phase: 'idle', minFans: 2000 }, weight: 1, choices: [
    { label: 'Vai ao vivo', gamble: { chance: 0.55, win: { fansPct: 0.08 }, lose: { fansPct: -0.03 } }, winText: 'Carisma de apresentador!', loseText: 'Falou "tipo" quarenta vezes.' },
    { label: 'Manda gravado', effects: { fansPct: 0.03, money: -1000 }, result: 'Editaram as gaguejadas. Ufa.' },
  ] },
  { id: 'vaquinha', icon: 'heart', title: 'Fãs oferecem vaquinha online', when: { phase: 'idle', minYear: 2010, minFans: 1000 }, weight: 1, choices: [
    { label: 'Aceita', effects: { money: 8000, salesMult: 0.9 }, result: 'Grana agora; apoiadores já têm o jogo.' },
    { label: 'Recusa', effects: { fansPct: 0.02 }, result: 'Fãs acharam humilde.' },
  ] },
  { id: 'aluguel', icon: 'building', title: 'Dono do imóvel aumentou o aluguel', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Paga', effects: { money: -2500 }, result: 'Sem drama, sem dinheiro.' },
    { label: 'Negocia', gamble: { chance: 0.5, win: { money: -500 }, lose: { money: -4000, mood: -5 } }, winText: 'Desconto por simpatia!', loseText: 'Ofendido, aumentou mais.' },
  ] },
  { id: 'ferias-coletivas', icon: 'beach', title: 'Equipe pede férias coletivas', when: { phase: 'idle', minStaff: 2 }, weight: 1, choices: [
    { label: 'Libera geral', effects: { energy: 30, mood: 10, money: -2000 }, result: 'Voltaram bronzeados e cheios de ideias.' },
    { label: 'Só um dia', effects: { energy: 10, mood: 2 }, result: 'Churrasco no estacionamento.' },
    { label: 'Nada disso', effects: { mood: -12, rp: 10 }, result: 'Estudaram. Emburrados.' },
  ] },
  { id: 'revista-entrevista', icon: 'newspaper', title: 'Revista de games quer entrevista', when: { phase: 'idle', maxYear: 2000 }, weight: 1, choices: [
    { label: 'Conta segredos', effects: { fansPct: 0.06, mood: -3 }, result: 'Leitores amaram, equipe nem tanto.' },
    { label: 'Só o básico', effects: { fansPct: 0.02 }, result: 'Matéria do lado dos classificados.' },
  ] },
  { id: 'investidor-anjo', icon: 'money', title: 'Investidor-anjo quer entrar na firma', when: { phase: 'idle', minGames: 2 }, weight: 1, choices: [
    { label: 'Aceita', effects: { money: 15000, mood: -8 }, result: 'Dinheiro e planilha toda semana.' },
    { label: 'Recusa', effects: { mood: 5 }, result: 'Independência e miojo.' },
    { label: 'Contraproposta', gamble: { chance: 0.4, win: { money: 12000 }, lose: { mood: -5 } }, winText: 'Fechado nos nossos termos!', loseText: 'Ele saiu ofendido.' },
  ] },
  { id: 'apostilas', icon: 'book', title: 'Programador aposentado vende apostilas', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Compra todas', effects: { money: -2000, rp: 25 }, result: 'Café derramado e ouro puro.' },
    { label: 'Só uma', effects: { money: -500, rp: 8 }, result: 'O capítulo três já valeu.' },
  ] },
  { id: 'premio-indie', icon: 'trophy', title: 'Indicação a um prêmio indie', when: { phase: 'idle', minGames: 1 }, weight: 1, choices: [
    { label: 'Vai à festa', effects: { money: -2000, fansPct: 0.05 }, result: 'Terno alugado e foto no jornal.' },
    { label: 'Torce de casa', gamble: { chance: 0.3, win: { fansPct: 0.08 }, lose: { mood: -3 } }, winText: 'Ganhamos de pijama!', loseText: 'Perdemos pro jogo da capivara.' },
  ] },
  { id: 'caixa-misteriosa', icon: 'gift', title: 'Caixa misteriosa chegou pelo correio', when: { phase: 'idle' }, weight: 1, funny: true, choices: [
    { label: 'Abre', gamble: { chance: 0.5, win: { money: 3000 }, lose: { mood: -8 } }, winText: 'Presente de um fã rico!', loseText: 'Cheia de grilos. Vivos.' },
    { label: 'Devolve', effects: { mood: -2 }, result: 'A curiosidade vai te consumir.' },
  ] },
  { id: 'pesquisa-mercado', icon: 'chart', title: 'Empresa oferece pesquisa de mercado', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Compra', effects: { money: -3000, rp: 10, salesMult: 1.05 }, result: 'Gráficos coloridos e úteis.' },
    { label: 'Pergunta na padaria', gamble: { chance: 0.5, win: { rp: 12 }, lose: { energy: -8 } }, winText: 'O padeiro entende de jogos!', loseText: 'Só falaram do preço do pão.' },
  ] },
  { id: 'reforma-vizinha', icon: 'hammer', title: 'Prédio vizinho em reforma barulhenta', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Fones pra todos', effects: { money: -1500, mood: 3 }, result: 'Silêncio comprado à vista.' },
    { label: 'Aguenta', effects: { energy: -15 }, result: 'Britadeira no ritmo da trilha.' },
  ] },
  { id: 'trofeu-pago', icon: 'trophy', title: 'Prêmio de Melhor Estúdio, mediante taxa', when: { phase: 'idle' }, weight: 1, funny: true, choices: [
    { label: 'Paga a taxa', effects: { money: -3000, fansPct: 0.03 }, result: 'Troféu bonito, prêmio duvidoso.' },
    { label: 'Recusa', effects: { mood: 2 }, result: 'Golpe evitado. Orgulho intacto.' },
  ] },
  { id: 'ex-estagiario', icon: 'door', title: 'Ex-estagiário abriu um estúdio rival', when: { phase: 'idle', minGames: 1 }, weight: 1, choices: [
    { label: 'Manda flores', effects: { money: -300, mood: 5 }, result: 'Ele chorou de emoção.' },
    { label: 'Provoca publicamente', gamble: { chance: 0.5, win: { fansPct: 0.03 }, lose: { fansPct: -0.03 } }, winText: 'Treta saudável. Todos ganharam.', loseText: 'Pegou mal. Muito mal.' },
  ] },
  { id: 'escola-doacao', icon: 'graduation', title: 'Escola pede jogos para doação', when: { phase: 'idle', minGames: 1 }, weight: 1, choices: [
    { label: 'Doa jogos', effects: { money: -1500, fansPct: 0.04 }, result: 'Uma geração de fãs nasceu.' },
    { label: 'Dá palestra', effects: { energy: -10, fansPct: 0.02, rp: 5 }, result: 'Perguntaram se você conhece a Ninten.' },
  ] },
  { id: 'fa-tatuagem', icon: 'heart', title: 'Fã tatuou o logo do estúdio', text: 'Com o nome escrito errado.', when: { phase: 'idle', minGames: 1, minFans: 1000 }, weight: 1, funny: true, choices: [
    { label: 'Paga a correção', effects: { money: -800, fansPct: 0.03 }, result: 'Fã eterno, tatuagem certa.' },
    { label: 'Posta a foto', gamble: { chance: 0.6, win: { fansPct: 0.05 }, lose: { fansPct: -0.01 } }, winText: 'Viralizou com carinho.', loseText: 'O fã morreu de vergonha.' },
  ] },
  { id: 'comunidade-bombou', icon: 'users', title: 'Comunidade de {lastgame} bombou na rede', when: { phase: 'idle', minYear: 2004, maxYear: 2012, minGames: 1 }, weight: 1.2, choices: [
    { label: 'Entra lá', gamble: { chance: 0.6, win: { fansPct: 0.06 }, lose: { mood: -6 } }, winText: 'Fãs piraram com a visita!', loseText: 'Achou o tópico "Defeitos". Doeu.' },
    { label: 'Só observa', effects: { rp: 6 }, result: 'Anotou todas as sugestões.' },
  ] },
  { id: 'youtuber-detonou', icon: 'thumbsdown', title: 'YouTuber detonou {lastgame}', when: { phase: 'idle', minYear: 2010, minGames: 1 }, weight: 1.2, choices: [
    { label: 'Responde com humor', gamble: { chance: 0.5, win: { fansPct: 0.06 }, lose: { fansPct: -0.04 } }, winText: 'Vídeo resposta viralizou!', loseText: 'Treta de três semanas.' },
    { label: 'Ignora', effects: { mood: -5 }, result: 'Doeu, mas passa.' },
    { label: 'Manda brinde', effects: { money: -1000, fansPct: 0.02 }, result: 'Ele fez outro vídeo elogiando.' },
  ] },
  { id: 'edital-cultura', icon: 'star', title: 'Edital de cultura aceita games', when: { phase: 'idle', minYear: 2005 }, weight: 1, choices: [
    { label: 'Inscreve', gamble: { chance: 0.35, win: { money: 12000 }, lose: { energy: -10 } }, winText: 'Aprovado! Burocracia vencida.', loseText: 'Reprovado por erro no formulário.' },
    { label: 'Desiste', effects: { energy: 5 }, result: 'Poupou meses de papelada.' },
  ] },
  { id: 'cachorro-caramelo', icon: 'paw', title: 'Cachorro caramelo adotou o estúdio', when: { phase: 'idle' }, weight: 1, funny: true, choices: [
    { label: 'Adota', effects: { mood: 12, money: -800 }, result: 'Agora ele é sócio.' },
    { label: 'Procura o dono', gamble: { chance: 0.5, win: { mood: 5, money: 500 }, lose: { mood: -5 } }, winText: 'Dono deu recompensa e abraço!', loseText: 'Ninguém apareceu. Ele ficou triste.' },
  ] },
  { id: 'consultor-vendas', icon: 'briefcase', title: 'Consultor promete dobrar as vendas', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Contrata', gamble: { chance: 0.35, win: { money: -5000, salesMult: 1.3 }, lose: { money: -5000 } }, winText: 'Ele sabia das coisas!', loseText: 'Disse "sinergia" por duas horas.' },
    { label: 'Dispensa', effects: { mood: 2 }, result: 'Economizou e ainda riu.' },
  ] },
  { id: 'exclusividade', icon: 'lock', title: 'Fabricante oferece exclusividade bem paga', when: { phase: 'idle', minGames: 1 }, weight: 1, choices: [
    { label: 'Assina', effects: { money: 10000, salesMult: 0.85 }, result: 'Grana boa, público menor.' },
    { label: 'Recusa', effects: { fansPct: 0.02 }, result: 'Liberdade multiplataforma.' },
  ] },
  { id: 'festa-fim-de-ano', icon: 'confetti', title: 'Festa de fim de ano', when: { phase: 'idle' }, weight: 1, choices: [
    { label: 'Festão', effects: { money: -3000, mood: 20 }, result: 'Karaokê lendário, vergonha eterna.' },
    { label: 'Amigo secreto', effects: { money: -300, mood: 6 }, result: 'Alguém ganhou meia de novo.' },
    { label: 'Sem festa', effects: { mood: -12 }, result: 'Clima de velório até janeiro.' },
  ] },
  { id: 'cartuchos-encalhados', icon: 'cartridge', title: 'Lojas devolvem cartuchos encalhados', when: { phase: 'idle', minYear: 1983, maxYear: 1986, minGames: 1 }, weight: 1.5, funny: true, choices: [
    { label: 'Saldão', effects: { money: 2000, fansPct: -0.02 }, result: 'Fita a preço de banana.' },
    { label: 'Enterra no deserto', gamble: { chance: 0.5, win: { fansPct: 0.03 }, lose: { fansPct: -0.05 } }, winText: 'Virou lenda urbana. Fãs adoram!', loseText: 'Descobriram. Vergonha nacional.' },
  ] },
  { id: 'operadora-celular', icon: 'phone', title: 'Operadora quer jogo pra celular', when: { phase: 'idle', minYear: 2001, maxYear: 2008 }, weight: 1.2, choices: [
    { label: 'Faz a versão', effects: { money: 5000, energy: -10 }, result: 'Rodou até no tijolão.' },
    { label: 'Recusa', effects: { energy: 5 }, result: 'Celular é moda passageira, né?' },
  ] },
  { id: 'lan-campeonato', icon: 'users', title: 'Lan house faz campeonato de {lastgame}', when: { phase: 'idle', minYear: 2002, maxYear: 2010, minGames: 1 }, weight: 1.2, choices: [
    { label: 'Patrocina', effects: { money: -1500, fansPct: 0.06 }, result: 'Molecada gritando o nome do estúdio.' },
    { label: 'Só aparece', gamble: { chance: 0.5, win: { fansPct: 0.03 }, lose: { mood: -5 } }, winText: 'Autógrafo em guardanapo!', loseText: 'Perdeu pra um menino de dez anos.' },
  ] },
  { id: 'locadora-dono', icon: 'cartridge', title: 'Dono da locadora quer mais fitas', text: 'Diz que {lastgame} vive alugado.', when: { phase: 'idle', minYear: 1985, maxYear: 2006, minGames: 1 }, weight: 1.2, choices: [
    { label: 'Faz desconto', effects: { money: 3000, fansPct: 0.03 }, result: 'Fila na locadora todo sábado.' },
    { label: 'Preço cheio', gamble: { chance: 0.5, win: { money: 6000 }, lose: { mood: -3 } }, winText: 'Pagou sem chorar!', loseText: 'Ele comprou do camelô.' },
  ] },
  { id: 'revista-codigo-falso', icon: 'book', title: 'Revista publicou código falso do jogo', text: 'Criança jura que liberou um dinossauro em {lastgame}.', when: { phase: 'idle', maxYear: 2002, minGames: 1 }, weight: 1, funny: true, choices: [
    { label: 'Entra na brincadeira', gamble: { chance: 0.6, win: { fansPct: 0.05 }, lose: { fansPct: -0.02 } }, winText: 'A lenda cresceu. As vendas também.', loseText: 'Crianças furiosas mandaram cartas.' },
    { label: 'Desmente', effects: { fansPct: 0.01 }, result: 'Honestidade reconhecida. Sem graça.' },
  ] },
  { id: 'promocao-digital', icon: 'coin', title: 'Loja digital quer {lastgame} em promoção', when: { phase: 'idle', minYear: 2008, minGames: 1 }, weight: 1, choices: [
    { label: 'Aceita', effects: { money: 3000, salesMult: 0.92 }, result: 'Vendeu muito, valeu pouco.' },
    { label: 'Recusa', effects: { salesMult: 1.05 }, result: 'Marca valorizada, caixa parado.' },
  ] },
  { id: 'influencer-publi', icon: 'phone', title: 'Influencer oferece publi do estúdio', when: { phase: 'idle', minYear: 2015 }, weight: 1, choices: [
    { label: 'Paga a publi', gamble: { chance: 0.5, win: { money: -3000, fansPct: 0.08 }, lose: { money: -3000 } }, winText: 'Seguidores viraram fãs!', loseText: 'Leu o roteiro errado, ao vivo.' },
    { label: 'Faz permuta', effects: { money: -800, fansPct: 0.02 }, result: 'Pagou em camiseta e adesivo.' },
  ] },
  { id: 'cd-coletanea', icon: 'disc', title: '{lastgame} apareceu num CD do camelô', when: { phase: 'idle', minYear: 1996, maxYear: 2006, minGames: 1 }, weight: 1.2, funny: true, choices: [
    { label: 'Processa', gamble: { chance: 0.4, win: { money: 4000 }, lose: { money: -1000 } }, winText: 'Pagaram! Milagre jurídico.', loseText: 'Advogado cobrou mais que o CD.' },
    { label: 'Deixa quieto', effects: { fansPct: 0.04, salesMult: 0.95 }, result: 'Mais gente conheceu, menos gente pagou.' },
  ] },
  { id: 'tv-infantil', icon: 'tv', title: 'Programa infantil quer mostrar nosso jogo', when: { phase: 'idle', maxYear: 2000, minGames: 1 }, weight: 1, choices: [
    { label: 'Aceita', gamble: { chance: 0.6, win: { fansPct: 0.08 }, lose: { mood: -5 } }, winText: 'Criançada pirou, pais compraram!', loseText: 'Chamaram de "aquele joguinho lá".' },
    { label: 'Manda o mascote', effects: { money: -1500, fansPct: 0.05 }, result: 'O mascote dançou ao vivo!' },
  ] },
  { id: 'meme-founder', icon: 'laugh', title: '{founder} virou meme na internet', when: { phase: 'idle', minYear: 2010 }, weight: 1, funny: true, choices: [
    { label: 'Abraça o meme', gamble: { chance: 0.6, win: { fansPct: 0.06 }, lose: { mood: -6 } }, winText: 'Meme carinhoso, fãs novos!', loseText: 'Todo mundo imita sua risada.' },
    { label: 'Pede pra parar', effects: { mood: 3, fansPct: -0.01 }, result: 'A internet nunca para.' },
  ] },
  { id: 'proibir-fliperama', icon: 'arcade', title: 'Vereador quer proibir fliperamas', when: { phase: 'idle', maxYear: 1992 }, weight: 1.2, choices: [
    { label: 'Abaixo-assinado', gamble: { chance: 0.5, win: { fansPct: 0.05 }, lose: { energy: -10 } }, winText: 'Fliperama salvo! Molecada agradece.', loseText: 'Perdemos. Fichas de luto.' },
    { label: 'Fica quieto', effects: { salesMult: 0.95 }, result: 'Menos fliperama, menos fã.' },
  ] },

  // =====================================================================
  // QUALQUER MOMENTO
  // =====================================================================
  { id: 'gato-mouse', icon: 'cat', title: 'O gato caçou o mouse do PC', when: { phase: 'any', needsDecor: 'cat' }, weight: 1, funny: true, choices: [
    { label: 'Compra outro', effects: { money: -300 }, result: 'Mouse novo, gato frustrado.' },
    { label: 'Deixa com ele', effects: { mood: 8, energy: -5 }, result: 'Gato feliz, equipe no touchpad.' },
  ] },
  { id: 'peixe-julgando', icon: 'eye', title: 'O peixe do aquário parece julgar todos', when: { phase: 'any', needsDecor: 'aquarium' }, weight: 1, funny: true, choices: [
    { label: 'Vira mascote', effects: { money: -500, fansPct: 0.03 }, result: 'O peixe ganhou pelúcia oficial.' },
    { label: 'Encara de volta', gamble: { chance: 0.5, win: { mood: 4 }, lose: { mood: -6 } }, winText: 'Ele desviou o olhar. Vitória!', loseText: 'Julgamento intensificado.' },
  ] },
  { id: 'pebolim-serio', icon: 'ball', title: 'O pebolim virou assunto sério', when: { phase: 'any', needsDecor: 'foosball' }, weight: 1, choices: [
    { label: 'Campeonato valendo café', gamble: { chance: 0.5, win: { mood: 12 }, lose: { mood: -10 } }, winText: 'Final emocionante, todos felizes.', loseText: 'Acusações de gol roubado.' },
    { label: 'Vende a mesa', effects: { money: 1000, mood: -8 }, result: 'Paz e silêncio. Triste.' },
  ] },
  { id: 'iogurte-sumiu', icon: 'question', title: 'Alguém comeu o iogurte de {staff}', when: { phase: 'any', minStaff: 3, needsDecor: 'fridge' }, weight: 1, funny: true, choices: [
    { label: 'Investiga', gamble: { chance: 0.5, win: { mood: 8 }, lose: { mood: -10 } }, winText: 'Culpado confessou com um bolo.', loseText: 'Desconfiança geral no escritório.' },
    { label: 'Iogurte pra todos', effects: { money: -300, mood: 3 }, result: 'Paz restaurada com laticínios.' },
  ] },
  { id: 'pote-misterioso', icon: 'question', title: 'Pote misterioso na geladeira há meses', when: { phase: 'any', needsDecor: 'fridge' }, weight: 1, funny: true, choices: [
    { label: 'Joga fora', effects: { mood: 3 }, result: 'Coragem de herói.' },
    { label: 'Prova', gamble: { chance: 0.3, win: { mood: 10 }, lose: { energy: -15 } }, winText: 'Era pavê. Delícia!', loseText: 'Era um experimento científico.' },
  ] },
  { id: 'feira-pastel', icon: 'pizza', title: 'Feira de rua bem na porta', text: 'Cheiro de pastel invadiu o escritório.', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Pastel pra todos', effects: { money: -400, mood: 10 }, result: 'Pastel de vento, alegria plena.' },
    { label: 'Fecha a janela', effects: { energy: -5 }, result: 'Calor e saudade de pastel.' },
    { label: 'Vira inspiração', effects: { rp: 6, mood: -3 }, result: 'Nasceu uma ideia de pastelaria.' },
  ] },
  { id: 'rifa-bicicleta', icon: 'dice', title: '{staff} está vendendo rifa de bicicleta', when: { phase: 'any', minStaff: 2 }, weight: 1, choices: [
    { label: 'Compra cinco', gamble: { chance: 0.15, win: { money: 3000, mood: 5 }, lose: { money: -300 } }, winText: 'Ganhou! Vendeu a bicicleta.', loseText: 'Quem ganhou foi o vizinho.' },
    { label: 'Compra uma', effects: { money: -100, mood: 4 }, result: 'Ajudou o colega. Carinho garantido.' },
  ] },
  { id: 'internet-caiu', icon: 'wifi', title: 'A internet do escritório caiu', when: { phase: 'any', minYear: 1998 }, weight: 1, choices: [
    { label: 'Liga pro suporte', effects: { energy: -10 }, result: 'Duas horas de musiquinha de espera.' },
    { label: 'Dia offline', gamble: { chance: 0.5, win: { mood: 10, rp: 8 }, lose: { mood: -8 } }, winText: 'Todo mundo leu um livro!', loseText: 'Tédio coletivo, olhares vazios.' },
  ] },
  { id: 'bebe-nasceu', icon: 'heart', title: 'O filho de {staff} nasceu!', when: { phase: 'any', minStaff: 2 }, weight: 0.8, choices: [
    { label: 'Licença estendida', effects: { mood: 15, energy: -5 }, result: 'Fotos do bebê por toda parte.' },
    { label: 'Chá de bebê', effects: { money: -800, mood: 10 }, result: 'Fraldas temáticas de videogame.' },
  ] },
  { id: 'aniversario-founder', icon: 'confetti', title: 'Aniversário de {founder}', when: { phase: 'any' }, weight: 0.8, choices: [
    { label: 'Bolo surpresa', effects: { money: -300, mood: 8 }, result: 'Parabéns cantado desafinado.' },
    { label: 'Rodízio pra todos', effects: { money: -1500, mood: 12, energy: 8 }, result: 'Saíram rolando da churrascaria.' },
  ] },
  { id: 'bolao', icon: 'coin', title: 'Bolão da loteria no escritório', when: { phase: 'any' }, weight: 0.8, choices: [
    { label: 'Entra no bolão', gamble: { chance: 0.05, win: { money: 20000, mood: 20 }, lose: { money: -200 } }, winText: 'GANHAMOS! Ninguém pediu demissão.', loseText: 'Acertamos dois números. Glória.' },
    { label: 'Fica de fora', effects: { mood: -2 }, result: 'Torcendo pra eles perderem.' },
  ] },
  { id: 'ventilador', icon: 'tornado', title: 'Ventilador de teto começou a balançar', when: { phase: 'any' }, weight: 1, funny: true, choices: [
    { label: 'Desliga', effects: { energy: -10 }, result: 'Calor, mas segurança.' },
    { label: 'Confia nele', gamble: { chance: 0.7, win: { mood: 3 }, lose: { money: -1500, mood: -5 } }, winText: 'Balançou, mas aguentou firme.', loseText: 'Voou e levou um monitor.' },
  ] },
  { id: 'wifi-vizinho', icon: 'wifi', title: 'Vizinho descobriu a senha do wi-fi', when: { phase: 'any', minYear: 2005 }, weight: 1, funny: true, choices: [
    { label: 'Troca a senha', effects: { energy: 5, mood: -2 }, result: 'Internet voando. Vizinho triste.' },
    { label: 'Deixa ele', gamble: { chance: 0.5, win: { mood: 6 }, lose: { energy: -10 } }, winText: 'Ele trouxe bolo de agradecimento!', loseText: 'Ele baixa filme o dia todo.' },
  ] },
  { id: 'fofoca-rival', icon: 'newspaper', title: 'Fofoca: {rival} está em crise', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Estuda os erros', effects: { rp: 10, energy: -5 }, result: 'Aprender com o vizinho é barato.' },
    { label: 'Faz piada', gamble: { chance: 0.5, win: { fansPct: 0.03 }, lose: { fansPct: -0.02 } }, winText: 'Fãs riram junto.', loseText: 'Fãs acharam deselegante.' },
  ] },
  { id: 'tia-do-cafe', icon: 'coffee', title: 'A tia do café se aposentou', when: { phase: 'any' }, weight: 0.8, choices: [
    { label: 'Festa de despedida', effects: { money: -800, mood: 8 }, result: 'Choro coletivo e bolo de fubá.' },
    { label: 'Máquina de café', effects: { money: -2000, energy: 8, mood: -5 }, result: 'Café eficiente e sem alma.' },
  ] },
  { id: 'boato-falencia', icon: 'warning', title: 'Boato: {studio} vai falir', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Desmente', effects: { money: -1000, fansPct: 0.02 }, result: 'Coletiva com salgadinho resolveu.' },
    { label: 'Ignora', gamble: { chance: 0.5, win: { fansPct: 0.02 }, lose: { fansPct: -0.04, mood: -5 } }, winText: 'O boato morreu sozinho.', loseText: 'Equipe começou a mandar currículo.' },
  ] },
  { id: 'guru-produtividade', icon: 'clock', title: 'Guru de produtividade quer palestrar', when: { phase: 'any' }, weight: 1, funny: true, choices: [
    { label: 'Ouve o guru', gamble: { chance: 0.4, win: { energy: 15, mood: 5 }, lose: { mood: -10, money: -1500 } }, winText: 'Dicas boas! Até a sesta ajudou.', loseText: 'Cobrou caro pra dizer "acorde cedo".' },
    { label: 'Dispensa', effects: { energy: 2 }, result: 'Ele saiu falando em sinergia.' },
  ] },
  { id: 'elevador-preso', icon: 'building', title: '{staff} ficou preso no elevador', when: { phase: 'any', minStaff: 2, minOffice: 2 }, weight: 1, funny: true, choices: [
    { label: 'Chama bombeiro', effects: { money: -500, mood: 2 }, result: 'Saiu ileso e com história.' },
    { label: 'Passa café', gamble: { chance: 0.5, win: { mood: 6, rp: 8 }, lose: { mood: -8 } }, winText: 'Teve ideia genial lá dentro!', loseText: 'Traumatizado com música de elevador.' },
  ] },
  { id: 'reuniao-condominio', icon: 'users', title: 'Reunião de condomínio com o síndico', when: { phase: 'any' }, weight: 1, funny: true, choices: [
    { label: 'Vai', effects: { energy: -10, money: 800 }, result: 'Conseguiu desconto na taxa.' },
    { label: 'Falta', gamble: { chance: 0.5, win: { energy: 3 }, lose: { money: -1500 } }, winText: 'Ninguém notou a ausência.', loseText: 'Aprovaram taxa extra. Sem você.' },
  ] },
  { id: 'bombeiros', icon: 'helmet', title: 'Fiscalização dos bombeiros chegou', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Arruma tudo', effects: { money: -2000 }, result: 'Extintor novo, alvará em dia.' },
    { label: 'Esconde os fios', gamble: { chance: 0.5, win: { mood: 3 }, lose: { money: -5000 } }, winText: 'Passou. Por um fio.', loseText: 'Multa por gambiarra elétrica.' },
  ] },
  { id: 'onda-de-calor', icon: 'fire', title: 'Onda de calor no escritório', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Ar-condicionado novo', effects: { money: -3000, energy: 15 }, result: 'Paraíso gelado.' },
    { label: 'Picolé pra todos', effects: { money: -300, mood: 6 }, result: 'Alegria rápida, palito no chão.' },
    { label: 'Aguenta firme', effects: { energy: -15 }, result: 'Suor pingando no teclado.' },
  ] },
  { id: 'universidade', icon: 'flask', title: 'Universidade propõe parceria de pesquisa', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Aceita', effects: { rp: 25, energy: -10 }, result: 'Estagiários de jaleco por todo lado.' },
    { label: 'Cobra consultoria', effects: { money: 3000, rp: 5 }, result: 'Os professores pagaram o café.' },
  ] },
  { id: 'mascote-biscoito', icon: 'mask', title: 'Marca de biscoito copiou nosso mascote', when: { phase: 'any', minGames: 2 }, weight: 1, choices: [
    { label: 'Processa', gamble: { chance: 0.6, win: { money: 8000 }, lose: { money: -4000 } }, winText: 'Vitória! O biscoito indenizou.', loseText: 'O juiz preferia o biscoito.' },
    { label: 'Licencia', effects: { money: 4000, fansPct: -0.02 }, result: 'Mascote no pacote, fãs divididos.' },
  ] },
  { id: 'noite-pizza', icon: 'pizza', title: 'Noite da pizza no escritório', when: { phase: 'any' }, weight: 1, choices: [
    { label: 'Pizza boa', effects: { money: -800, mood: 10 }, result: 'Borda recheada, equipe realizada.' },
    { label: 'Pizza da promoção', gamble: { chance: 0.5, win: { mood: 8, money: -200 }, lose: { energy: -10, money: -200 } }, winText: 'Surpreendentemente gostosa!', loseText: 'Indigestão coletiva até amanhã.' },
  ] },
  { id: 'benzedeira', icon: 'wand', title: 'Benzedeira oferece limpeza espiritual', text: 'Promete afastar bug e mau-olhado.', when: { phase: 'any' }, weight: 1, funny: true, choices: [
    { label: 'Aceita', gamble: { chance: 0.5, win: { nextScore: 2, mood: 4 }, lose: { money: -500 } }, winText: 'Funcionou! Ou foi coincidência.', loseText: 'Só ficou cheiro de arruda.' },
    { label: 'Recusa', effects: { mood: -3 }, result: 'Ela saiu resmungando uma reza.' },
  ] },
  { id: 'capivara', icon: 'paw', title: 'Capivara apareceu no estacionamento', when: { phase: 'any' }, weight: 1, funny: true, choices: [
    { label: 'Tira foto', gamble: { chance: 0.7, win: { fansPct: 0.03 }, lose: { mood: -4 } }, winText: 'Foto viral, capivara estrela!', loseText: 'Ela fugiu com seu sanduíche.' },
    { label: 'Deixa em paz', effects: { mood: 3 }, result: 'Capivara zen, equipe zen.' },
  ] },
  { id: 'hacker-patos', icon: 'skull', title: 'Hacker invadiu o site do estúdio', text: 'Trocou tudo por fotos de pato.', when: { phase: 'any', minYear: 2000 }, weight: 1, funny: true, choices: [
    { label: 'Restaura', effects: { money: -1500 }, result: 'Site de volta, sem patos.' },
    { label: 'Deixa os patos', gamble: { chance: 0.5, win: { fansPct: 0.05 }, lose: { fansPct: -0.03 } }, winText: 'Fãs amaram os patos!', loseText: 'Ninguém entendeu nada.' },
  ] },
  { id: 'radio-am', icon: 'phone', title: 'Rádio AM quer entrevista ao vivo', when: { phase: 'any', maxYear: 2005 }, weight: 1, choices: [
    { label: 'Atende', gamble: { chance: 0.6, win: { fansPct: 0.04 }, lose: { mood: -5 } }, winText: 'Ouvintes ligaram elogiando!', loseText: 'Linha cruzou com receita de bolo.' },
    { label: 'Recusa', effects: { energy: 3 }, result: 'Silêncio no rádio. Paz na firma.' },
  ] },
  { id: 'ia-assistente', icon: 'robot', title: 'IA assistente quer ajudar o escritório', when: { phase: 'any', minYear: 2024 }, weight: 1, choices: [
    { label: 'Assina', effects: { money: -2000, rp: 15, mood: -3 }, result: 'Ajuda muito, mas fala demais.' },
    { label: 'Recusa', effects: { mood: 3 }, result: 'Humanos ainda mandam aqui.' },
  ] },
  { id: 'oculos-vr-presente', icon: 'eye', title: 'Chegou um óculos VR de presente', when: { phase: 'any', minYear: 2016 }, weight: 1, choices: [
    { label: 'Todo mundo testa', gamble: { chance: 0.5, win: { rp: 15 }, lose: { energy: -15 } }, winText: 'Inspiração em 360 graus!', loseText: 'Escritório inteiro ficou tonto.' },
    { label: 'Vende', effects: { money: 2000 }, result: 'Vendido pra um entusiasta.' },
  ] },
  { id: 'video-falso-founder', icon: 'mask', title: 'Vídeo falso de {founder} viralizou', text: 'Dançando forró com um robô.', when: { phase: 'any', minYear: 2026 }, weight: 1, funny: true, choices: [
    { label: 'Desmente', effects: { money: -1000 }, result: 'Verdade restaurada, graça perdida.' },
    { label: 'Assume', gamble: { chance: 0.5, win: { fansPct: 0.06 }, lose: { fansPct: -0.03 } }, winText: 'Virou ídolo do forró!', loseText: 'Agora exigem show ao vivo.' },
  ] },
  { id: 'drone-errou', icon: 'rocket', title: 'Drone de entrega errou o andar', when: { phase: 'any', minYear: 2030 }, weight: 1, funny: true, choices: [
    { label: 'Abre o pacote', gamble: { chance: 0.5, win: { money: 2000 }, lose: { mood: -5 } }, winText: 'Era um teclado novinho!', loseText: 'Era uma bigorna decorativa.' },
    { label: 'Devolve', effects: { mood: 3 }, result: 'Vizinho agradeceu com cuscuz.' },
  ] },
  { id: 'robo-faxineiro', icon: 'robot', title: 'Robô faxineiro pede aumento', when: { phase: 'any', minYear: 2035 }, weight: 1, funny: true, choices: [
    { label: 'Dá aumento', effects: { money: -1000, mood: 5 }, result: 'Agora ele limpa cantando.' },
    { label: 'Nega', gamble: { chance: 0.5, win: { money: 500 }, lose: { mood: -8 } }, winText: 'Economia garantida. Bipe triste.', loseText: 'Greve! Lixo até o teto.' },
  ] },
  { id: 'sofa-soneca', icon: 'sofa', title: '{staff} dormiu no sofá do escritório', when: { phase: 'any', needsDecor: 'sofa', minStaff: 2 }, weight: 1, funny: true, choices: [
    { label: 'Deixa dormir', effects: { energy: 12, mood: -3 }, result: 'Acordou às três. Inveja geral.' },
    { label: 'Acorda ele', gamble: { chance: 0.5, win: { mood: 3 }, lose: { mood: -8 } }, winText: 'Acordou de bom humor!', loseText: 'Acordou gritando "tô acordado!".' },
  ] },
  { id: 'neon-piscando', icon: 'bolt', title: 'O letreiro neon pifou e pisca', when: { phase: 'any', needsDecor: 'neon' }, weight: 1, funny: true, choices: [
    { label: 'Conserta', effects: { money: -800 }, result: 'Brilho estável, clima chique.' },
    { label: 'Vira balada', effects: { mood: 10, energy: -10 }, result: 'Balada às três da tarde.' },
  ] },
  { id: 'planta-gigante', icon: 'plant', title: 'A planta do escritório cresceu demais', when: { phase: 'any', needsDecor: 'plant' }, weight: 1, funny: true, choices: [
    { label: 'Dá um nome', effects: { mood: 6, energy: -3 }, result: 'Dona Samambaia agora tem crachá.' },
    { label: 'Vende mudas', effects: { money: 600, mood: -2 }, result: 'Lucro verde, saudade também.' },
  ] },
  { id: 'estante-trofeus', icon: 'trophy', title: 'Visitante derrubou a estante de troféus', when: { phase: 'any', needsDecor: 'trophyshelf', minGames: 1 }, weight: 1, choices: [
    { label: 'Cobra prejuízo', gamble: { chance: 0.5, win: { money: 1500 }, lose: { fansPct: -0.02 } }, winText: 'Pagou e pediu desculpas!', loseText: 'Era fã. Agora é ex-fã.' },
    { label: 'Deixa pra lá', effects: { money: -1000, fansPct: 0.01 }, result: 'Fã comovido, troféu colado.' },
  ] },
  { id: 'puff-estourou', icon: 'confetti', title: 'O puff estourou no escritório', when: { phase: 'any', needsDecor: 'beanbag' }, weight: 1, funny: true, choices: [
    { label: 'Aspirador', effects: { money: -300, energy: -5 }, result: 'Limpo. Quase. Sempre sobra uma.' },
    { label: 'Guerra de bolinha', effects: { mood: 12, energy: -8 }, result: 'Pausa épica, limpeza infinita.' },
  ] },
  { id: 'cafeteira-entidade', icon: 'coffee', title: 'A máquina de café ganhou personalidade', when: { phase: 'any', needsDecor: 'coffee' }, weight: 1, funny: true, choices: [
    { label: 'Conversa com ela', gamble: { chance: 0.5, win: { energy: 15 }, lose: { energy: -10 } }, winText: 'Café divino. Energia sobrenatural.', loseText: 'Agora só sai água morna.' },
    { label: 'Troca a máquina', effects: { money: -1500, energy: 8 }, result: 'A nova não tem alma.' },
  ] },
  { id: 'fliperama-revanche', icon: 'arcade', title: 'Molecada desafia a equipe no fliperama', when: { phase: 'any', maxYear: 1999 }, weight: 1, choices: [
    { label: 'Aceita o desafio', gamble: { chance: 0.4, win: { fansPct: 0.04, mood: 6 }, lose: { mood: -6 } }, winText: 'Recorde batido! Respeito no bairro.', loseText: 'Humilhados por um de nove anos.' },
    { label: 'Paga as fichas', effects: { money: -300, fansPct: 0.02 }, result: 'Tio legal do fliperama.' },
  ] },
  { id: 'pager-apitando', icon: 'phone', title: 'Pager de {founder} apitando sem parar', when: { phase: 'any', minYear: 1990, maxYear: 2001 }, weight: 1, funny: true, choices: [
    { label: 'Desliga', effects: { mood: 4, money: -500 }, result: 'Paz. E um cliente perdido.' },
    { label: 'Liga do orelhão', gamble: { chance: 0.5, win: { money: 2500 }, lose: { energy: -8 } }, winText: 'Era um contrato! Ficha bem gasta.', loseText: 'Era a operadora oferecendo plano.' },
  ] },
  { id: 'gato-de-rua', icon: 'cat', title: 'Gato de rua entrou pela janela', when: { phase: 'any' }, weight: 0.8, funny: true, choices: [
    { label: 'Dá ração', effects: { money: -200, mood: 8 }, result: 'Ele voltou no dia seguinte. Com amigos.' },
    { label: 'Leva pra adoção', effects: { mood: 3, energy: -3 }, result: 'Achou um lar com uma vó.' },
  ] },
];
