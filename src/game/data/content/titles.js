// Gerador de títulos de jogos, em inglês, para dividir a prateleira com Doom e Minecraft.
// Tokens: {noun} {adj} {sub} {num} {place} {hero}, mais três do motor:
//   {ed}   selo que só cabe no fim ("Turbo", "Deluxe", "Online")
//   {yy}   temporada de jogo de esporte ("98", "2004"); sem ano conhecido vira {num}
//   {coin} palavra inventada de indie: stem + tail ("Ember" + "fall")
// {sub} pode trazer tokens dentro ("The Lost {noun}"); o motor resolve em mais de uma passada.
// Adjetivo em inglês não flexiona: qualquer adj combina com qualquer noun.
// Lugar nunca termina em número (o motor tira o número do fim para achar o nome da série).
// Humor: mais ou menos um título em seis leva tempero brasileiro ("Feijoada Fury", "Samba Racer").

// Estilo de cada época. Sabendo o ano, o motor puxa mais da época certa.
export const TITLE_ERA_PATTERNS = {
  // fliperama dos anos 80: curto, gritado, com Super e Turbo
  arcade: [
    'Super {noun}',
    'Super {adj} {noun}',
    '{noun} Blaster',
    '{adj} {noun}',
    '{noun} Attack',
    '{noun} Patrol',
    'Mega {noun} {num}',
    '{noun} Force {num}',
    '{hero}',
    'Turbo {noun}',
    '{noun} Zone',
    '{noun} Commander',
    'Hyper {noun} {ed}',
    '{noun} Raiders',
    '{hero} in {place}',
    '{noun} Fighter',
    '{adj} {noun} {num}',
  ],
  // cartucho e CD dos anos 90: sagas, numeral romano e subtítulo com dois pontos
  cartucho: [
    '{noun} Quest {num}',
    '{noun} Crest {num}: {sub}',
    "{hero}'s Adventure",
    "{hero}'s {adj} Adventure",
    '{noun} {num}: {sub}',
    'The Legend of {place}',
    '{place} Chronicles',
    '{noun} Saga {num}',
    '{adj} {noun}: {sub}',
    '{hero}: {sub}',
    '{place} Story',
    '{noun} Warriors',
    'Battle {noun} {num}',
    '{noun} Knights',
    '{hero} 64',
    '{adj} {noun} {ed}',
  ],
  // DVD dos anos 2000: protocolos, operações e subtítulo sério
  disco: [
    '{noun} Protocol',
    '{noun} Protocol: {sub}',
    '{adj} {noun}: {sub}',
    '{noun}: {sub}',
    'Project {noun}',
    'Operation {noun}',
    '{noun} of {place}',
    '{hero}: {sub}',
    '{noun} Unit {num}',
    '{noun} Origins',
    '{place}: {sub}',
    '{noun} Rising',
    '{noun} Syndrome',
    '{adj} {noun} {num}',
  ],
  // indie de 2010 pra cá: uma palavra só, artigo, frase curta
  indie: [
    '{coin}',
    '{coin}',
    '{coin}',
    '{coin}',
    'The {adj} {noun}',
    '{adj} {noun}',
    'Beyond {place}',
    'Escape from {place}',
    '{coin}: {sub}',
    '{noun} Tales',
    'Goodbye, {place}',
    '{hero} Must Die',
    'Last Train to {place}',
    '{adj} {noun} Club',
    'Night in {place}',
    'Return of the {noun}',
  ],
}

// Padrões que só fazem sentido em alguns gêneros (kart em corrida, tycoon em simulação...).
export const TITLE_GENRE_PATTERNS = {
  acao: ['{noun} Force {num}', '{noun} Squad', 'Double {noun}', '{noun} Fury', '{hero}: {sub}'],
  plataforma: ['Super {hero}', '{hero} Land', "{hero}'s Island", '{hero} Jump {num}', '{noun} Jump'],
  aventura: ['The Secret of {place}', '{hero} and the {adj} {noun}', 'Lost in {place}', '{noun} Hunters'],
  rpg: ['{noun} Crest {num}: {sub}', 'Chronicles of {place}', '{adj} {noun} Saga', '{noun} Saga {num}'],
  estrategia: ['{place} Empires', '{noun} Tactics', 'Lords of {place}', '{noun} Command {num}'],
  simulacao: ['{noun} Simulator', '{noun} Tycoon', '{adj} {noun} Manager', '{noun} Life {num}'],
  puzzle: ['{noun} Drop', '{noun} Pop {num}', 'Dr. {noun}', '{adj} {noun} Puzzle'],
  corrida: ['{hero} Kart', '{noun} Rally {yy}', '{place} Racing', '{noun} Racer', '{adj} {noun} GT'],
  esporte: ['Pro {noun} {yy}', '{noun} Champions {yy}', 'All-Star {noun}', 'Total {noun} {yy}', '{place} League'],
  luta: ['{noun} Fighters {num}', '{adj} {noun} Tournament', 'King of {place}', '{noun} Brawl {num}'],
  terror: ['{place} Asylum', 'The {noun} of {place}', 'Night at {place}', '{noun} House', "Don't Open the {noun}"],
  tiro: ['{noun} Ops {num}', 'Operation {noun}', '{noun} Squad', '{adj} {noun}: {sub}'],
  ritmo: ['{hero} Beats', '{noun} Fever', '{adj} {noun} Party', '{noun} Revolution'],
  mmo: ['{adj} {noun} Online', '{place} Online', 'Realms of {place}', '{noun} Online'],
  party: ['{hero} Party {num}', '{noun} Party', '{hero} Fiesta', '{noun} Game Night'],
  sandbox: ['{noun} Builder', '{place} Builders', '{noun} World', '{coin}'],
  moba: ['Heroes of {place}', '{adj} {noun} Arena', '{noun} Legends', 'Clash of {place}'],
  roguelike: ['{coin}', '{noun} Hero', 'Crypt of the {noun}', '{noun} Run', 'The Depths of {place}'],
  cozy: ['{coin}', '{noun} Valley', 'A {adj} {noun}', '{noun} Days', '{place} Cottage'],
  battle: ['{noun} Royale', '{noun} Royale {num}', 'Hot Drop {num}', '{place}: Last Stand'],
}

// Todos os padrões de época numa lista só.
export const TITLE_PATTERNS = Object.values(TITLE_ERA_PATTERNS).flat()

// {num}: cabe no meio ("Dragon Crest II: The Lost Sigil") e no fim ("Mega Comet 64").
export const TITLE_NUMS = ['2', '3', 'II', 'III', 'IV', '64', '2000', '3D', 'X', 'Zero', 'DX', 'EX', 'HD', 'Alpha']

// {ed}: só no fim ("Hyper Burger Turbo", "Neon Viper Deluxe").
export const TITLE_EDITIONS = [
  'Turbo', 'Deluxe', 'Remix', 'Plus', 'Gold', 'Ultra', 'Max', 'Legends', 'Forever', 'Unleashed',
  'Extreme', 'Evolution', 'Arcade', 'Online', 'Origins', 'Rising', 'Supreme', 'Prime',
]

// Continuação sem número: "Pixel Patrol Returns". O nome da série tira essas palavras de volta.
export const TITLE_SEQUEL_WORDS = [
  'Returns', 'Reloaded', 'Strikes Back', 'Again', 'Reborn', 'Evolved', 'Redux', 'Resurrection', 'Forever', 'Unleashed',
]

// Spin-off leva o nome da série e um sufixo do gênero novo: "Dragon Crest Kart", "Emberfall Café".
export const TITLE_SPINOFFS = {
  any: ['Legends', 'Origins', 'Heroes', 'Stories', 'Adventures', 'Jr.'],
  acao: ['Rebels', 'Strike', 'Unleashed'],
  plataforma: ['Land', 'Jump', 'World'],
  aventura: ['Adventures', 'Expedition', 'Explorers'],
  rpg: ['Chronicles', 'Saga', 'Tactics'],
  estrategia: ['Tactics', 'Command', 'Empires'],
  simulacao: ['Tycoon', 'Simulator', 'Life'],
  puzzle: ['Puzzle', 'Pop', 'Drop'],
  corrida: ['Kart', 'Racing', 'Rally'],
  esporte: ['Sports', 'Tennis', 'Golf', 'Soccer'],
  luta: ['Fighters', 'Brawl', 'Arena'],
  terror: ['Nightmares', 'After Dark'],
  tiro: ['Ops', 'Squad', 'Strike Force'],
  ritmo: ['Beats', 'Rhythm', 'Dance'],
  mmo: ['Online', 'World'],
  party: ['Party', 'Fiesta'],
  sandbox: ['Builders', 'World'],
  moba: ['Arena', 'Heroes'],
  roguelike: ['Dungeon', 'Depths', 'Run'],
  cozy: ['Village', 'Café', 'Garden'],
  battle: ['Royale', 'Showdown'],
}

export const TITLE_WORDS = {
  generic: {
    noun: [
      'Dragon', 'Shadow', 'Thunder', 'Blade', 'Pixel', 'Comet', 'Laser', 'Rocket', 'Crystal', 'Phantom',
      'Titan', 'Storm', 'Vortex', 'Nova', 'Viper', 'Falcon', 'Cobra', 'Tiger', 'Wolf', 'Raven',
      'Echo', 'Ember', 'Rune', 'Atom', 'Galaxy', 'Orbit', 'Saber', 'Hammer', 'Fist', 'Spirit',
      'Omega', 'Volt', 'Blaze', 'Fury', 'Venom', 'Spark', 'Joystick', 'Highscore', 'Lantern', 'Crown',
      'Arrow', 'Meteor', 'Cyclone', 'Glacier', 'Circuit', 'Mirage',
      // tempero
      'Capybara', 'Feijoada', 'Coxinha', 'Brigadeiro', 'Flip-Flop', 'Pastel', 'Samba', 'Açaí', 'Gambiarra',
    ],
    adj: [
      'Turbo', 'Hyper', 'Ultra', 'Neon', 'Cosmic', 'Galactic', 'Atomic', 'Radical', 'Savage', 'Mighty',
      'Dark', 'Iron', 'Crimson', 'Eternal', 'Lost', 'Broken', 'Hollow', 'Golden', 'Wild', 'Burning',
      'Frozen', 'Shattered', 'Infinite', 'Rogue', 'Raging', 'Electric', 'Blazing', 'Primal', 'Fallen', 'Forgotten',
      'Sacred', 'Lucky', 'Tiny', 'Wicked', 'Total', 'Brutal', 'Digital', 'Retro', 'Stellar', 'Quantum',
      'Midnight', 'Scarlet', 'Silver', 'Lunar', 'Solar', 'Pocket',
      // tempero
      'Tropical', 'Spicy', 'Sleepy', 'Caffeinated', 'Unpaid', 'Sweaty',
    ],
    sub: [
      'The Lost {noun}', 'Return to {place}', 'Rise of the {noun}', 'Shadow of {place}', 'Echoes of {place}',
      'Ashes of {place}', 'The {adj} Sigil', 'Legends', 'Reloaded', 'Origins',
      'Revenge', 'The Return', 'Dark Tides', 'Zero Hour', "Director's Cut",
      'The Reckoning', 'Fallen Empire', 'Into the Void', 'Blood Moon', 'Second Strike',
      'Overdrive', 'Unleashed', 'The Shattered Crown', 'The Long Night', 'Total Mayhem',
      'Final Hour', 'Last Stand', 'Night Shift', 'Endless Summer', 'Heart of {place}',
      'Battle for {place}', 'Gold Edition', 'Dawn of the {noun}', "{hero}'s Revenge", 'Siege of {place}',
      'Uprising', 'Aftermath', 'Retribution', 'Ascension', 'Exodus',
      'Requiem', 'The {noun} Wars', 'Wrath of the {noun}', 'Beyond the Stars', 'The Iron Pact',
      // tempero
      'Electric Boogaloo', 'Now With Feijoada', 'Weekend Edition', 'Too Much Coffee', 'The Crunch',
      'Again?!', 'Turbo Deluxe Edition', 'Lunch Break', 'The Musical',
    ],
    place: [
      'Neo Rio', 'New Polygon', 'Port Turbo', 'Blue Crater', 'Bitropolis', 'Pixel Bay', 'Ironvale', 'Duskmoor', 'Eldermoor', 'Crystal Bay',
      'Skyreach', 'Starhaven', 'Byte City', 'Kepler Station', 'Velvet Island', 'Cobalt Coast', 'Thunder Ridge', 'Ember Isles', 'Avalon', 'El Dorado',
      'Babylon', 'Pangea', 'Hollow Peaks', 'Gloomwater', 'Sunspire', 'Frostholm', 'Cinder Bay', 'Neon Harbor', 'Glass City', 'Rust Valley',
      'Aurora Falls', 'Fog Harbor', 'Coral Reach', 'Northwind', 'Marble Bay', 'Dustwater', 'Moonhaven', 'Silver Coast',
      // tempero
      'Copacabana Heights', 'Planet Coxinha', 'Lag Mountain', 'Bug Valley', 'São Pixel', 'Mount Feijão', 'Capybara Island', 'Neon Sertão',
    ],
    hero: [
      'Max Thunder', 'Kira Volt', 'Rex Ranger', 'Jack Blade', 'Captain Starling', 'Commander Vex', 'Lady Ember', 'Dr. Atom', 'Professor Laser', 'Ace McCoy',
      'Dash Rocket', 'Luna Starr', 'Kid Turbo', 'Zap Gordon', 'Ricky Riot', 'Sasha Storm', 'Duke Danger', 'Johnny Pixel', 'Billy Bolt', 'Rita Rocket',
      'Ozzy Orbit', 'Toby Torque', 'Vera Vortex', 'Maya Moon', 'Gus Gearhart', 'Penny Pulse', 'Major Ruckus', 'Baron Vile', 'Count Byte', 'Bobo the Brave',
      'Nina Nitro', 'Leo Lightning', 'Zara Zenith', 'Marco Meteor',
      // tempero
      'Zé Pixel', 'Captain Coxinha', 'Grandma Ninja', 'Caramel Dog', 'Agent Tapioca', 'Sergeant Pamonha', 'Princess Paçoca', 'Uncle Pastel', 'Aunt Neide',
    ],
    // palavras inventadas de indie: stem + tail ("Ember" + "fall")
    stem: [
      'Ember', 'Hollow', 'Ash', 'Dusk', 'Storm', 'Frost', 'Thorn', 'Moon', 'Sun', 'Star',
      'Void', 'Rune', 'Gloom', 'Bright', 'Dread', 'Grim', 'Silver', 'Raven', 'Cinder', 'Mist',
      'Night', 'Dawn', 'Echo', 'Salt', 'Bone', 'Glass', 'Ever', 'Lumen', 'Sky', 'Tide',
      'Wolf', 'Hex', 'Drift', 'Copper', 'Amber', 'Pale', 'Oath', 'Sable', 'Wisp', 'Gale',
    ],
    tail: [
      'fall', 'bound', 'forge', 'hold', 'keep', 'reach', 'light', 'ward', 'veil', 'mire',
      'spire', 'crest', 'heart', 'rise', 'shade', 'gate', 'wake', 'song', 'born', 'haven',
      'bloom', 'glow', 'shard', 'wood', 'fell', 'moor', 'vale', 'crown', 'march', 'lands',
    ],
  },

  // place e stem por tema são opcionais: quando faltam, o motor usa o banco geral.
  themes: {
    fantasia: {
      noun: ['Dragon', 'Sword', 'Spell', 'Dungeon', 'Orb', 'Crystal', 'Grimoire', 'Kingdom', 'Wizard', 'Rune', 'Sorcery', 'Griffin', 'Amulet', 'Sigil'],
      adj: ['Ancient', 'Arcane', 'Mystic', 'Enchanted', 'Elemental', 'Eternal', 'Celestial', 'Cursed', 'Elder', 'Fabled', 'Hidden'],
      hero: ['Elara', 'Thorne', 'Aldric', 'Lyra Moonwhisper', 'Kael', 'Seraphine', 'Mira the Bold', 'Wizard Wanda', 'Baron Grimm', 'Sir Bigode', 'Gnome Gustavo', 'Brother Pastel'],
      place: ['Eldermoor', 'Mistvale', 'Silverwood', 'Avalon', 'Faewood', 'Runehold', 'Dragonmere'],
      stem: ['Rune', 'Elf', 'Spell', 'Myth', 'Fae', 'Wyrm'],
    },
    espaco: {
      noun: ['Galaxy', 'Starship', 'Comet', 'Asteroid', 'Nebula', 'Station', 'Rocket', 'Planet', 'Orbit', 'Cosmos', 'Meteor', 'Quasar', 'Pulsar', 'Satellite'],
      adj: ['Stellar', 'Lunar', 'Solar', 'Orbital', 'Cosmic', 'Galactic', 'Interstellar', 'Astral', 'Zero-G', 'Deep', 'Infinite'],
      hero: ['Commander Nova', 'Astro Kid', 'Luna Starr', 'Zap Gordon', 'Dr. Orbit', 'Ensign Kepler', 'Ace Andromeda', 'Rocket Rita', 'Captain Starling', 'Major Pastel', 'Space Cadet Zé'],
      place: ['Moonbase Delta', 'Kepler Station', 'Nebula Nine', 'Titan Colony', 'Orbit City', 'Cosmo Port', 'Starhaven'],
      stem: ['Astro', 'Nova', 'Comet', 'Orbit', 'Star', 'Lumen'],
    },
    medieval: {
      noun: ['Castle', 'Crusade', 'Tournament', 'Knight', 'Throne', 'Crown', 'Siege', 'Catapult', 'Banner', 'Keep', 'Fortress', 'Lance', 'Squire'],
      adj: ['Royal', 'Feudal', 'Noble', 'Imperial', 'Valiant', 'Gallant', 'Iron', 'Black', 'Holy', 'Crimson', 'Stalwart'],
      hero: ['Sir Roland', 'Lady Isolde', 'Baron Blackwood', 'Prince Valor', 'Lord Ashford', 'Dame Rowena', 'Jester Jojo', 'Duke Danger', 'King Bigode', 'Queen Bete', 'Squire Zé'],
      place: ['Ironvale', 'Kingsbridge', 'Thornwall', 'Highcastle', 'Oakshire', 'Blackwater Keep', 'Camelot'],
      stem: ['Iron', 'Oak', 'King', 'Shield', 'Thorn'],
    },
    futebol: {
      noun: ['Goal', 'Striker', 'Kickoff', 'Derby', 'Penalty', 'Golazo', 'Dribble', 'Stadium', 'Cup', 'Pitch', 'Header', 'Corner', 'Bicycle Kick'],
      adj: ['Total', 'World', 'Pro', 'Ultimate', 'Golden', 'Super', 'Wild', 'Legendary', 'Flying', 'Magic', 'Samba'],
      hero: ['Kid Golazo', 'Dribble Dan', 'Golden Boot Gabi', 'Striker Steele', 'Captain Kickoff', 'Tiago Trivela', 'Zé Canela', 'Keeper Paredão', 'Coach Prancheta', 'Juninho Turbo', 'Striker Feijão'],
      place: ['Golazo Stadium', 'Penalty Park', 'Kickoff Bay', 'Rio Arena', 'Goal City', 'Sunday League Field'],
    },
    animais: {
      noun: ['Capybara', 'Armadillo', 'Toucan', 'Jaguar', 'Parrot', 'Gator', 'Sloth', 'Otter', 'Fox', 'Critter', 'Burrow', 'Jungle', 'Paw'],
      adj: ['Wild', 'Furry', 'Feral', 'Fuzzy', 'Tiny', 'Speedy', 'Savage', 'Sly', 'Happy', 'Brave', 'Fluffy'],
      hero: ['Zen Capybara', 'Rolly the Armadillo', 'Jack the Gator', 'Turbo Toucan', 'Mimi the Cat', 'Otto Otter', 'Sloth Sam', 'Foxy Flash', 'Paco Parrot', 'Kiki Kinkajou', 'Caramel Dog'],
      place: ['Capybara Island', 'Jungle Town', 'Paw Valley', 'Toucan Bay', 'Critter Creek', 'Mango Grove'],
    },
    piratas: {
      noun: ['Treasure', 'Galleon', 'Cutlass', 'Island', 'Map', 'Cannon', 'Mutiny', 'Plunder', 'Kraken', 'Doubloon', 'Anchor', 'Corsair', 'Skull'],
      adj: ['Salty', 'Sunken', 'Cursed', 'Black', 'Jolly', 'Stormy', 'Savage', 'Tropical', 'Drowned', 'Crimson', 'Wicked'],
      hero: ['Captain Patchy', 'Salty Sue', 'One-Eyed Jack', 'Calico Kate', 'Redbeard Rui', 'Mad Mary Morgan', 'Barnacle Bill', 'Admiral Farofa', 'Captain Maré', 'Parrot Juca', 'Bosun Bigode'],
      place: ['Skull Cove', 'Rum Island', 'Kraken Reef', 'Doubloon Bay', 'Port Royal', 'Tortuga'],
      stem: ['Salt', 'Tide', 'Brine', 'Gull', 'Rum', 'Reef'],
    },
    ninja: {
      noun: ['Shuriken', 'Clan', 'Dojo', 'Shadow', 'Scroll', 'Katana', 'Temple', 'Smoke', 'Blade', 'Kunai', 'Lotus', 'Ronin', 'Shogun'],
      adj: ['Silent', 'Deadly', 'Swift', 'Hidden', 'Invisible', 'Crimson', 'Midnight', 'Phantom', 'Lethal', 'Iron', 'Last'],
      hero: ['Kenji', 'Master Kaito', 'Hana Shadowstep', 'Akira Storm', 'Kuro', 'Yuki the Swift', 'Daisuke', 'Neighborhood Ninja', 'Grandma Ninja', 'Ninja Capybara', 'Sensei Bigode'],
      place: ['Shadow Valley', 'Mount Kurai', 'Lotus Temple', 'Crimson Gate', 'Bamboo Hollow', 'Edo Nights'],
    },
    militar: {
      noun: ['Battalion', 'Trench', 'Commando', 'Squadron', 'Mission', 'Tank', 'Bunker', 'Strike', 'Recon', 'Frontline', 'Platoon', 'Convoy', 'Outpost'],
      adj: ['Tactical', 'Total', 'Global', 'Lethal', 'Covert', 'Special', 'Elite', 'Rapid', 'Steel', 'Delta', 'Heavy'],
      hero: ['Colonel Crane', 'Lt. Rook', 'Sarge Stone', 'Agent Viper', 'Commander Hawk', 'Captain Grenade', 'Major Ruckus', 'Gunny Gomes', 'Sergeant Pamonha', 'Corporal Zé', 'Private Pipoca'],
      place: ['Fort Bravo', 'Camp Thunder', 'Iron Ridge', 'Outpost Echo', 'Red Beach', 'Delta Base'],
    },
    crime: {
      noun: ['Heist', 'Job', 'Mob', 'Getaway', 'Scheme', 'Vault', 'Disguise', 'Syndicate', 'Racket', 'Alibi', 'Hustle', 'Score', 'Underworld'],
      adj: ['Dirty', 'Shady', 'Wanted', 'Hot', 'Federal', 'Criminal', 'Midnight', 'Rotten', 'Crooked', 'Lucky', 'Noir'],
      hero: ['Lucky Lou', 'Madame Rouge', 'Tony Two-Times', 'Johnny Alibi', 'Fast Freddie', 'Agent Shadow', 'Sly Silva', 'Inspector Cachimbo', 'Detective Pastel', 'Detective Neide', 'Malandro Zeca'],
      place: ['Sin Harbor', 'Lucky Street', 'Crooked Creek', 'Mob Town', 'Rain City', 'Velvet Row'],
    },
    velhooeste: {
      noun: ['Duel', 'Saloon', 'Sheriff', 'Stagecoach', 'Canyon', 'Rodeo', 'Outlaw', 'Gold', 'Bounty', 'Frontier', 'Revolver', 'Mesa', 'Posse'],
      adj: ['Wild', 'Dusty', 'Lawless', 'Rusty', 'Desperate', 'Lone', 'Savage', 'Golden', 'Rowdy', 'Silver', 'High Noon'],
      hero: ['Calamity Kate', 'Dusty Dan', 'Billy Six-Shot', 'Marshal Moreno', 'Annie Oakwood', 'Jesse Jinx', 'Doc Holloway', 'Rattlesnake Rose', 'Sheriff Bigode', 'Cowboy Pastel', 'Deputy Poeira'],
      place: ['Dusty Gulch', 'Rattlesnake Ridge', 'Gold Creek', 'Cactus Junction', 'Red Mesa', 'Buzzard Flats'],
    },
    escola: {
      noun: ['Recess', 'Exam', 'Detention', 'Homework', 'Backpack', 'Chalkboard', 'Cafeteria', 'Hall Pass', 'Field Trip', 'Locker', 'Report Card', 'Prom', 'Pop Quiz'],
      adj: ['Final', 'Extra', 'Secret', 'Last', 'Total', 'Late', 'Popular', 'Perfect', 'Nerdy', 'Overdue', 'Midterm'],
      hero: ['New Kid Nico', 'Lunch Lady Lu', 'Hall Monitor Bia', 'Coach Carla', 'Class Clown Caio', 'Janitor Joca', 'Substitute Sam', 'Nerd Norberto', 'Professor Neide', 'Teacher Tânia', 'Principal Pudim'],
      place: ['Westbrook High', 'Bobo Academy', 'Maple High', 'Camp Lakeview', 'Detention Hall', 'Pencil Valley'],
    },
    robos: {
      noun: ['Robot', 'Gear', 'Android', 'Mech', 'Bolt', 'Circuit', 'Factory', 'Battery', 'Servo', 'Cog', 'Chrome', 'Reactor', 'Automaton'],
      adj: ['Mechanical', 'Robotic', 'Atomic', 'Turbo', 'Modular', 'Steel', 'Electric', 'Bionic', 'Rusty', 'Heavy', 'Clockwork'],
      hero: ['Sparky', 'Bolt Boy', 'Tin Tina', 'Doctor Cog', 'Max Mainframe', 'Gearhart', 'Ada Ampere', 'Rusty Rex', 'Unit Zeta', 'Robo Pastel', 'Mecha Bigode'],
      place: ['Gear City', 'Chrome Valley', 'Bolt Town', 'Mecha Bay', 'Robotropolis', 'Scrapyard Hill'],
    },
    dinossauros: {
      noun: ['Rex', 'Fossil', 'Meteor', 'Egg', 'Raptor', 'Volcano', 'Tar Pit', 'Dino', 'Amber', 'Stomp', 'Tooth', 'Claw', 'Bone'],
      adj: ['Prehistoric', 'Primal', 'Colossal', 'Giant', 'Mighty', 'Savage', 'Extinct', 'Stone Age', 'Feral', 'Ancient', 'Volcanic'],
      hero: ['Friendly Rex', 'Dr. Fossil', 'Raptor Ray', 'Trudy Tops', 'Professor Amber', 'Rocky Raptor', 'Dina Saur', 'Bronto Bob', 'Pterry', 'Cave Kid Caco', 'Grandpa Fossil'],
      place: ['Raptor Ridge', 'Fossil Falls', 'Volcano Isle', 'Dino Island', 'Amber Canyon', 'Tar Pit Valley'],
    },
    culinaria: {
      noun: ['Kitchen', 'Feijoada', 'Pastel', 'Brigadeiro', 'Coxinha', 'Barbecue', 'Lunchbox', 'Spice', 'Pancake', 'Burger', 'Noodle', 'Recipe', 'Grill'],
      adj: ['Gourmet', 'Spicy', 'Crispy', 'Sizzling', 'Hungry', 'Tasty', 'Deep-Fried', 'Sweet', 'Saucy', 'Hot', 'Frosted'],
      hero: ['Granny Spice', 'Chef Gusto', 'Baker Bia', 'Nonna Rosa', 'Grill Master Gil', 'Waffle Wendy', 'Chef Bigode', 'Captain Coxinha', 'Dona Panela', 'Uncle Pastel', 'Sous-Chef Zé'],
      place: ['Pastel Street', 'Spice Bay', 'Burger Town', 'Noodle Alley', 'Feijoada Falls', 'Sugar Hill'],
    },
    musica: {
      noun: ['Beat', 'Groove', 'Solo', 'Encore', 'Tour', 'Band', 'Chorus', 'Mic', 'Bassline', 'Drum', 'Riff', 'Rhythm', 'Jam', 'Vinyl'],
      adj: ['Funky', 'Electric', 'Loud', 'Groovy', 'Acoustic', "Rockin'", 'Golden', 'Platinum', 'Neon', 'Hi-Fi', 'Mellow'],
      hero: ['Diva Luna', 'Johnny Groove', 'Lola Loop', 'Riff Rodrigues', 'Bass Boy Ben', 'Sax Sally', 'Samba Kid', 'DJ Bigode', 'MC Pastel', 'Rocker Bete', 'Maestro Zé'],
      place: ['Disco City', 'Bass Bay', 'Funk Town', 'Vinyl Valley', 'Rock Island', 'Samba Square'],
    },
    fazenda: {
      noun: ['Harvest', 'Henhouse', 'Tractor', 'Scarecrow', 'Barn', 'Cornfield', 'Pumpkin', 'Orchard', 'Silo', 'Pasture', 'Haystack', 'Seedling', 'Meadow'],
      adj: ['Rural', 'Happy', 'Sunny', 'Rustic', 'Muddy', 'Golden', 'Country', 'Green', 'Organic', 'Busy', 'Sleepy'],
      hero: ['Farmer Bete', 'Billy Goat Gus', 'Auntie Corn', 'Tractor Ted', 'Daisy Dell', 'Hank Haybale', 'Scarecrow Joca', 'Mimosa the Cow', 'Rooster Carijó', 'Piglet Pipoca', 'Farmer Zé'],
      place: ['Harvest Hill', 'Corn Valley', 'Sunny Acres', 'Old Mill Farm', 'Pumpkin Patch', 'Cowtown'],
      stem: ['Hay', 'Barley', 'Clover', 'Corn', 'Apple', 'Turnip'],
    },
    herois: {
      noun: ['Cape', 'Power', 'Villain', 'Hideout', 'Mask', 'Lightning', 'Sidekick', 'Crusader', 'Vigilante', 'Squad', 'Signal', 'Lair', 'Hero'],
      adj: ['Unstoppable', 'Mighty', 'Amazing', 'Super', 'Atomic', 'Cosmic', 'Masked', 'Ultimate', 'Spectacular', 'Daring', 'Caped'],
      hero: ['Comet Girl', 'Doctor Spark', 'Kid Kinetic', 'Lady Lightspeed', 'Night Heron', 'Iron Granny', 'Major Magnet', 'Professor Prism', 'Armadillo Man', 'Captain Coxinha', 'Pastel Lady', 'Super Bigode'],
      place: ['Metro Bay', 'Hero City', 'Capitol Harbor', 'Sentinel City', 'Liberty Bay', 'Skyline Heights'],
    },
    romance: {
      noun: ['Heart', 'Passion', 'Crush', 'Date', 'Letter', 'Wedding', 'Serenade', 'Kiss', 'Valentine', 'Sweetheart', 'Promise', 'Rose', 'Moonlight'],
      adj: ['Impossible', 'Sweet', 'Secret', 'Endless', 'Tender', 'Forbidden', 'Lovely', 'Starry', 'Summer', 'Hopeless', 'Perfect'],
      hero: ['Bella Rosa', 'Romeo Rocha', 'Juliet Jones', 'Lady Valentina', 'Casanova Kid', 'Sweet Sofia', 'Poet Juca', 'Neighborhood Crush', 'Cupid Zé', 'Princess Paçoca', 'Heartthrob Bigode'],
      place: ['Paris', 'Rose Garden', 'Moonlit Bay', 'Lovers Lane', 'Heart Lake', 'Café Amor'],
    },
    folclore: {
      noun: ['Saci', 'Curupira', 'Boitatá', 'Headless Mule', 'Whirlwind', 'Legend', 'Forest', 'Spell', 'Iara', 'Caipora', 'Firesnake', 'Cuca', 'Boto'],
      adj: ['Haunted', 'Ancestral', 'Wild', 'Mystic', 'Enchanted', 'Cursed', 'Tropical', 'Spooky', 'Sacred', 'Restless', 'Whispering'],
      hero: ['Saci Turbo', 'Curupira Jr.', 'Caipora Kid', 'Little Boitatá', 'Boto Charmer', 'Iara Jr.', 'Matinta', 'Grandma Benzedeira', 'Uncle Lobisomem', 'Comadre Fulozinha', 'Forest Father'],
      place: ['Saci Woods', 'Black River', 'Boitatá Falls', 'Curupira Forest', 'Neon Sertão', 'Moonlit Swamp'],
    },
    carnaval: {
      noun: ['Parade', 'Samba', 'Carnival', 'Confetti', 'Costume', 'Float', 'Bloco', 'Mask', 'Feather', 'Marchinha', 'Frevo', 'Streamer', 'Tamborim'],
      adj: ['Tropical', 'Dazzling', 'Glittery', 'Festive', 'Electric', 'Wild', 'Golden', 'Restless', 'Sweaty', 'Endless', 'Sparkling'],
      hero: ['King Momo', 'Glitter Gil', 'Drummer Dudu', 'Drum Queen Dara', 'Frevo Fred', 'Confetti Kid', 'Samba Sam', 'Pierrot Bigode', 'Colombina Paçoca', 'Passista Bete', 'Mestre-Sala Zé'],
      place: ['Sambadrome', 'Copacabana', 'Olinda', 'Salvador', 'Confetti Avenue', 'Rio Nights'],
    },
    mitologia: {
      noun: ['Olympus', 'Titan', 'Oracle', 'Thunderbolt', 'Labyrinth', 'Hydra', 'Pantheon', 'Nectar', 'Minotaur', 'Trident', 'Pegasus', 'Odyssey', 'Valhalla'],
      adj: ['Immortal', 'Divine', 'Olympian', 'Titanic', 'Mythic', 'Heavenly', 'Golden', 'Eternal', 'Legendary', 'Godly', 'Ancient'],
      hero: ['Tiny Zeus', 'Herculano', 'Friendly Medusa', 'Athena Jr.', 'Achilles Heel', 'Theo of Thebes', 'Ariadne', 'Icarus Ike', "Odin's Nephew", 'Perseus Pires', 'Goddess Bete'],
      place: ['Olympus', 'Atlantis', 'Troy', 'Thebes', 'Crete', 'Delphi', 'Asgard'],
    },
    novela: {
      noun: ['Villain', 'Inheritance', 'Twin', 'Wedding', 'Secret', 'Chapter', 'Mansion', 'Plot Twist', 'Scandal', 'Slap', 'Betrayal', 'Fortune', 'Heiress'],
      adj: ['Forbidden', 'Scandalous', 'Dramatic', 'Tragic', 'Final', 'Secret', 'Evil', 'Wicked', 'Shocking', 'Eternal', 'Hidden'],
      hero: ['Villainess Rebeca', 'Evil Twin Elisa', 'Matriarch Neide', 'Doctor Amnésio', 'Count Ricardo', 'Lady Fortuna', 'Maid Marisol', 'Butler Zé', 'Baron Bigodão', 'Mocinha Bete', 'Heartthrob Bigode'],
      place: ['Villa Rosa', 'Monteiro Manor', 'Santa Fortuna', 'Copacabana Heights', 'Vila Esperança', 'Paradise Ranch'],
    },
    cidade: {
      noun: ['City', 'Skyline', 'Traffic', 'Subway', 'Avenue', 'Block', 'Downtown', 'Tower', 'Rooftop', 'Plaza', 'Highway', 'Neighborhood', 'Bus Stop'],
      adj: ['Urban', 'Busy', 'Concrete', 'Neon', 'Midnight', 'Electric', 'Crowded', 'Metropolitan', 'Modern', 'Rainy', 'Gridlocked'],
      hero: ['Taxi Tina', 'Courier Kai', 'Officer Ortiz', 'Skater Sky', 'Doorman Dino', 'Mayor Maya', 'Pigeon Paulo', 'Builder Bruno', 'Cabbie Carlos', 'Bus Driver Zé', 'Mayor Bigode'],
      place: ['Neo Rio', 'Metro City', 'Sky Harbor', 'Concrete Bay', 'Rush Hour Avenue', 'Bitropolis'],
    },
    zumbi: {
      noun: ['Apocalypse', 'Horde', 'Outbreak', 'Infection', 'Bite', 'Brain', 'Quarantine', 'Bunker', 'Survivor', 'Plague', 'Graveyard', 'Virus', 'Shambler'],
      adj: ['Undead', 'Rotten', 'Viral', 'Infected', 'Last', 'Toxic', 'Hungry', 'Bloody', 'Decaying', 'Shambling', 'Grim'],
      hero: ['Grandma Sledgehammer', 'Doctor Vaccine', 'Nice Zombie Ned', 'Hunter Rex', 'Shovel Auntie', 'Sergeant Siege', 'Nurse Nina', 'Ranger Rio', 'Lonely Lucas', 'Medic Mara', 'Survivor Zé'],
      place: ['Dead Hollow', 'Quarantine Zone', 'Ghost Town', 'Rotwood', 'Camp Survival', 'Dead Mall'],
      stem: ['Rot', 'Blight', 'Grave', 'Ash', 'Plague', 'Bone'],
    },
    cyberpunk: {
      noun: ['Chip', 'Implant', 'Network', 'Hacker', 'District', 'Megacorp', 'Firewall', 'Glitch', 'Synth', 'Mainframe', 'Datastream', 'Cipher', 'Grid', 'Uplink'],
      adj: ['Neon', 'Digital', 'Virtual', 'Chrome', 'Neural', 'Synthetic', 'Wired', 'Rogue', 'Electric', 'Cyber', 'Augmented'],
      hero: ['Detective Glitch', 'Wi-Fi Samurai', 'Vex Voltage', 'Kira Kode', 'Razorwire', 'Nyx', 'Jet Johnson', 'Hacker Zezé', 'Cyborg Bete', 'Runner Pastel', 'Android Neide'],
      place: ['Chrome District', 'Neon Harbor', 'Glitch City', 'Data Haven', 'Sector Zero', 'Neo Rio'],
      stem: ['Neon', 'Chrome', 'Hex', 'Volt', 'Byte', 'Wire'],
      tail: ['grid', 'core', 'line', 'shard', 'gate', 'fall'],
    },
    internet: {
      noun: ['Meme', 'Thread', 'Like', 'Livestream', 'Inbox', 'Algorithm', 'Hashtag', 'Server', 'Download', 'Browser', 'Forum', 'Emoji', 'Spam', 'Clickbait'],
      adj: ['Viral', 'Digital', 'Virtual', 'Online', 'Trending', 'Offline', 'Infinite', 'Wireless', 'Dial-Up', 'Unread', 'Verified'],
      hero: ['Influencer Bia', 'Moderator Juca', 'Group Chat Auntie', 'Streamer Turbo', 'Meme Lord Max', 'Admin Ana', 'Noob Nico', 'Troll Tony', 'Lurker Lu', 'Captain Clickbait', 'Hater Zé'],
      place: ['Cloud Nine', 'Dial-Up Valley', 'Meme City', 'Lag Mountain', 'Spam Island', 'Server Farm'],
    },
  },

  genres: {
    acao: {
      noun: ['Brawl', 'Blast', 'Fury', 'Strike', 'Mayhem', 'Assault', 'Rescue', 'Showdown', 'Havoc', 'Payback', 'Impact', 'Bullet'],
      adj: ['Brutal', 'Total', 'Radical', 'Explosive', 'Relentless', 'Unstoppable', 'Furious', 'Savage', 'Raging', 'Maximum', 'Heavy'],
    },
    plataforma: {
      noun: ['Jump', 'Coin', 'Pipe', 'Mushroom', 'Level', 'Leap', 'Bounce', 'Spring', 'Dash', 'Hop', 'Cloud', 'Star'],
      adj: ['Bouncy', 'Happy', 'Turbo', 'Giant', 'Jumpy', 'Springy', 'Super', 'Speedy', 'Tiny', 'Plucky', 'Lucky'],
    },
    aventura: {
      noun: ['Expedition', 'Treasure', 'Map', 'Mystery', 'Ruins', 'Relic', 'Compass', 'Odyssey', 'Idol', 'Temple', 'Voyage', 'Island'],
      adj: ['Lost', 'Wild', 'Hidden', 'Secret', 'Forgotten', 'Ancient', 'Great', 'Daring', 'Sunken', 'Distant', 'Golden'],
    },
    rpg: {
      noun: ['Saga', 'Chronicle', 'Dungeon', 'Prophecy', 'Sigil', 'Crest', 'Realm', 'Covenant', 'Oath', 'Relic', 'Legend', 'Grimoire'],
      adj: ['Ancient', 'Eternal', 'Fabled', 'Arcane', 'Sacred', 'Forsaken', 'Mythic', 'Shattered', 'Last', 'Elder', 'Crystal'],
    },
    estrategia: {
      noun: ['Empire', 'Conquest', 'Tactics', 'Dominion', 'Legion', 'Frontier', 'Siege', 'Dynasty', 'Kingdom', 'Alliance', 'Warlord', 'Colony'],
      adj: ['Global', 'Imperial', 'Grand', 'Supreme', 'Royal', 'Iron', 'Eternal', 'Ancient', 'Tactical', 'Mighty', 'Steel'],
    },
    simulacao: {
      noun: ['Cubicle', 'Routine', 'Office', 'Queue', 'Shift', 'Overtime', 'Payroll', 'Career', 'Paperwork', 'Commute', 'Startup', 'Spreadsheet'],
      adj: ['Realistic', 'Virtual', 'Total', 'Daily', 'Corporate', 'Busy', 'Ordinary', 'Pro', 'Professional', 'Endless', 'Monday'],
    },
    puzzle: {
      noun: ['Enigma', 'Jigsaw', 'Cube', 'Riddle', 'Block', 'Maze', 'Tile', 'Gem', 'Prism', 'Pattern', 'Logic', 'Mosaic'],
      adj: ['Impossible', 'Clever', 'Cerebral', 'Tricky', 'Bright', 'Twisted', 'Tiny', 'Simple', 'Infinite', 'Quiet', 'Colorful'],
    },
    corrida: {
      noun: ['Kart', 'Turbo', 'Track', 'Rally', 'Roadster', 'Nitro', 'Drift', 'Grand Prix', 'Speedway', 'Circuit', 'Engine', 'Lap'],
      adj: ['Fast', 'Turbo', 'Radical', 'Street', 'Nitro', 'Furious', 'Supersonic', 'Wild', 'Blazing', 'Rapid', 'Redline'],
    },
    esporte: {
      noun: ['Championship', 'Tournament', 'Cup', 'League', 'Slam', 'Match', 'Final', 'Arena', 'Season', 'Derby', 'Playoffs', 'Trophy'],
      adj: ['World', 'Pro', 'Total', 'Extreme', 'All-Star', 'Ultimate', 'Super', 'Wild', 'Golden', 'Legendary', 'Varsity'],
    },
    luta: {
      noun: ['Combo', 'Punch', 'Tournament', 'Ring', 'Knockout', 'Brawl', 'Fist', 'Kick', 'Uppercut', 'Clash', 'Duel', 'Slam'],
      adj: ['Brutal', 'Savage', 'Iron', 'Ultimate', 'Supreme', 'Furious', 'Raging', 'Deadly', 'Bloody', 'Burning', 'Steel'],
    },
    terror: {
      noun: ['Nightmare', 'Curse', 'Haunting', 'Mansion', 'Scream', 'Asylum', 'Crypt', 'Whisper', 'Fog', 'Ritual', 'Cellar', 'Basement'],
      adj: ['Haunted', 'Cursed', 'Eerie', 'Hollow', 'Grim', 'Midnight', 'Restless', 'Wicked', 'Pale', 'Unholy', 'Creeping'],
      stem: ['Dread', 'Grave', 'Hush', 'Rot', 'Pale', 'Gloom', 'Crow', 'Blight'],
    },
    tiro: {
      noun: ['Crosshair', 'Barrage', 'Trench', 'Target', 'Bullet', 'Trigger', 'Payload', 'Sniper', 'Gunner', 'Ammo', 'Firefight', 'Recoil'],
      adj: ['Lethal', 'Tactical', 'Heavy', 'Rapid', 'Covert', 'Total', 'Explosive', 'Black', 'Steel', 'Hot', 'Rogue'],
    },
    ritmo: {
      noun: ['Beat', 'Dance', 'Groove', 'Step', 'Tempo', 'Bass', 'Rhythm', 'Encore', 'Disco', 'Drop', 'Pulse', 'Shuffle'],
      adj: ['Funky', 'Groovy', 'Electric', 'Dancing', 'Catchy', 'Hyper', 'Neon', 'Loud', 'Bouncy', "Rockin'", 'Smooth'],
    },
    mmo: {
      noun: ['Server', 'Guild', 'Raid', 'World', 'Clan', 'Realm', 'Shard', 'Legion', 'Frontier', 'Kingdom', 'Faction', 'Universe'],
      adj: ['Infinite', 'Massive', 'Eternal', 'Endless', 'Shared', 'Virtual', 'Boundless', 'Grand', 'Mythic', 'Epic', 'Persistent'],
    },
    party: {
      noun: ['Board Game', 'Minigame', 'Mayhem', 'Fiesta', 'Barbecue', 'Picnic', 'Bash', 'Shindig', 'Birthday', 'Karaoke', 'Sleepover', 'Confetti'],
      adj: ['Happy', 'Wacky', 'Crazy', 'Silly', 'Super', 'Jolly', 'Chaotic', 'Bouncy', 'Family', 'Big', 'Goofy'],
    },
    sandbox: {
      noun: ['Block', 'Cube', 'Mine', 'Island', 'Workshop', 'Voxel', 'Biome', 'Frontier', 'Colony', 'Terrain', 'Outpost', 'Pickaxe'],
      adj: ['Endless', 'Free', 'Boundless', 'Infinite', 'Wild', 'Blocky', 'Open', 'Vast', 'Untamed', 'Big', 'Square'],
      stem: ['Clay', 'Pebble', 'Moss', 'Voxel', 'Stone', 'Root'],
    },
    moba: {
      noun: ['Lane', 'Tower', 'Arena', 'Nexus', 'Champion', 'Jungle', 'Minion', 'Legion', 'Clash', 'Rift', 'Throne', 'Ward'],
      adj: ['Ranked', 'Legendary', 'Mythic', 'Eternal', 'Tactical', 'Heroic', 'Savage', 'Immortal', 'Elite', 'Arcane', 'Grand'],
    },
    roguelike: {
      noun: ['Dungeon', 'Death', 'Run', 'Loop', 'Crypt', 'Descent', 'Depths', 'Abyss', 'Labyrinth', 'Catacomb', 'Relic', 'Cycle'],
      adj: ['Endless', 'Fatal', 'Cursed', 'Brutal', 'Infinite', 'Doomed', 'Deadly', 'Random', 'Hopeless', 'Twisted', 'Unlucky'],
      stem: ['Deep', 'Hex', 'Bone', 'Ash', 'Grim', 'Rogue', 'Crypt', 'Loop'],
    },
    cozy: {
      noun: ['Teacup', 'Garden', 'Blanket', 'Village', 'Café', 'Nap', 'Cottage', 'Bakery', 'Meadow', 'Greenhouse', 'Pond', 'Quilt', 'Bookshop'],
      adj: ['Cozy', 'Gentle', 'Sweet', 'Sleepy', 'Tiny', 'Little', 'Soft', 'Warm', 'Mellow', 'Sunny', 'Peaceful'],
      stem: ['Honey', 'Moss', 'Clover', 'Petal', 'Willow', 'Maple', 'Tea', 'Fern', 'Plum', 'Acorn'],
      tail: ['brook', 'bloom', 'field', 'hollow', 'dale', 'nook', 'cove', 'meadow'],
    },
    battle: {
      noun: ['Dropship', 'Island', 'Drop', 'Zone', 'Storm', 'Arena', 'Squad', 'Showdown', 'Circle', 'Loot', 'Airdrop', 'Ring'],
      adj: ['Final', 'Last', 'Total', 'Brutal', 'Wild', 'Supreme', 'Royal', 'Lone', 'Hot', 'Shrinking', 'Ultimate'],
    },
  },
}

// Nomes e pedaços de jogos (e marcas) de verdade que o gerador nunca deve montar.
// Os jogos históricos de history.js entram nessa lista automaticamente.
export const TITLE_BLOCKLIST = [
  'final fantasy', 'final fight', 'mortal kombat', 'mortal combat', 'fatal fury', 'fatal frame', 'street fighter',
  'dragon quest', 'dragon age', 'dragon ball', 'dragon slayer', 'double dragon', 'dark souls', 'demon souls', 'silent hill',
  'metal gear', 'twisted metal', 'iron man', 'super mario', 'mega man', 'star wars', 'star fox', 'star trek', 'star ocean',
  'space quest', 'space invaders', 'king quest', 'kings quest', 'police quest', 'everquest', 'rune quest', 'runequest', 'hero quest',
  'golden axe', 'golden sun', 'goldeneye', 'grand theft', 'red dead', 'dead space', 'dead rising', 'dead island', 'total war',
  'command & conquer', 'age of empires', 'harvest moon', 'animal crossing', 'dance dance', 'rhythm heaven', 'guitar hero',
  'crazy taxi', 'need for speed', 'ridge racer', 'gran turismo', 'midnight club', 'full throttle', 'jurassic park',
  'justice league', 'fantastic four', 'incredible hulk', 'wonder woman', 'monster hunter', 'fruit ninja', 'temple run',
  'slay the spire', 'gears of war', 'god of war', 'call of duty', 'half-life', 'team fortress', 'rainbow six', 'splinter cell',
  'devil may cry', 'ninja gaiden', 'streets of rage', 'tales of', 'secret of mana', 'phantasy star', 'fire emblem',
  'advance wars', 'elder scrolls', 'hollow knight', 'stardew', 'donkey kong', 'sonic', 'zelda', 'pokemon', 'pokémon', 'kirby',
  'tomb raider', 'prince of persia', 'assassin', 'far cry', 'mass effect', 'halo', 'doom', 'quake', 'portal', 'fortnite',
  'minecraft', 'terraria', 'warcraft', 'starcraft', 'starbound', 'starfield', 'titanfall', 'bloodborne', 'overwatch',
  'firewatch', 'skyrim', 'skyward', 'hearthstone', 'shadowrun', 'shadowgate', 'dreamfall', 'mistborn', 'stormlight',
  'gloomhaven', 'thronefall', 'wildfrost', 'moonlighter', 'stormgate', 'ironforge', 'moonfall', 'ragnarok online',
  'disco elysium', 'armored core', 'burning rangers', 'samba de amigo', 'horizon zero', 'horizon chase', 'crash bandicoot',
  'spyro', 'rayman', 'banjo', 'pac-man', 'tetris', 'lemmings', 'bomberman', 'diablo', 'hades', 'celeste', 'undertale',
  'cuphead', 'journey', 'limbo', 'destiny', 'anthem', 'fable', 'outlast', 'amnesia', 'metro 2033', 'metro exodus',
  'the matrix', 'toy story', 'orcs must die', 'vampire survivors', 'rocket league', 'fall guys', 'among us', 'free fire',
  'apex legends', 'league of legends', 'clash of clans', 'clash royale', 'candy crush', 'angry birds', 'mario kart',
  'smash bros', 'wii sports', 'just dance', 'just cause', 'max payne', 'alan wake', 'bioshock', 'dishonored', 'deus ex',
  'system shock', 'hitman', 'uncharted', 'last of us', 'resident evil', 'monkey island', 'simcity', 'sim city', 'the sims',
  'rollercoaster tycoon', 'theme park', 'theme hospital', 'planet coaster', 'jet set radio', 'space harrier', 'after burner',
  'out run', 'outrun', 'road rash', 'kid icarus', 'punch-out', 'duck hunt', 'eve online', 'guild wars', 'runescape',
  'world of warcraft', 'heroes of the storm', 'baldur', 'dungeon keeper', 'spelunky', 'dead cells', 'risk of rain',
  'darkest dungeon', 'frostpunk', 'subnautica', 'valheim', 'overcooked', 'cooking mama', 'pizza tower', 'katamari',
  'beat saber', 'balatro', 'palworld', 'elden ring', 'witcher', 'astro bot', 'dandara', 'chroma squad', 'metal slug',
  'king of fighters', 'art of fighting', 'samurai shodown', 'soulcalibur', 'tekken', 'killer instinct', 'darkstalkers',
  'marvel', 'x-men', 'batman', 'superman', 'avengers', 'transformers', 'power rangers', 'ghostbusters', 'top gun', 'robocop',
  'terminator', 'lord of the rings', 'harry potter', 'simpsons', 'gundam', 'mechwarrior', 'shovel knight', 'into the breach',
  'plants vs', 'pikmin', 'splatoon', 'f-zero', 'wipeout', 'burnout', 'asphalt', 'excitebike', 'mother 3', 'earthbound',
  'chrono trigger', 'kingdom hearts', 'world of goo', 'crystal castles', 'dig dug', 'joust', 'frogger', 'galaga', 'centipede',
  'missile command', 'night trap', 'ecco', 'shinobi', 'altered beast', 'golden eye', 'pitfall', 'castlevania', 'metroid', 'contra',
  'dance revolution', 'daylight', 'superhot', 'super hot', 'super cobra', 'thunder force', 'galaxy force', 'star force',
  'cobra command', 'shadow warriors', 'dynasty warriors', 'titan quest', 'sword quest', 'swordquest', 'crystal quest',
  'dungeon quest', 'galaxy quest', 'banner saga', 'battle zone', 'battlezone', 'battle city', 'highway patrol', 'kingdom rush',
  'gold rush', 'drop zone', 'dropzone', 'operation wolf', 'operation thunderbolt', 'rise of the ronin', 'dark crystal',
  'the lost crown', 'final station', 'iron harvest', 'silent storm', 'dark cloud', 'iron storm', 'savage planet',
  'broken sword', 'rogue squadron', 'lost planet', 'brutal legend', 'eternal champion', 'savage empire', 'iron sword',
  'atomic heart', 'frozen throne', 'forgotten realm', 'steel battalion', 'burning crusade', 'iron fist', 'black knight',
  'star raiders', 'laser squad', 'double dribble', 'raging thunder', 'night in the woods', 'die in the dungeon', 'sun haven',
  'nightshade', 'iron throne', 'loop hero',
]

// Palavras inventadas que já existem no dicionário (ou em jogo de verdade) e ficam sem graça como título.
export const TITLE_COIN_SKIP = [
  'skylight', 'sunlight', 'moonlight', 'starlight', 'sunrise', 'moonrise', 'nightfall', 'starlit', 'nightshade', 'driftwood',
  'sunhaven', 'ashfall', 'stormrise', 'silverfall', 'duskwood', 'moonglow', 'starborn', 'wolfheart', 'hexgate', 'saltmarsh',
  'applebloom', 'applewood', 'cornfield', 'hayfield', 'skybound', 'skyforge',
]
