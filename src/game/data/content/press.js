// Coletiva de imprensa: três perguntas rápidas depois de alguns lançamentos.
// Pergunta com até 12 palavras, resposta com até 6, reação com até 9.
// Placeholders: {game}, {genre}, {theme}, {score}, {studio}.
//
// Respostas: [tom, resposta, reação, efeitos?]
// Polêmica: ['polemico', resposta, reação se colar, reação se pegar mal, aposta?]
// Sem efeitos próprios, a resposta usa o padrão do tom na faixa de nota (PRESS_BANDS).
// Efeitos extras da coletiva: nextHype (hype do próximo projeto) e copiesPct (cópias do jogo lançado).

// Meio da entrevista conforme a época.
export const PRESS_MEDIUMS = [
  { id: 'revista', minYear: 1980, maxYear: 1994, label: 'Entrevista exclusiva', icon: 'book', hosts: ['Revista Cartucho Quente', 'Gibi dos Games', 'Joystick & Cia', 'Boletim do Fliperama', 'Revista Pause'] },
  { id: 'tv', minYear: 1995, maxYear: 2004, label: 'Ao vivo na TV', icon: 'tv', hosts: ['Tarde Gamer', 'Sabadão do Joystick', 'Jornal do Controle', 'TV Bobo Games', 'Clube do Cartucho'] },
  { id: 'portal', minYear: 2005, maxYear: 2012, label: 'Entrevista no portal', icon: 'globe', hosts: ['Portal Pixelado', 'Save Point Online', 'Blog do Respawn', 'Zona do Combo', 'Portal Fase Bônus'] },
  { id: 'stream', minYear: 2013, maxYear: 9999, label: 'Podcast ao vivo', icon: 'headphones', hosts: ['Podcast Caixa de Areia', 'Live do Tio Bit', 'Pod do Lag', 'Canal Primeiro Comentário', 'Café com Controle'] },
]

export const pressMediumFor = year => PRESS_MEDIUMS.find(item => year >= item.minYear && year <= item.maxYear) ?? PRESS_MEDIUMS.at(-1)
export const pressMediumById = id => PRESS_MEDIUMS.find(item => item.id === id) ?? PRESS_MEDIUMS[0]

export const PRESS_TONES = {
  humilde: { label: 'humilde', icon: 'smile', color: '#52d977' },
  confiante: { label: 'confiante', icon: 'star', color: '#ffd23f' },
  polemico: { label: 'polêmico', icon: 'fire', color: '#ff5d3a' },
}

// top >= 8,5 · good 7 a 8,4 · meh 4,6 a 6,9 · flop <= 4,5
export const pressBand = score => (score >= 8.5 ? 'top' : score >= 7 ? 'good' : score > 4.5 ? 'meh' : 'flop')

// Efeito padrão de cada tom. Humildade acalma a equipe; confiança vende o próximo; polêmica é aposta.
export const PRESS_BANDS = {
  top: {
    humilde: { mood: 6, fansPct: 0.01 },
    confiante: { nextHype: 8, fansPct: 0.02, copiesPct: 0.03 },
    polemico: { chance: 0.6, win: { fansPct: 0.04, nextHype: 10 }, lose: { fansPct: -0.02, mood: -4 } },
  },
  good: {
    humilde: { mood: 5, fansPct: 0.01 },
    confiante: { nextHype: 6, fansPct: 0.015, copiesPct: 0.02 },
    polemico: { chance: 0.55, win: { fansPct: 0.035, nextHype: 9 }, lose: { fansPct: -0.025, mood: -4 } },
  },
  meh: {
    humilde: { mood: 4, fansPct: 0.01 },
    confiante: { nextHype: 5, fansPct: 0.005 },
    polemico: { chance: 0.45, win: { fansPct: 0.03, nextHype: 8 }, lose: { fansPct: -0.03, mood: -5 } },
  },
  flop: {
    humilde: { mood: 5, fansPct: 0.02 },
    confiante: { nextHype: 3, fansPct: -0.02 },
    polemico: { chance: 0.35, win: { fansPct: 0.03, nextHype: 8 }, lose: { fansPct: -0.035, mood: -6 } },
  },
}

const toAnswer = ([tone, label, a, b, extra]) => (tone === 'polemico'
  ? { tone, label, win: a, lose: b, gamble: extra ?? null }
  : { tone, label, reaction: a, fx: b ?? null })

const Q = (id, when, q, answers) => ({ id, when, q, answers: answers.map(toAnswer) })

export const PRESS_QUESTIONS = [
  // ---------- abertura: nota altíssima ----------
  Q('top-sabiam', { band: ['top'] }, 'Nota altíssima! Vocês já sabiam que {game} era tão bom?', [
    ['humilde', 'Foi tudo mérito da equipe', 'A equipe ganhou o dia. E um bolo.'],
    ['confiante', 'Sabíamos desde o primeiro protótipo', 'A plateia aplaudiu. Alguém assobiou no fundo.'],
    ['polemico', 'Os rivais é que são fracos', 'A frase virou camiseta oficial.', 'Três estúdios rivais pararam de te seguir.'],
  ]),
  Q('top-segredo', { band: ['top'] }, 'Qual é o segredo de um jogo nota {score}?', [
    ['humilde', 'Café, sorte e muito teste', 'O fornecedor de café mandou um agradecimento.'],
    ['confiante', 'Talento. Simples assim', 'O entrevistador anotou "talento" e sublinhou duas vezes.'],
    ['polemico', 'Copiamos o melhor dos outros', 'Todo mundo riu. Acharam que era piada.', 'Advogados de três empresas ligaram no mesmo dia.'],
  ]),
  Q('top-recado', { band: ['top'] }, 'A concorrência está tremendo. Algum recado para eles?', [
    ['humilde', 'Aprendemos muito com eles', 'Os rivais mandaram flores. Com cartão educado.'],
    ['confiante', 'Podem esperar o próximo', 'A expectativa pelo próximo jogo já começou.', { nextHype: 10, fansPct: 0.015 }],
    ['polemico', 'Recado? Eles nem existem', 'Os fãs transformaram a frase em grito de torcida.', 'Os fãs dos rivais lotaram sua caixa de cartas.'],
  ]),
  Q('top-discurso', { band: ['top'] }, 'Já está ensaiando o discurso do Jogo do Ano?', [
    ['humilde', 'Nem pensamos nisso ainda', 'Ninguém acreditou, mas pegou bem.'],
    ['confiante', 'Já está decorado, palavra por palavra', 'Você recitou um trecho. Teve choro na plateia.'],
    ['polemico', 'O troféu já é nosso', 'A torcida comprou a briga. Hype nas alturas.', 'Os jurados leram a entrevista. Pegou mal.'],
  ]),

  // ---------- abertura: nota boa ----------
  Q('good-justa', { band: ['good'] }, 'A crítica gostou de {game}. A nota foi justa?', [
    ['humilde', 'Justíssima. Dá pra melhorar', 'A equipe já anotou os pontos fracos.', { mood: 3, rp: 5 }],
    ['confiante', 'Merecia um pontinho a mais', 'Os fãs concordaram em peso.'],
    ['polemico', 'Crítico não sabe jogar', 'Virou meme. Do jeito bom.', 'Os críticos responderam. Todos juntos.'],
  ]),
  Q('good-amaram', { band: ['good', 'top'] }, 'O público abraçou o jogo. O que os fãs mais amaram?', [
    ['humilde', 'Os detalhes que a equipe fez', 'Cada pessoa da equipe ganhou um fã-clube.'],
    ['confiante', 'Tudo. Não tem ponto fraco', 'Os fãs mais fiéis assinaram embaixo.'],
    ['polemico', 'Ninguém zerou ainda, ninguém sabe', 'A caçada ao final secreto começou.', 'Zeraram em duas horas e reclamaram.'],
  ]),
  Q('good-proximo', { band: ['good'] }, 'Bom jogo! E agora, o que vem por aí?', [
    ['humilde', 'Primeiro, umas férias merecidas', 'A equipe comemorou em silêncio. Por dentro.', { mood: 6, energy: 10 }],
    ['confiante', 'Algo ainda maior, aguardem', 'Ninguém sabe o que é. Todo mundo quer.', { nextHype: 9 }],
    ['polemico', 'Um MMO de fazendinha. Talvez', 'O público explodiu de teorias.', 'Ninguém entendeu se era piada.'],
  ]),
  Q('good-esperava', { band: ['good'] }, 'Esperava esse sucesso todo de {game}?', [
    ['humilde', 'Nem nos melhores sonhos', 'A sinceridade conquistou a audiência.'],
    ['confiante', 'Esperava mais, pra ser honesto', 'A frase saiu em destaque. Sem contexto.'],
    ['polemico', 'Sucesso? Isso é o mínimo', 'Arrogante, mas os fãs adoraram.', 'Pegou mal até com a sua mãe.'],
  ]),

  // ---------- abertura: nota morna ----------
  Q('meh-faltou', { band: ['meh'] }, 'A recepção foi morna. O que faltou em {game}?', [
    ['humilde', 'Tempo. Faltou tempo', 'Todo dev do país concordou com a cabeça.'],
    ['confiante', 'Nada. O público vai entender', 'Talvez entenda. Em uns dez anos.'],
    ['polemico', 'Faltou crítico com bom gosto', 'A frase rodou o país. Muita gente concordou.', 'A crítica não esqueceu. Nunca esquece.'],
  ]),
  Q('meh-media', { band: ['meh'] }, 'Nota na média. Isso preocupa o estúdio?', [
    ['humilde', 'Preocupa. Vamos melhorar', 'Os fãs gostaram da honestidade.', { mood: 2, fansPct: 0.01, rp: 5 }],
    ['confiante', 'Média é o novo ótimo', 'Ninguém entendeu, mas soou bonito.'],
    ['polemico', 'Nota é coisa do passado', 'Virou debate em todo canto.', 'Os críticos guardaram o recorte. Pra sempre.'],
  ]),
  Q('meh-mudar', { band: ['meh'] }, 'Se pudesse mudar uma coisa em {game}, o que seria?', [
    ['humilde', 'O prazo, com certeza', 'A equipe suspirou junto. Alívio coletivo.'],
    ['confiante', 'Nada. Saiu do jeito certo', 'Firme. O apresentador perdeu a próxima pergunta.'],
    ['polemico', 'A capa. A capa é horrível', 'Os fãs fizeram capas novas. Viralizou.', 'O artista da capa estava assistindo.', { win: { fansPct: 0.03, nextHype: 6 }, lose: { mood: -8 } }],
  ]),
  Q('meh-chance', { band: ['meh'] }, 'Vale a pena dar uma segunda chance a {game}?', [
    ['humilde', 'Se tiver um tempinho, vale', 'A modéstia rendeu umas vendas extras.', { mood: 3, copiesPct: 0.02 }],
    ['confiante', 'Vale a primeira e a segunda', 'Gente voltou a jogar só por curiosidade.', { nextHype: 4, copiesPct: 0.03 }],
    ['polemico', 'Quem não gostou, jogou errado', 'Os fãs criaram um guia de "jogar certo".', 'Quem não gostou agora gosta menos.'],
  ]),

  // ---------- abertura: desastre ----------
  Q('flop-como', { band: ['flop'] }, 'A crítica detonou {game}. Como o estúdio está?', [
    ['humilde', 'Triste, mas de pé', 'Chegaram cartas de apoio. Uma tinha bolo.'],
    ['confiante', 'Melhor que nunca, sério', 'Ninguém acreditou. Nem o cinegrafista.'],
    ['polemico', 'A crítica está comprada', 'Os fãs abraçaram a teoria da conspiração.', 'A crítica pediu provas. Você não tinha.'],
  ]),
  Q('flop-onde', { band: ['flop'] }, 'Onde foi que {game} deu errado?', [
    ['humilde', 'Em várias decisões minhas', 'Assumir o erro pegou muito bem.', { mood: 6, fansPct: 0.025 }],
    ['confiante', 'Não deu. Foi incompreendido', 'Um crítico riu no ar. Alto.'],
    ['polemico', 'Culpa do estagiário', 'O estagiário virou celebridade e defendeu o jogo.', 'O estagiário pediu demissão ao vivo.', { lose: { mood: -8, fansPct: -0.02 } }],
  ]),
  Q('flop-desculpa', { band: ['flop'] }, 'Os jogadores pedem desculpas. Vai pedir?', [
    ['humilde', 'Peço. Desculpa, gente', 'Desculpa aceita. Alguns até mandaram abraço.'],
    ['confiante', 'Desculpa por ser genial', 'Virou meme. Do tipo que dói.'],
    ['polemico', 'Eles que me devem desculpas', 'Os fãs mais duros riram e perdoaram.', 'As reclamações dobraram na mesma semana.'],
  ]),
  Q('flop-futuro', { band: ['flop', 'meh'] }, 'Depois disso, o estúdio ainda tem futuro?', [
    ['humilde', 'Tem, se a gente aprender', 'A equipe se olhou e respirou fundo.', { mood: 6, rp: 6 }],
    ['confiante', 'O próximo vai ser épico', 'A promessa foi anotada. Por todo mundo.', { nextHype: 8, fansPct: -0.01 }],
    ['polemico', 'Futuro? Eu vivo o agora', 'A frase virou pôster de quarto adolescente.', 'Os investidores leram. Ficaram pálidos.'],
  ]),

  // ---------- séries, remakes e spin-offs ----------
  Q('seq-folego', { flags: ['sequel'] }, 'Mais uma sequência. A série ainda tem fôlego?', [
    ['humilde', 'Enquanto os fãs quiserem', 'Os fãs veteranos se sentiram ouvidos.'],
    ['confiante', 'Tem fôlego pra mais dez', 'A série ganhou um novo gás.', { nextHype: 9 }],
    ['polemico', 'O próximo mata todo mundo', 'Teorias sobre o final dominaram a semana.', 'Os fãs da série ficaram de luto antecipado.'],
  ]),
  Q('seq-supera', { flags: ['sequel'], band: ['top', 'good'] }, 'A sequência supera o original?', [
    ['humilde', 'O original é insuperável', 'Os nostálgicos aplaudiram de pé.'],
    ['confiante', 'Supera fácil. Sem comparação', 'O debate tomou conta das rodas de conversa.'],
    ['polemico', 'O original nem era bom', 'Ousado. Os fãs novos amaram.', 'Os fãs antigos não perdoaram.'],
  ]),
  Q('seq-caiu', { flags: ['sequel'], band: ['meh', 'flop'] }, 'A série caiu de qualidade. O que houve?', [
    ['humilde', 'Perdemos o rumo. Vamos voltar', 'Os fãs da série deram mais uma chance.'],
    ['confiante', 'A série está evoluindo', 'Evoluindo para onde, perguntou o apresentador.'],
    ['polemico', 'Os fãs é que envelheceram', 'Os fãs riram de si mesmos. Raro.', 'Os fãs da série criaram um abaixo-assinado.'],
  ]),
  Q('remake-mexer', { type: ['remake'] }, 'Por que mexer num clássico como esse?', [
    ['humilde', 'Pra apresentar a uma geração nova', 'Pais e filhos jogaram juntos. Que fofo.'],
    ['confiante', 'Porque agora ficou perfeito', 'Os puristas engoliram em seco.'],
    ['polemico', 'O original envelheceu mal', 'Até os puristas admitiram, baixinho.', 'Os puristas fundaram um clube só pra reclamar.'],
  ]),
  Q('spin-pediu', { type: ['spinoff'] }, 'Um spin-off! Quem pediu esse jogo?', [
    ['humilde', 'Os fãs pediram muito', 'Os fãs se sentiram parte do jogo.'],
    ['confiante', 'Ninguém. Por isso é genial', 'A ousadia ganhou manchetes.'],
    ['polemico', 'Meu sobrinho pediu', 'O sobrinho ganhou fã-clube próprio.', 'O sobrinho deu entrevista falando mal.'],
  ]),

  // ---------- bastidores ----------
  Q('crunch-noites', { flags: ['crunch'] }, 'Dizem que a equipe virou noites. É verdade?', [
    ['humilde', 'É. E não vai se repetir', 'A equipe ouviu e ficou aliviada.', { mood: 8, energy: 10 }],
    ['confiante', 'Paixão não tem horário', 'A equipe assistiu. Com olheiras.', { nextHype: 5, mood: -4 }],
    ['polemico', 'Dormir é para os fracos', 'Virou slogan... de energético.', 'A equipe dormiu na mesa. Literalmente.', { lose: { mood: -8, energy: -10 } }],
  ]),
  Q('crunch-pizza', { flags: ['crunch'] }, 'Quantas pizzas foram consumidas para terminar {game}?', [
    ['humilde', 'Perdi a conta, desculpa', 'A pizzaria mandou uma de presente.', { mood: 5 }],
    ['confiante', 'Trezentas e doze. Contamos', 'A pizzaria quer patrocinar o próximo.', { money: 1500, nextHype: 3 }],
    ['polemico', 'A pizza que fez o jogo', 'A pizzaria lançou o sabor {game}.', 'A pizzaria cobrou a conta atrasada.', { win: { fansPct: 0.03, money: 1000 }, lose: { money: -1500 } }],
  ]),
  Q('bugs-correcao', { flags: ['bugs'] }, 'Jogadores acharam muitos bugs. Vem correção aí?', [
    ['humilde', 'Vem. Estamos virando noites', 'A comunidade ofereceu ajuda pra achar mais.', { mood: -2, fansPct: 0.02, rp: 4 }],
    ['confiante', 'Que bugs? Funciona aqui', 'Um jogador mostrou um ao vivo.', { fansPct: -0.01, nextHype: 4 }],
    ['polemico', 'Bug é conteúdo extra', 'Speedrunners adoraram. Viraram fãs.', 'Os bugs agora têm um fã-clube irônico.'],
  ]),
  Q('bugs-voando', { flags: ['bugs'] }, 'O bug do personagem voando virou piada. Foi de propósito?', [
    ['humilde', 'Não foi. Mas é engraçado', 'Sinceridade e piada: combinação poderosa.'],
    ['confiante', 'Claro. Era uma homenagem', 'Ninguém acreditou, mas todo mundo riu.'],
    ['polemico', 'Vou cobrar por ele', 'A versão "voadora" virou lenda.', 'A ideia de cobrar pegou mal.'],
  ]),
  Q('hype-entregaram', { flags: ['letdown'] }, 'Vocês prometeram muito. Entregaram?', [
    ['humilde', 'Prometemos demais. Lição aprendida', 'Os fãs gostaram da franqueza.', { mood: 3, fansPct: 0.02 }],
    ['confiante', 'Entregamos tudo e mais um pouco', 'Os fãs discordaram. Com gráficos.', { fansPct: -0.015, nextHype: 4 }],
    ['polemico', 'Promessa é marketing', 'Os fãs riram da sinceridade brutal.', 'A frase virou recorte eterno.'],
  ]),
  Q('viral-sensacao', { flags: ['viral'] }, 'O jogo explodiu do nada. Qual a sensação?', [
    ['humilde', 'Gratidão. Muita gratidão', 'A palavra gratidão nunca soou tão sincera.'],
    ['confiante', 'Planejado desde o começo', 'Ninguém acredita, mas soa ótimo.', { nextHype: 8, copiesPct: 0.03 }],
    ['polemico', 'Eu sou um gênio incompreendido', 'O gênio ganhou fãs devotos.', 'O gênio ganhou piadas. Muitas.'],
  ]),
  Q('first-comecou', { flags: ['first'] }, 'É o primeiro jogo do estúdio. Como começou tudo?', [
    ['humilde', 'Num quarto, com um computador', 'Muita gente se identificou. Choveu carinho.', { fansPct: 0.03, mood: 3 }],
    ['confiante', 'Com um plano de dominação', 'O plano foi anotado. Com receio.'],
    ['polemico', 'Com um empréstimo da vovó', 'A vovó virou a estrela da entrevista.', 'A vovó ligou cobrando. Ao vivo.'],
  ]),
  Q('solo-sozinho', { flags: ['solo'] }, 'Você fez tudo sozinho? Como deu conta?', [
    ['humilde', 'Mal. Dormi pouco', 'Outros devs solitários se sentiram vistos.', { fansPct: 0.02, energy: 10 }],
    ['confiante', 'Equipe atrapalha, sabe', 'Futuros contratados assistiram. Pensativos.'],
    ['polemico', 'O gato ajudou no código', 'O gato ganhou fã-clube e crachá.', 'O gato derrubou café no teclado.'],
  ]),
  Q('big-custou', { flags: ['big'] }, 'Um jogo gigante. Quanto custou tudo isso?', [
    ['humilde', 'Mais do que deveria', 'O contador assistiu e suspirou.'],
    ['confiante', 'Cada centavo está na tela', 'Os gráficos falaram por você.'],
    ['polemico', 'Um rim. Talvez dois', 'A piada pegou. Todo mundo repetiu.', 'O banco ligou depois da entrevista.'],
  ]),
  Q('pub-mandou', { flags: ['publisher'] }, 'A editora mandou muito no jogo?', [
    ['humilde', 'Ajudou mais do que mandou', 'A editora mandou cesta de presente.', { money: 1000, mood: 3 }],
    ['confiante', 'Ninguém manda no meu jogo', 'A editora ligou. Duas vezes.', { nextHype: 6, mood: 2 }],
    ['polemico', 'Cortaram a melhor fase', 'Os fãs exigem a fase de volta.', 'A editora cortou o café do escritório.'],
  ]),
  Q('hybrid-loucura', { flags: ['hybrid'] }, 'Misturar {genre} com outro gênero foi loucura?', [
    ['humilde', 'Um pouco. Testamos muito', 'Outros estúdios já estão anotando.', { rp: 6, mood: 3 }],
    ['confiante', 'Loucura é não misturar', 'A mistura virou assunto do ano.'],
    ['polemico', 'Gênero puro é coisa de vovô', 'A molecada adotou o lema.', 'Os vovôs do gênero ficaram bravos.'],
  ]),
  Q('multi-versoes', { flags: ['multi'] }, 'Lançar em várias plataformas não dividiu a atenção?', [
    ['humilde', 'Dividiu. Alguma versão sofreu', 'Os jogadores agradeceram a sinceridade.'],
    ['confiante', 'Todas ficaram perfeitas', 'Os fãs de cada console brigaram mesmo assim.'],
    ['polemico', 'Uma versão é melhor. Adivinhem', 'A guerra dos consoles ganhou mais um capítulo.', 'Todas as torcidas ficaram ofendidas.'],
  ]),
  Q('trend-onda', { flags: ['trend'] }, '{genre} está na moda. Vocês só seguiram a onda?', [
    ['humilde', 'Seguimos, mas com carinho', 'Ninguém reclamou de carinho.'],
    ['confiante', 'A gente criou a onda', 'Os historiadores dos games discordam.'],
    ['polemico', 'Moda é pra quem não cria', 'A frase virou lema de indie.', 'Contradição apontada em três segundos.'],
  ]),
  Q('demo-ajudou', { flags: ['demo'] }, 'A demo ajudou ou atrapalhou o lançamento?', [
    ['humilde', 'Ajudou. Ouvimos todo mundo', 'Quem jogou a demo se sentiu coautor.'],
    ['confiante', 'A demo vendeu o jogo', 'Outros estúdios correram pra fazer demo.'],
    ['polemico', 'A demo era melhor, confesso', 'A demo virou item de colecionador.', 'Os fãs pediram a demo de volta.'],
  ]),
  Q('combo-veio', { flags: ['combo'] }, 'Ninguém tinha feito {genre} com {theme}. De onde veio?', [
    ['humilde', 'De uma conversa no café', 'A máquina de café virou mascote.', { mood: 4, rp: 4 }],
    ['confiante', 'Da minha cabeça brilhante', 'A cabeça brilhante foi parar na capa.'],
    ['polemico', 'De um sonho febril', 'Todo mundo quer ter esse sonho.', 'Recomendaram um médico. Ao vivo.'],
  ]),

  // ---------- por gênero e tema ----------
  Q('terror-medo', { genre: ['terror'] }, 'O jogo dá medo de verdade? Alguém se assustou?', [
    ['humilde', 'Eu mesmo dormi de luz acesa', 'A confissão rendeu ótimas piadas.'],
    ['confiante', 'Testamos em cardiologistas', 'Os cardiologistas não confirmaram.'],
    ['polemico', 'Proibido para medrosos e críticos', 'Virou desafio entre amigos.', 'Os críticos disseram que nem tremeram.'],
  ]),
  Q('esporte-nomes', { genre: ['esporte'] }, 'Por que os jogadores têm nomes tão parecidos com os reais?', [
    ['humilde', 'Licença é cara, gente', 'Todo mundo entendeu. Até os advogados.'],
    ['confiante', 'Coincidência total', 'Os fãs criaram uma lista de "coincidências".'],
    ['polemico', 'Os nossos jogam melhor', 'A torcida comprou a ideia.', 'Recebemos uma carta bem formal.'],
  ]),
  Q('rpg-horas', { genre: ['rpg', 'aventura'] }, 'Quantas horas leva para zerar {game}?', [
    ['humilde', 'Umas quarenta, sem pressa', 'Os jogadores agradeceram o tempo bem gasto.'],
    ['confiante', 'Cento e vinte. No mínimo', 'Os completistas aplaudiram de pé.'],
    ['polemico', 'Ninguém zerou. Nem nós', 'Virou desafio: quem zera primeiro?', 'O pessoal acha que o final não existe.'],
  ]),
  Q('luta-golpe', { genre: ['luta'] }, 'Tem algum golpe secreto que ninguém achou ainda?', [
    ['humilde', 'Talvez. Procurem bem', 'Os fliperamas ficaram lotados de curiosos.'],
    ['confiante', 'Tem, e é devastador', 'A caça ao golpe começou na mesma noite.'],
    ['polemico', 'O golpe secreto é desligar', 'Virou piada interna da comunidade.', 'Muita gente tentou. Perdeu o save.'],
  ]),
  Q('puzzle-travados', { genre: ['puzzle'] }, 'Tem fase impossível em {game}? Os jogadores estão travados.', [
    ['humilde', 'Vamos lançar umas dicas', 'A linha de dicas não parou de tocar.'],
    ['confiante', 'É só pensar um pouquinho', 'Muita gente pensou. Pouca gente passou.'],
    ['polemico', 'Nem eu passo da fase 12', 'A fase 12 virou lenda urbana.', 'O pessoal se sentiu enganado.'],
  ]),
  Q('plataforma-mascote', { genre: ['plataforma'] }, 'O personagem principal vai virar mascote do estúdio?', [
    ['humilde', 'Se o público quiser', 'O público quis. Já tem pelúcia.'],
    ['confiante', 'Já tem até fantasia', 'A fantasia apareceu numa festa infantil.'],
    ['polemico', 'Vai ser maior que o encanador', 'Os fãs já comparam os dois.', 'O encanador nem respondeu. Doeu mais.'],
  ]),
  Q('corrida-carros', { genre: ['corrida'] }, 'Quantos carros tem em {game}? Dá pra tunar?', [
    ['humilde', 'Poucos, mas bem feitos', 'Cada carro ganhou fã-clube próprio.'],
    ['confiante', 'Todos. E dá pra tunar', 'As oficinas de verdade ficaram com ciúme.'],
    ['polemico', 'Tem o fusca do meu pai', 'O fusca virou o carro mais usado.', 'O pai quer royalties.'],
  ]),
  Q('tiro-violento', { genre: ['tiro', 'acao'] }, 'O jogo é violento demais para as crianças?', [
    ['humilde', 'Tem classificação. Respeitem', 'Os pais agradeceram a resposta direta.'],
    ['confiante', 'É tudo de mentirinha', 'Um deputado anotou seu nome.'],
    ['polemico', 'As crianças jogam melhor', 'As crianças concordaram em massa.', 'A associação de pais pediu explicações.'],
  ]),
  Q('estrategia-dica', { genre: ['estrategia', 'simulacao'] }, 'Qual a melhor estratégia para vencer em {game}?', [
    ['humilde', 'Ainda estamos descobrindo', 'A comunidade fez guias de cem páginas.'],
    ['confiante', 'Construir torres. Muitas torres', 'O jeito de jogar mudou em uma noite.'],
    ['polemico', 'Ler o manual. Ninguém lê', 'O manual virou campeão de vendas.', 'Pediram um manual pro manual.'],
  ]),
  Q('futebol-time', { theme: ['futebol'] }, 'O jogo tem o seu time do coração?', [
    ['humilde', 'Tem todos, sem favorito', 'Diplomacia digna de técnico de seleção.'],
    ['confiante', 'E ele ganha sempre', 'Metade do país amou. A outra, não.'],
    ['polemico', 'Meu time é o mais forte', 'A sua torcida comprou dez cópias cada.', 'As outras torcidas organizaram um boicote.'],
  ]),
  Q('fofo-sucesso', { genre: ['cozy', 'party'], theme: ['fazenda', 'animais', 'culinaria'] }, 'Um jogo fofo assim pode fazer sucesso?', [
    ['humilde', 'Fofura também é coisa séria', 'Muita gente se sentiu abraçada.'],
    ['confiante', 'Fofura vende mais que tiro', 'Os estúdios de tiro anotaram.'],
    ['polemico', 'Por trás tem uma conspiração', 'A teoria dos fãs ficou enorme.', 'Os pais acharam a entrevista pesada.'],
  ]),
  Q('online-servidor', { genre: ['mmo', 'moba', 'battle'] }, 'Os servidores aguentaram o lançamento?', [
    ['humilde', 'Caíram três vezes. Perdão', 'Os jogadores perdoaram. Quase todos.'],
    ['confiante', 'Aguentaram firmes', 'O servidor caiu durante a entrevista.', { fansPct: -0.005, nextHype: 5 }],
    ['polemico', 'Fila também é diversão', 'A fila virou ponto de encontro.', 'A fila virou protesto organizado.'],
  ]),
  Q('trilha-quem', { genre: ['ritmo'], theme: ['musica', 'carnaval'] }, 'Quem compôs a trilha de {game}?', [
    ['humilde', 'Uma pessoa incrível da equipe', 'A trilha foi parar nas rádios.', { mood: 6, fansPct: 0.01 }],
    ['confiante', 'A trilha é a estrela', 'O disco da trilha esgotou.', { money: 2000, nextHype: 3 }],
    ['polemico', 'Eu, assobiando no chuveiro', 'O assobio grudou na cabeça do país.', 'Ninguém consegue tirar da cabeça. Reclamam.'],
  ]),
  Q('folclore-saci', { theme: ['folclore'] }, 'Por que colocar o folclore brasileiro num jogo?', [
    ['humilde', 'Porque a gente cresceu com isso', 'Professores usaram o jogo em sala.'],
    ['confiante', 'O Saci merece um jogo', 'O Saci ganhou fãs pelo mundo.'],
    ['polemico', 'O Saci é o maior herói', 'O Saci virou fantasia de festa.', 'O Curupira se sentiu esquecido.'],
  ]),

  // ---------- do jeito da época ----------
  Q('revista-truques', { medium: ['revista'] }, 'Vai liberar umas dicas para a nossa seção de truques?', [
    ['humilde', 'Mandamos uma por carta', 'A seção de dicas bateu recorde de cartas.'],
    ['confiante', 'Só pros assinantes', 'As bancas venderam tudo naquela semana.', { copiesPct: 0.03, nextHype: 3 }],
    ['polemico', 'Aperte todos os botões juntos', 'Funcionou! Ninguém sabe por quê.', 'Muitos controles quebraram naquele mês.'],
  ]),
  Q('revista-poster', { medium: ['revista'] }, 'A revista vai brindar um pôster de {game}. Gostou?', [
    ['humilde', 'Que honra, obrigado', 'O pôster foi parar em mil quartos.', { fansPct: 0.02 }],
    ['confiante', 'Merecia ser a capa', 'A capa do próximo mês é sua.'],
    ['polemico', 'O pôster está torto', 'Pôster torto virou item raro.', 'O editor ficou magoado.'],
  ]),
  Q('tv-alo', { medium: ['tv'] }, 'Pode mandar um alô para a plateia aqui do auditório?', [
    ['humilde', 'Um beijo pra minha mãe', 'A mãe ligou para o programa chorando.'],
    ['confiante', 'Comprem {game}, é ordem', 'O auditório gritou o nome do jogo.', { copiesPct: 0.03, nextHype: 4 }],
    ['polemico', 'Quem não comprou, levanta', 'Ninguém levantou. Sucesso total.', 'Metade levantou. Silêncio constrangedor.'],
  ]),
  Q('tv-dancinha', { medium: ['tv'] }, 'O apresentador pede: tem alguma dancinha do jogo?', [
    ['humilde', 'Não sei dançar, desculpa', 'A falta de jeito conquistou o auditório.'],
    ['confiante', 'Tem, e eu vou mostrar', 'A dancinha passou no domingo seguinte.'],
    ['polemico', 'Só danço com contrato assinado', 'O programa assinou. Dancinha garantida.', 'O apresentador te mandou embora rindo.'],
  ]),
  Q('portal-comentarios', { medium: ['portal'] }, 'Os comentários do portal estão pegando fogo. Vai responder?', [
    ['humilde', 'Leio todos, com carinho', 'Os comentários ficaram mais gentis.'],
    ['confiante', 'Não leio comentários', 'Os comentários sobre isso explodiram.'],
    ['polemico', 'Respondo todos em caixa alta', 'Virou o tópico mais lido do ano.', 'O moderador teve que fechar o tópico.'],
  ]),
  Q('extra-pago', { medium: ['portal', 'stream'] }, 'Vai ter conteúdo extra pago em {game}?', [
    ['humilde', 'Só se valer a pena', 'Os jogadores confiaram na palavra.'],
    ['confiante', 'Sim, e vai ser enorme', 'A pré-venda da expansão encheu.', { money: 2500, nextHype: 4 }],
    ['polemico', 'O final verdadeiro custa extra', 'Curiosos compraram. Muitos.', 'Os fãs decretaram guerra ao estúdio.'],
  ]),
  Q('stream-segredo', { medium: ['stream'] }, 'O chat quer saber: tem segredo escondido no jogo?', [
    ['humilde', 'Tem um. Boa sorte', 'O chat virou uma força-tarefa.'],
    ['confiante', 'Tem duzentos. Achem', 'Acharam três. Seguem procurando.'],
    ['polemico', 'O jogo inteiro é segredo', 'O chat pirou. Clipe mais visto.', 'O chat mandou um "ok" coletivo.'],
  ]),
  Q('stream-caixinha', { medium: ['stream'] }, 'Vai ter passe de batalha e caixinha surpresa?', [
    ['humilde', 'Não. Jogo completo e pronto', 'O chat encheu a tela de corações.', { fansPct: 0.025 }],
    ['confiante', 'Só cosméticos, prometo', 'Promessa anotada. O chat nunca esquece.'],
    ['polemico', 'A caixinha tem outra caixinha', 'Virou piada e venda ao mesmo tempo.', 'O chat inteiro digitou "não" junto.'],
  ]),
  Q('stream-aovivo', { medium: ['stream'] }, 'Topa jogar {game} ao vivo agora com a gente?', [
    ['humilde', 'Topo, mas sou ruim', 'Você morreu na primeira fase. O chat amou.'],
    ['confiante', 'Topo e zero ao vivo', 'Zerou mesmo. O clipe correu o mundo.'],
    ['polemico', 'Só se o chat pagar', 'O chat pagou. Live histórica.', 'O chat foi embora. Ficaram doze.'],
  ]),
  Q('ia-ajudou', { minYear: 2023 }, 'Uma IA ajudou a fazer {game}?', [
    ['humilde', 'Só pra corrigir a vírgula', 'A resposta acalmou os artistas.'],
    ['confiante', 'Não. Gente de verdade', 'A equipe ganhou aplausos do chat.', { mood: 5, nextHype: 4 }],
    ['polemico', 'Eu sou a IA', 'O mistério virou lenda da internet.', 'Pediram prova de que você é humano.'],
  ]),

  // ---------- coringas ----------
  Q('any-preco', {}, 'O preço de {game} está justo?', [
    ['humilde', 'Está no limite do justo', 'Ninguém reclamou. Um milagre.'],
    ['confiante', 'Está barato demais', 'O pessoal correu pras lojas antes do aumento.', { copiesPct: 0.03, fansPct: -0.005 }],
    ['polemico', 'Devia custar o dobro', 'Pegou como prova de qualidade.', 'Fizeram as contas. Não gostaram.'],
  ]),
  Q('any-inspiracao', {}, 'De onde veio a inspiração para {game}?', [
    ['humilde', 'Das brincadeiras de infância', 'Muita gente lembrou da própria infância.'],
    ['confiante', 'De mim mesmo, claro', 'O ego ganhou uma página inteira.'],
    ['polemico', 'De um sonho com patos', 'Os patos viraram o símbolo do jogo.', 'Ninguém mais olha patos do mesmo jeito.'],
  ]),
  Q('any-equipe', {}, 'Quem é a pessoa mais importante da equipe?', [
    ['humilde', 'Todo mundo, igualmente', 'A equipe se sentiu muito valorizada.', { mood: 7 }],
    ['confiante', 'Eu, obviamente', 'A equipe assistiu em silêncio.', { nextHype: 5, mood: -3 }],
    ['polemico', 'O gato do escritório', 'O gato ganhou mais fãs que o jogo.', 'O gato não quis dar entrevista.'],
  ]),
  Q('any-familia', {}, 'Sua família já jogou {game}?', [
    ['humilde', 'Minha avó zerou primeiro', 'A avó virou a gamer mais famosa do bairro.'],
    ['confiante', 'Obrigatório no almoço de domingo', 'Famílias inteiras adotaram a tradição.'],
    ['polemico', 'Proibi. É viciante demais', 'Todo mundo quis o jogo proibido.', 'A família não gostou de ser exposta.'],
  ]),
  Q('any-studio', {}, 'O {studio} já é o maior estúdio do país?', [
    ['humilde', 'Longe disso. Somos pequenos', 'A modéstia rendeu simpatia.'],
    ['confiante', 'Do país e arredores', 'O mapa do estúdio ganhou mais um país.', { nextHype: 6, fansPct: 0.01 }],
    ['polemico', 'Os outros nem são estúdios', 'A turma do estúdio vibrou.', 'Os outros estúdios se uniram contra você.'],
  ]),
]

export const pressQuestionById = id => PRESS_QUESTIONS.find(item => item.id === id) ?? null

// Manchete do dia seguinte, conforme o tom que dominou a coletiva (até 7 palavras).
export const PRESS_HEADLINES = {
  humilde: ['Humildade rouba a cena na entrevista', 'Estúdio divide os aplausos com a equipe', 'Pés no chão, coração na mão', 'Entrevista gentil conquista o público'],
  confiante: ['Estúdio promete ainda mais e anima fãs', 'Confiança em alta no estúdio', 'Ninguém segura esse estúdio, diz o estúdio', 'Estúdio garante: o próximo vai ser maior'],
  polemicoWin: ['Entrevista polêmica vira febre', 'Frase do estúdio vira grito de guerra', 'Polêmica? Os fãs pediram mais'],
  polemicoLose: ['Entrevista desastrosa vira assunto da semana', 'Estúdio tropeça nas próprias palavras', 'Assessoria pede calma depois da entrevista'],
  misto: ['Um pouco de tudo na entrevista', 'Estúdio fala de tudo um pouco', 'Entrevista morna, mas com bons momentos'],
}
