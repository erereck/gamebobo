// Ideias dos funcionários: aparecem como "!" sobre a cabeça durante o desenvolvimento.
// {name} = o funcionário que teve a ideia.

export const IDEAS = [
  { id: 'chefao-secreto', icon: 'skull', title: '{name} quer um chefão secreto', genres: ['acao', 'plataforma', 'rpg', 'luta', 'roguelike', 'aventura'], choices: [
    { label: 'Bora!', effects: { pts: { idea: 2, fun: 1 }, weeks: 1 }, result: 'Fãs vão caçar ele por anos.' },
    { label: 'Agora não', effects: { mood: -5 }, result: '{name} guardou a ideia na gaveta.' },
  ] },
  { id: 'trilha-de-pagode', icon: 'drum', title: '{name} quer trilha de pagode', genres: ['esporte', 'party', 'corrida', 'ritmo', 'cozy'], choices: [
    { label: 'Manda ver', effects: { pts: { sound: 3 }, money: -1500 }, result: 'Contagiante. Cavaquinho custou caro.' },
    { label: 'Nem pensar', effects: { mood: -5 }, result: '{name} batucou na mesa, magoado.' },
  ] },
  { id: 'gato-npc', icon: 'cat', title: '{name} quer o gato como NPC', choices: [
    { label: 'Aprovado', effects: { pts: { art: 1, idea: 1 }, hype: 5, bugs: 2 }, result: 'O gato aprovou. Mais ou menos.' },
    { label: 'Corta isso', effects: { mood: -3 }, result: 'O gato também ficou ofendido.' },
  ] },
  { id: 'fase-de-esgoto', icon: 'question', title: '{name} quer uma fase de esgoto', genres: ['plataforma', 'acao', 'aventura', 'tiro'], choices: [
    { label: 'Vai fundo', gamble: { chance: 0.4, win: { pts: { fun: 3 } }, lose: { nextScore: -2 } }, winText: 'Melhor fase de esgoto da história!', loseText: 'É uma fase de esgoto, né.' },
    { label: 'Sem chance', effects: { mood: -2 }, result: 'O mundo agradece em silêncio.' },
  ] },
  { id: 'modo-online', icon: 'wifi', title: '{name} quer modo online', minYear: 1998, genres: ['tiro', 'estrategia', 'mmo', 'moba', 'battle', 'esporte', 'corrida', 'luta'], choices: [
    { label: 'Partiu', effects: { pts: { fun: 3 }, bugs: 8, weeks: 2 }, result: 'Servidor ligado. Rezando muito.' },
    { label: 'Fica pro 2', effects: { mood: -4 }, result: '{name} anotou na lista da sequência.' },
  ] },
  { id: 'dublar-todo-mundo', icon: 'headphones', title: '{name} quer dublar todos os personagens', minYear: 1995, choices: [
    { label: 'Solta a voz', gamble: { chance: 0.5, win: { pts: { sound: 3 }, hype: 8 }, lose: { pts: { sound: 1 }, fansPct: -0.02 } }, winText: 'Virou meme do jeito bom.', loseText: 'Virou meme do jeito ruim.' },
    { label: 'Melhor não', effects: { mood: -5 }, result: '{name} dublou só o próprio choro.' },
  ] },
  { id: 'cutscene-longa', icon: 'tv', title: '{name} quer cutscene de vinte minutos', minYear: 1995, genres: ['rpg', 'aventura', 'acao', 'terror'], choices: [
    { label: 'Ação, câmera!', effects: { pts: { art: 3 }, weeks: 2, money: -2000 }, result: 'Cinema puro. Pulável? Não.' },
    { label: 'Corta pra dois', effects: { mood: -4, pts: { art: 1 } }, result: 'Virou um trailer. Ficou ótimo.' },
  ] },
  { id: 'chefao-sindico', icon: 'building', title: '{name} quer o síndico de chefão', choices: [
    { label: 'Topo', effects: { pts: { idea: 2 }, mood: 10, bugs: 3 }, result: 'Catarse coletiva. O síndico não sabe.' },
    { label: 'Arriscado demais', effects: { mood: -3 }, result: 'O síndico segue invicto.' },
  ] },
  { id: 'fotos-da-equipe', icon: 'smile', title: '{name} quer esconder fotos da equipe', choices: [
    { label: 'Faz aí', effects: { mood: 12, weeks: 1 }, result: 'Todo mundo virou easter egg.' },
    { label: 'Foco, gente', effects: { mood: -6 }, result: 'Nenhuma selfie no código. Triste.' },
  ] },
  { id: 'refazer-em-3d', icon: 'cube', title: '{name} quer refazer tudo em 3D', minYear: 1994, maxYear: 2004, choices: [
    { label: 'Vai fundo', gamble: { chance: 0.5, win: { pts: { art: 5 }, hype: 10 }, lose: { bugs: 12, weeks: 3 } }, winText: 'Polígonos lindos, quase sem bugs.', loseText: 'Agora tudo é uma caixa tremendo.' },
    { label: 'Continua 2D', effects: { mood: -6 }, result: '{name} desenhou um cubo, chorando.' },
  ] },
  { id: 'capivara-mascote', icon: 'paw', title: '{name} quer uma capivara mascote', choices: [
    { label: 'Aprovado', effects: { pts: { art: 2 }, hype: 6, money: -1000 }, result: 'Capivara aprovada pelo povo.' },
    { label: 'Sem bicho', effects: { mood: -3 }, result: 'A capivara seguiu sua vida zen.' },
  ] },
  { id: 'fisica-realista', icon: 'flask', title: '{name} quer física realista', minYear: 2003, choices: [
    { label: 'Pode fazer', effects: { pts: { fun: 2, idea: 2 }, bugs: 10 }, result: 'Tudo quica. Tudo mesmo.' },
    { label: 'Física simples', effects: { mood: -3 }, result: 'Newton ficaria decepcionado.' },
  ] },
  { id: 'receitas-da-vo', icon: 'chefhat', title: '{name} quer receitas da vó no jogo', genres: ['cozy', 'simulacao', 'aventura', 'party'], choices: [
    { label: 'Que delícia', effects: { pts: { idea: 2 }, mood: 5, weeks: 1 }, result: 'Cheiro de bolo no código.' },
    { label: 'Sem receita', effects: { mood: -4 }, result: 'A vó ficou sabendo. Ixi.' },
  ] },
  { id: 'modo-impossivel', icon: 'fire', title: '{name} quer um modo impossível', genres: ['plataforma', 'acao', 'roguelike', 'luta'], choices: [
    { label: 'Sofram!', effects: { pts: { fun: 2 }, hype: 6, bugs: 3 }, result: 'Gamers sofredores agradecem.' },
    { label: 'Pega leve', effects: { mood: -2 }, result: 'O modo normal já é difícil.' },
  ] },
  { id: 'caixinhas-de-premio', icon: 'gift', title: '{name} quer caixinhas de prêmio', minYear: 2012, choices: [
    { label: 'Põe aí', effects: { salesMult: 1.15, nextScore: -3 }, result: 'Dinheiro entra, crítico torce o nariz.' },
    { label: 'Jamais', effects: { mood: -2 }, result: 'O financeiro chorou um pouquinho.' },
  ] },
  { id: 'romance-npcs', icon: 'heart', title: '{name} quer romance entre NPCs', genres: ['rpg', 'aventura', 'simulacao', 'cozy'], choices: [
    { label: 'Que fofo', effects: { pts: { idea: 2, art: 1 }, weeks: 1 }, result: 'Fãs já shippam o casal.' },
    { label: 'Sem namoro', effects: { mood: -4 }, result: 'NPCs seguem solteiros e tristes.' },
  ] },
  { id: 'trilha-8-bits', icon: 'note', title: '{name} quer trilha em 8 bits', minYear: 2008, choices: [
    { label: 'Nostalgia!', effects: { pts: { sound: 2, idea: 1 }, salesMult: 0.95 }, result: 'Nostalgia pura, nicho puro.' },
    { label: 'Som moderno', effects: { mood: -3 }, result: '{name} assoviou em 8 bits, sozinho.' },
  ] },
  { id: 'tutorial-decente', icon: 'book', title: '{name} quer um tutorial decente', choices: [
    { label: 'Justo', effects: { pts: { fun: 2 }, weeks: 1, hype: -3 }, result: 'Enfim alguém entende os controles.' },
    { label: 'Que se virem', effects: { nextScore: -1 }, result: 'Jogadores aprenderam apanhando.' },
  ] },
  { id: 'npc-com-ia', icon: 'robot', title: '{name} quer NPC com IA de verdade', minYear: 2023, choices: [
    { label: 'Liga a IA', gamble: { chance: 0.5, win: { pts: { idea: 4 }, hype: 10 }, lose: { bugs: 10, fansPct: -0.02 } }, winText: 'O NPC virou celebridade!', loseText: 'O NPC respondeu malcriado.' },
    { label: 'NPC clássico', effects: { mood: -4 }, result: 'Ele segue dizendo "bom dia, viajante".' },
  ] },
  { id: 'modo-vr', icon: 'eye', title: '{name} quer modo realidade virtual', minYear: 2016, choices: [
    { label: 'Óculos na cara', effects: { pts: { idea: 3, art: 1 }, bugs: 6, money: -3000 }, result: 'Funciona. Enjoa, mas funciona.' },
    { label: 'Na TV mesmo', effects: { mood: -3 }, result: 'O sofá agradece.' },
  ] },
  { id: 'aparecer-no-jogo', icon: 'mask', title: '{name} quer aparecer no jogo', choices: [
    { label: 'Merece', effects: { mood: 8, pts: { art: 1 }, money: -800 }, result: '{name} virou vendedor de poção.' },
    { label: 'Nada disso', effects: { mood: -8 }, result: '{name} ficou emburrado a tarde toda.' },
  ] },
  { id: 'fase-de-gelo', icon: 'storm', title: '{name} defende uma fase de gelo', genres: ['plataforma', 'aventura', 'corrida', 'acao'], choices: [
    { label: 'Confio', gamble: { chance: 0.35, win: { pts: { fun: 3, idea: 1 } }, lose: { nextScore: -2 } }, winText: 'A primeira fase de gelo amada!', loseText: 'Todo mundo escorregou e odiou.' },
    { label: 'Nunca', effects: { mood: -3 }, result: 'O mundo segue sem gelo. Paz.' },
  ] },
  { id: 'orquestra-de-verdade', icon: 'note', title: '{name} quer orquestra de verdade', minYear: 1995, genres: ['rpg', 'aventura', 'estrategia', 'acao'], choices: [
    { label: 'Contrata', effects: { pts: { sound: 4 }, money: -4000 }, result: 'Violinos chorando. A carteira também.' },
    { label: 'Teclado mesmo', effects: { mood: -4, pts: { sound: 1 } }, result: 'Tecladinho com alma de orquestra.' },
  ] },
  { id: 'narrar-ao-vivo', icon: 'megaphone', title: '{name} quer narrar tudo ao vivo', genres: ['esporte', 'corrida', 'luta', 'party'], choices: [
    { label: 'No microfone', effects: { pts: { sound: 2, fun: 1 }, hype: 4, bugs: 2 }, result: 'GOOOL! Ficou ótimo.' },
    { label: 'Sem narração', effects: { mood: -3 }, result: '{name} narra só pros colegas agora.' },
  ] },
  { id: 'doze-finais', icon: 'book', title: '{name} quer doze finais diferentes', genres: ['rpg', 'aventura', 'terror'], choices: [
    { label: 'Escreve aí', effects: { pts: { idea: 3 }, weeks: 2, bugs: 4 }, result: 'Um dos finais é só o gato.' },
    { label: 'Um basta', effects: { mood: -4 }, result: 'Final único e bem amarrado.' },
  ] },
  { id: 'modo-foto', icon: 'sparkle', title: '{name} quer modo foto', minYear: 2014, choices: [
    { label: 'Xis!', effects: { pts: { art: 2 }, weeks: 1 }, result: 'As redes vão lotar de prints.' },
    { label: 'Desnecessário', effects: { mood: -2 }, result: 'Print screen existe, ué.' },
  ] },
  { id: 'redesenhar-pixels', icon: 'brush', title: '{name} quer redesenhar cada pixel', choices: [
    { label: 'Capricha', effects: { pts: { art: 3 }, energy: -15 }, result: 'Lindo, e {name} não dorme mais.' },
    { label: 'Tá bom assim', effects: { mood: -4 }, result: '{name} suspira olhando um pixel torto.' },
  ] },
  { id: 'chefao-fofinho', icon: 'heart', title: '{name} quer um chefão fofinho', choices: [
    { label: 'Fofura!', gamble: { chance: 0.6, win: { hype: 10, pts: { idea: 2 } }, lose: { pts: { idea: 1 }, mood: -5 } }, winText: 'Ninguém teve coragem de bater nele.', loseText: 'Fofo demais. Ninguém entendeu.' },
    { label: 'Chefão malvado', effects: { mood: -3 }, result: 'Malvado, como manda a tradição.' },
  ] },
  { id: 'homenagem-locadora', icon: 'cartridge', title: '{name} quer homenagear a locadora', choices: [
    { label: 'Que saudade', effects: { pts: { idea: 1 }, fansPct: 0.02, weeks: 1 }, result: 'Tiozões emocionados pelo país.' },
    { label: 'Olha pra frente', effects: { mood: -3 }, result: '{name} rebobinou a fita sozinho.' },
  ] },
  { id: 'lancar-demo', icon: 'gift', title: '{name} quer lançar uma demo', choices: [
    { label: 'Solta a demo', effects: { hype: 12, weeks: 1, money: -1500 }, result: 'Demo viralizou entre a molecada.' },
    { label: 'Segura', effects: { mood: -2 }, result: 'Mistério total até o lançamento.' },
  ] },
  { id: 'coop-no-sofa', icon: 'sofa', title: '{name} quer coop no sofá', genres: ['plataforma', 'acao', 'party', 'puzzle', 'corrida'], choices: [
    { label: 'Chama geral', effects: { pts: { fun: 3 }, bugs: 5, weeks: 1 }, result: 'Amizades testadas com sucesso.' },
    { label: 'Só solo', effects: { mood: -3 }, result: 'O segundo controle segue na gaveta.' },
  ] },
  { id: 'codigos-de-trapaca', icon: 'lock', title: '{name} quer códigos de trapaça', maxYear: 2010, choices: [
    { label: 'Esconde vários', effects: { pts: { fun: 1 }, fansPct: 0.03, bugs: 2 }, result: 'As revistas vão amar publicar.' },
    { label: 'Jogo limpo', effects: { mood: -2 }, result: 'Nada de vida infinita. Sofram.' },
  ] },
  { id: 'saci-chefao', icon: 'tornado', title: '{name} quer o Saci de chefão', choices: [
    { label: 'Brasilidade!', effects: { pts: { idea: 2, art: 1 }, hype: 4, weeks: 1 }, result: 'Saci aprovado, rodopiando no código.' },
    { label: 'Outro chefão', effects: { mood: -3 }, result: 'O Saci escondeu seus fones. Coincidência?' },
  ] },
  { id: 'fase-musical', icon: 'note', title: '{name} quer uma fase musical', choices: [
    { label: 'Solta o som', effects: { pts: { sound: 2, idea: 1 }, weeks: 1, money: -1000 }, result: 'Escritório inteiro dançando.' },
    { label: 'Sem cantoria', effects: { mood: -3 }, result: '{name} cantarolou de raiva.' },
  ] },
  { id: 'refazer-menu', icon: 'pencil', title: '{name} quer refazer o menu inteiro', choices: [
    { label: 'Capricha', effects: { pts: { art: 1, fun: 1 }, weeks: 1, energy: -8 }, result: 'O menu ficou uma joia.' },
    { label: 'Menu serve', effects: { mood: -2 }, result: 'Menu feio, mas funcional.' },
  ] },
  { id: 'sistema-de-crafting', icon: 'hammer', title: '{name} quer sistema de crafting', minYear: 2009, genres: ['sandbox', 'rpg', 'roguelike', 'mmo', 'cozy'], choices: [
    { label: 'Crafta aí', effects: { pts: { fun: 2, idea: 2 }, bugs: 6, weeks: 1 }, result: 'Agora dá pra craftar até cadeira.' },
    { label: 'Sem crafting', effects: { mood: -3 }, result: 'Espada se compra na loja, ué.' },
  ] },
  { id: 'morte-permanente', icon: 'skull', title: '{name} quer morte permanente', genres: ['roguelike', 'rpg', 'terror', 'estrategia'], choices: [
    { label: 'Hardcore!', gamble: { chance: 0.5, win: { pts: { idea: 3 }, hype: 6 }, lose: { salesMult: 0.9 } }, winText: 'Os hardcores entraram em êxtase.', loseText: 'O público casual fugiu correndo.' },
    { label: 'Tem checkpoint', effects: { mood: -2 }, result: 'Morrer volta pro último save.' },
  ] },
  { id: 'carinho-no-cachorro', icon: 'paw', title: '{name} quer carinho no cachorro', choices: [
    { label: 'Óbvio', effects: { hype: 10, pts: { art: 1 }, weeks: 1 }, result: 'A internet aprovou com louvor.' },
    { label: 'Sem tempo', effects: { mood: -4 }, result: 'O cachorro segue esperando. Triste.' },
  ] },
  { id: 'bug-e-feature', icon: 'bug', title: '{name} jura que o bug é feature', choices: [
    { label: 'Acredito', gamble: { chance: 0.5, win: { bugs: -5, pts: { idea: 2 } }, lose: { bugs: 5, nextScore: -1 } }, winText: 'Speedrunners amaram o "recurso".', loseText: 'Era bug. Era bug mesmo.' },
    { label: 'Conserta', effects: { weeks: 1, bugs: -3 }, result: 'Consertado, mas custou uma semana.' },
  ] },
  { id: 'mapa-gigante', icon: 'compass', title: '{name} quer dobrar o tamanho do mapa', genres: ['sandbox', 'rpg', 'aventura', 'mmo', 'estrategia'], choices: [
    { label: 'Dobra!', effects: { pts: { idea: 2, art: 2 }, weeks: 2, bugs: 5 }, result: 'Enorme. E um pouco vazio.' },
    { label: 'Mapa compacto', effects: { mood: -3, pts: { fun: 1 } }, result: 'Pequeno, mas cheio de coisa.' },
  ] },
];
