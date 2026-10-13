// Gerador de títulos de jogos.
// Tokens: {noun}, {adj}, {sub}, {num}, {place}, {hero}.
// Convenção: todos os adjetivos são invariáveis em gênero (Turbo, Mortal, Feliz...),
// pra combinar com qualquer substantivo sem erro de concordância.

export const TITLE_PATTERNS = [
  '{noun} {adj}',
  '{noun} {num}',
  'Super {noun}',
  '{noun}: {sub}',
  '{hero} {num}',
  '{noun} de {place}',
  '{hero}: {sub}',
  '{noun} {adj} {num}',
  'A Lenda de {hero}',
  '{hero} Kart',
  '{hero} Party {num}',
  '{noun} {num}: {sub}',
  'Mega {noun} {adj}',
  '{place} {num}',
  'Operação {noun}',
  '{hero} em {place}',
  'Simulador de {noun}',
  'Projeto {noun}',
  'Ultra {noun}: {sub}',
  '{hero} contra {place}',
];

export const TITLE_NUMS = [
  '2', '3', '4', '64', '2000', '3D', 'Turbo', 'Deluxe', 'HD', 'Remix',
  'Plus', 'Zero', 'X', 'Max', 'Ultra', 'Gold', 'Remake', 'Portátil', 'Online', 'Arcade',
  'Jr.', 'Edição do Ano', 'Versão Pastel', '2077', 'Origens', 'Reloaded',
];

export const TITLE_WORDS = {
  generic: {
    noun: [
      'Lenda', 'Pastel', 'Fliperama', 'Cartucho', 'Pixel', 'Feijoada', 'Saga', 'Reino', 'Missão', 'Destino',
      'Tempestade', 'Chefão', 'Coxinha', 'Furacão', 'Mistério', 'Relíquia', 'Orbe', 'Espada', 'Capivara', 'Busão',
      'Disquete', 'Galáxia', 'Trovão', 'Labirinto', 'Torre', 'Brigadeiro', 'Combo', 'Dimensão', 'Patrulha', 'Cometa',
      'Joystick', 'Caverna', 'Expresso', 'Fantasma', 'Furdunço', 'Bagunça', 'Maratona', 'Gambiarra',
    ],
    adj: [
      'Turbo', 'Radical', 'Mortal', 'Brutal', 'Total', 'Final', 'Fatal', 'Infernal', 'Celestial', 'Feliz',
      'Veloz', 'Feroz', 'Gigante', 'Imortal', 'Selvagem', 'Digital', 'Lunar', 'Solar', 'Estelar', 'Tropical',
      'Nuclear', 'Invencível', 'Impossível', 'Incrível', 'Sensacional', 'Fenomenal', 'Colossal', 'Ilegal', 'Genial', 'Interdimensional',
      'Neon', 'Elemental',
    ],
    sub: [
      'O Retorno', 'A Vingança', 'Origens', 'O Despertar', 'Sem Volta', 'A Revanche', 'Requentado', 'O Filme',
      'Tudo ou Nada', 'Edição Definitiva', 'Agora Vai', 'De Novo Não', 'O Acerto de Contas', 'Herança Maldita',
      'Parte Final (Parte 1)', 'Feito em Casa', 'Remasterizado', 'A Treta', 'Versão do Diretor', 'A Saga Continua',
      'Nas Férias', 'Contra-Ataque', 'Sem Lag', 'Do Além', 'Fora da Lei', 'Na Raça', 'O Chamado', 'Crônicas do Sofá',
    ],
    place: [
      'Marte', 'Pixelândia', 'Vila Bugada', 'Ilha do Pastel', 'Bitópolis', 'Tanquinho do Norte', 'Morro do Joystick',
      'Planeta Coxinha', 'Bairro 8-Bit', 'Vale do Saci', 'Reino Fliper', 'Copacabana 3000', 'Nova Polígono', 'Serra do Lag',
      'Porto Turbo', 'Cratera Azul', 'Floresta Chiclete', 'Rio Byte', 'Ilha Disquete', 'Mundo Cubo', 'Saturno',
      'Atlântida', 'Cidade Baixa', 'Itaquera Lunar', 'Sertão Neon', 'Lagoa do Bug',
    ],
    hero: [
      'Zé Pixel', 'Dona Bete', 'Capitão Coxinha', 'Bobão', 'Tia Neide', 'Super Bigode', 'Menino Turbo', 'Garota Cometa',
      'Ninja do Bairro', 'Saci', 'Vovó Ninja', 'Cachorro Caramelo', 'Mestre Pastel', 'Doutor Bug', 'Professora Laser',
      'Capivara', 'Robô Joia', 'Princesa Paçoca', 'Cavaleiro Chinelo', 'Sargento Pamonha', 'Agente Tapioca', 'Rei Momo',
      'Jacaré Jack', 'Tatu Bola', 'Mulher Pastel', 'Capitã Farofa', 'Dom Biscoito',
    ],
  },

  themes: {
    fantasia: {
      noun: ['Dragão', 'Espada', 'Feitiço', 'Masmorra', 'Orbe', 'Cristal', 'Grimório', 'Reino'],
      adj: ['Ancestral', 'Primordial', 'Sobrenatural', 'Celestial', 'Elemental', 'Imortal'],
      hero: ['Mago Bigode', 'Elfa Bete', 'Bardo Zé', 'Feiticeira Neide', 'Anão Pastel', 'Paladino Chinelo'],
    },
    espaco: {
      noun: ['Galáxia', 'Nave', 'Cometa', 'Asteroide', 'Nebulosa', 'Estação', 'Foguete', 'Planeta'],
      adj: ['Estelar', 'Lunar', 'Solar', 'Sideral', 'Orbital', 'Interestelar'],
      hero: ['Capitão Cometa', 'Astronauta Zé', 'Comandante Lua', 'Alien Bigode', 'Cosmonauta Neide', 'Major Pastel'],
    },
    cyberpunk: {
      noun: ['Chip', 'Implante', 'Rede', 'Hacker', 'Distrito', 'Megacorp', 'Firewall', 'Glitch'],
      adj: ['Neon', 'Digital', 'Virtual', 'Ilegal', 'Viral', 'Neural', 'Modular'],
      hero: ['Hacker Zezé', 'Ciborgue Bete', 'Detetive Glitch', 'Runner Pastel', 'Androide Neide', 'Samurai Wi-Fi'],
    },
    futebol: {
      noun: ['Gol', 'Golaço', 'Pelada', 'Várzea', 'Chuteira', 'Bicicleta', 'Clássico', 'Escanteio'],
      adj: ['Total', 'Brutal', 'Mundial', 'Imortal', 'Fenomenal', 'Infernal', 'Sensacional'],
      hero: ['Zé Canela', 'Craque Bigode', 'Goleiro Paredão', 'Dona Bandeirinha', 'Juiz Apito', 'Artilheiro Feijão', 'Técnico Prancheta'],
    },
    escola: {
      noun: ['Recreio', 'Prova', 'Merenda', 'Mochila', 'Lousa', 'Diretoria', 'Uniforme', 'Bilhete'],
      adj: ['Final', 'Escolar', 'Total', 'Infernal', 'Impossível', 'Bimestral'],
      hero: ['Professora Neide', 'Inspetor Joca', 'Aluno Novo', 'Tia da Cantina', 'Diretor Bigode', 'Monitora Bia'],
    },
    crime: {
      noun: ['Golpe', 'Assalto', 'Máfia', 'Fuga', 'Esquema', 'Cofre', 'Disfarce', 'Delação'],
      adj: ['Ilegal', 'Federal', 'Criminal', 'Mortal', 'Fatal', 'Internacional'],
      hero: ['Detetive Pastel', 'Delegado Bigode', 'Agente Sombra', 'Investigadora Bete', 'Malandro Zeca', 'Inspetor Cachimbo'],
    },
    zumbi: {
      noun: ['Apocalipse', 'Horda', 'Surto', 'Infecção', 'Mordida', 'Cérebro', 'Quarentena', 'Bunker'],
      adj: ['Mortal', 'Zumbi', 'Viral', 'Terminal', 'Podre', 'Final'],
      hero: ['Sobrevivente Zé', 'Dona Marreta', 'Doutora Vacina', 'Zumbi Gente Boa', 'Caçador Rex', 'Tia da Pá'],
    },
    medieval: {
      noun: ['Castelo', 'Cruzada', 'Feudo', 'Torneio', 'Cavaleiro', 'Muralha', 'Trono', 'Catapulta'],
      adj: ['Real', 'Feudal', 'Medieval', 'Imperial', 'Nobre', 'Imortal'],
      hero: ['Rei Bigode', 'Cavaleiro Chinelo', 'Rainha Bete', 'Bobo da Corte', 'Escudeiro Zé', 'Duquesa Paçoca'],
    },
    piratas: {
      noun: ['Tesouro', 'Galeão', 'Caravela', 'Ilha', 'Mapa', 'Canhão', 'Motim', 'Baú'],
      adj: ['Selvagem', 'Naval', 'Tropical', 'Brutal', 'Infernal', 'Fantasma'],
      hero: ['Capitão Barba Rala', 'Pirata Pastel', 'Capitã Maré', 'Papagaio Juca', 'Marujo Zé', 'Almirante Farofa'],
    },
    ninja: {
      noun: ['Shuriken', 'Clã', 'Dojo', 'Sombra', 'Pergaminho', 'Katana', 'Templo', 'Fumaça'],
      adj: ['Invisível', 'Mortal', 'Ninja', 'Veloz', 'Letal', 'Ágil'],
      hero: ['Ninja do Bairro', 'Sensei Bigode', 'Ninja Pastel', 'Mestre Sombra', 'Aprendiz Zé', 'Ninja Capivara'],
    },
    culinaria: {
      noun: ['Panela', 'Feijoada', 'Pastel', 'Brigadeiro', 'Coxinha', 'Churrasco', 'Marmita', 'Tempero'],
      adj: ['Gourmet', 'Picante', 'Infernal', 'Feliz', 'Original', 'Especial'],
      hero: ['Chef Bigode', 'Dona Panela', 'Vovó Tempero', 'Cozinheiro Zé', 'Mestre Pastel', 'Confeiteira Bia'],
    },
    musica: {
      noun: ['Batida', 'Pandeiro', 'Solo', 'Show', 'Turnê', 'Banda', 'Refrão', 'Microfone'],
      adj: ['Musical', 'Total', 'Sensacional', 'Fenomenal', 'Radical', 'Pop'],
      hero: ['DJ Bigode', 'MC Pastel', 'Roqueira Bete', 'Maestro Zé', 'Sambista Turbo', 'Cantora Lua'],
    },
    fazenda: {
      noun: ['Colheita', 'Galinheiro', 'Trator', 'Espantalho', 'Plantação', 'Curral', 'Milharal', 'Horta'],
      adj: ['Rural', 'Feliz', 'Caipira', 'Agrícola', 'Natural', 'Selvagem'],
      hero: ['Seu Zé da Roça', 'Fazendeira Bete', 'Vaca Mimosa', 'Galo Carijó', 'Espantalho Joca', 'Bode Valente'],
    },
    velhooeste: {
      noun: ['Duelo', 'Saloon', 'Xerife', 'Diligência', 'Cânion', 'Rodeio', 'Faroeste', 'Ouro'],
      adj: ['Selvagem', 'Ilegal', 'Brutal', 'Mortal', 'Infernal', 'Implacável'],
      hero: ['Xerife Bigode', 'Pistoleira Bete', 'Caubói Pastel', 'Cavalo Trovão', 'Forasteiro Juca', 'Delegada Poeira'],
    },
    militar: {
      noun: ['Batalhão', 'Trincheira', 'Comando', 'Esquadrão', 'Operação', 'Missão', 'Tanque', 'Quartel'],
      adj: ['Militar', 'Total', 'Final', 'Brutal', 'Global', 'Letal'],
      hero: ['Sargento Pamonha', 'Cabo Zé', 'Capitã Granada', 'Recruta Bigode', 'Coronel Pastel', 'Soldado Raso'],
    },
    herois: {
      noun: ['Capa', 'Poder', 'Liga', 'Vilão', 'Uniforme', 'Esconderijo', 'Máscara', 'Raio'],
      adj: ['Invencível', 'Incrível', 'Imparável', 'Fenomenal', 'Sensacional', 'Colossal'],
      hero: ['Capitão Coxinha', 'Mulher Pastel', 'Homem Tatu', 'Super Bigode', 'Garota Cometa', 'Doutor Raio'],
    },
    romance: {
      noun: ['Coração', 'Paixão', 'Crush', 'Encontro', 'Carta', 'Casamento', 'Namoro', 'Serenata'],
      adj: ['Fatal', 'Impossível', 'Feliz', 'Ideal', 'Sensacional', 'Especial'],
      hero: ['Crush do Bairro', 'Dona Paixão', 'Galã Bigode', 'Cupido Zé', 'Princesa Paçoca', 'Poeta Juca'],
    },
    animais: {
      noun: ['Capivara', 'Tatu', 'Jacaré', 'Papagaio', 'Tucano', 'Bicho', 'Toca', 'Floresta'],
      adj: ['Selvagem', 'Feroz', 'Animal', 'Natural', 'Veloz', 'Feliz'],
      hero: ['Capivara Zen', 'Tatu Bola', 'Jacaré Jack', 'Cachorro Caramelo', 'Gata Mimi', 'Tucano Turbo'],
    },
    dinossauros: {
      noun: ['Rex', 'Fóssil', 'Meteoro', 'Ovo', 'Raptor', 'Pegada', 'Vulcão', 'Tricerátops'],
      adj: ['Colossal', 'Gigante', 'Feroz', 'Primordial', 'Selvagem', 'Brutal'],
      hero: ['Dino Bigode', 'Rex Gente Boa', 'Paleontóloga Bete', 'Raptor Zé', 'Dona Fóssil', 'Tricerazinho'],
    },
    folclore: {
      noun: ['Saci', 'Curupira', 'Boitatá', 'Mula', 'Lenda', 'Redemoinho', 'Mata', 'Encanto'],
      adj: ['Sobrenatural', 'Ancestral', 'Selvagem', 'Infernal', 'Imortal', 'Tropical'],
      hero: ['Saci Turbo', 'Curupira Jr.', 'Boitatá', 'Mula sem Cabeça', 'Vovó Benzedeira', 'Caipora'],
    },
    carnaval: {
      noun: ['Bloco', 'Folia', 'Samba', 'Fantasia', 'Confete', 'Trio', 'Desfile', 'Marchinha'],
      adj: ['Tropical', 'Total', 'Feliz', 'Sensacional', 'Colossal', 'Fenomenal'],
      hero: ['Rei Momo', 'Passista Bete', 'Mestre-Sala Zé', 'Porta-Bandeira Lu', 'Pierrô Bigode', 'Colombina Paçoca'],
    },
    novela: {
      noun: ['Vilã', 'Herança', 'Gêmea', 'Casamento', 'Segredo', 'Capítulo', 'Mansão', 'Reviravolta'],
      adj: ['Final', 'Fatal', 'Impossível', 'Total', 'Imortal', 'Sensacional'],
      hero: ['Vilã Rebeca', 'Galã Bigode', 'Mocinha Bete', 'Mordomo Zé', 'Gêmea Má', 'Matriarca Neide'],
    },
    internet: {
      noun: ['Meme', 'Viral', 'Thread', 'Like', 'Cancelamento', 'Live', 'Grupo', 'Algoritmo'],
      adj: ['Viral', 'Digital', 'Virtual', 'Online', 'Global', 'Total'],
      hero: ['Influencer Bia', 'Hater Zé', 'Moderador Juca', 'Tia do Zap', 'Streamer Turbo', 'Meme Vivo'],
    },
    mitologia: {
      noun: ['Olimpo', 'Titã', 'Oráculo', 'Relâmpago', 'Labirinto', 'Hidra', 'Panteão', 'Néctar'],
      adj: ['Imortal', 'Celestial', 'Colossal', 'Primordial', 'Infernal', 'Ancestral'],
      hero: ['Zeuzinho', 'Herculano', 'Medusa Gente Boa', 'Deusa Bete', 'Minotauro Zé', 'Titã Bigode'],
    },
    robos: {
      noun: ['Robô', 'Engrenagem', 'Androide', 'Mecha', 'Parafuso', 'Circuito', 'Fábrica', 'Bateria'],
      adj: ['Total', 'Digital', 'Nuclear', 'Turbo', 'Modular', 'Colossal'],
      hero: ['Robô Joia', 'Androide Neide', 'Mecha Bigode', 'Ciborgue Zé', 'Tia Bateria', 'Robozinho Pastel'],
    },
  },

  genres: {
    acao: { noun: ['Combate', 'Pancadaria', 'Explosão', 'Fúria', 'Ataque', 'Resgate'], adj: ['Brutal', 'Total', 'Radical', 'Mortal', 'Veloz', 'Imparável'] },
    plataforma: { noun: ['Pulo', 'Moeda', 'Cano', 'Plataforma', 'Cogumelo', 'Fase'], adj: ['Saltitante', 'Feliz', 'Turbo', 'Gigante', 'Radical', 'Pulante'] },
    aventura: { noun: ['Jornada', 'Expedição', 'Tesouro', 'Mapa', 'Mistério', 'Ruína'], adj: ['Incrível', 'Selvagem', 'Impossível', 'Sensacional', 'Inesquecível', 'Colossal'] },
    rpg: { noun: ['Saga', 'Crônica', 'Masmorra', 'Destino', 'Profecia', 'Nível'], adj: ['Final', 'Ancestral', 'Primordial', 'Imortal', 'Elemental', 'Celestial'] },
    estrategia: { noun: ['Império', 'Conquista', 'Guerra', 'Civilização', 'Tática', 'Domínio'], adj: ['Total', 'Global', 'Imperial', 'Colossal', 'Mundial', 'Real'] },
    simulacao: { noun: ['Simulador', 'Rotina', 'Vida', 'Cidade', 'Escritório', 'Fila'], adj: ['Real', 'Realista', 'Virtual', 'Total', 'Normal', 'Banal'] },
    puzzle: { noun: ['Enigma', 'Quebra-Cabeça', 'Cubo', 'Charada', 'Peça', 'Labirinto'], adj: ['Impossível', 'Genial', 'Cerebral', 'Mental', 'Simples', 'Difícil'] },
    corrida: { noun: ['Kart', 'Turbo', 'Pista', 'Rali', 'Largada', 'Nitro'], adj: ['Veloz', 'Turbo', 'Radical', 'Ilegal', 'Total', 'Feroz'] },
    esporte: { noun: ['Campeonato', 'Torneio', 'Copa', 'Olimpíada', 'Final', 'Liga'], adj: ['Mundial', 'Radical', 'Total', 'Profissional', 'Imbatível', 'Federal'] },
    luta: { noun: ['Combo', 'Golpe', 'Torneio', 'Ringue', 'Nocaute', 'Briga'], adj: ['Mortal', 'Brutal', 'Final', 'Fatal', 'Feroz', 'Imbatível'] },
    terror: { noun: ['Pesadelo', 'Maldição', 'Assombração', 'Mansão', 'Grito', 'Sombra'], adj: ['Infernal', 'Mortal', 'Terrível', 'Sobrenatural', 'Fatal', 'Invisível'] },
    ritmo: { noun: ['Batida', 'Dança', 'Groove', 'Passinho', 'Pista', 'Compasso'], adj: ['Musical', 'Dançante', 'Radical', 'Total', 'Sensacional', 'Contagiante'] },
    tiro: { noun: ['Mira', 'Rajada', 'Trincheira', 'Alvo', 'Combate', 'Pipoco'], adj: ['Letal', 'Total', 'Brutal', 'Mortal', 'Global', 'Infernal'] },
    mmo: { noun: ['Servidor', 'Guilda', 'Raide', 'Mundo', 'Clã', 'Reino'], adj: ['Online', 'Global', 'Colossal', 'Imortal', 'Virtual', 'Mundial'] },
    sandbox: { noun: ['Bloco', 'Cubo', 'Mundo', 'Construção', 'Mina', 'Ilha'], adj: ['Livre', 'Total', 'Colossal', 'Gigante', 'Original', 'Sem Fim'] },
    roguelike: { noun: ['Masmorra', 'Morte', 'Tentativa', 'Ciclo', 'Run', 'Calabouço'], adj: ['Fatal', 'Mortal', 'Impossível', 'Brutal', 'Imortal', 'Implacável'] },
    moba: { noun: ['Lane', 'Torre', 'Arena', 'Rota', 'Campeão', 'Nexo'], adj: ['Ranqueável', 'Total', 'Global', 'Mortal', 'Imortal', 'Feroz'] },
    battle: { noun: ['Royale', 'Ilha', 'Queda', 'Zona', 'Tempestade', 'Arena'], adj: ['Final', 'Total', 'Brutal', 'Gigante', 'Global', 'Mortal'] },
    party: { noun: ['Festa', 'Tabuleiro', 'Minigame', 'Bagunça', 'Gincana', 'Churrasco'], adj: ['Feliz', 'Total', 'Radical', 'Sensacional', 'Familiar', 'Legal'] },
    cozy: { noun: ['Chazinho', 'Jardim', 'Cobertor', 'Vila', 'Cafeteria', 'Soneca'], adj: ['Feliz', 'Suave', 'Gentil', 'Doce', 'Leve', 'Aconchegante'] },
  },
};
