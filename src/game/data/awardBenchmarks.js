// Referências reais para impedir anos vazios na premiação do universo do jogo.
// A partir de 2014, a lista usa vencedores reais do The Game Awards como régua;
// antes disso, é uma curadoria de lançamentos marcantes do próprio ano, não a
// afirmação de que existia um prêmio global equivalente.
export const YEAR_HEADLINERS = Object.freeze({
  1980: ['Pac-Man', 'Namco'],
  1981: ['Donkey Kong', 'Nintendo'],
  1982: ['Ms. Pac-Man', 'Midway'],
  1983: ['Mario Bros.', 'Nintendo'],
  1984: ['Tetris', 'Alexey Pajitnov'],
  1985: ['Super Mario Bros.', 'Nintendo'],
  1986: ['The Legend of Zelda', 'Nintendo'],
  1987: ['Mega Man', 'Capcom'],
  1988: ['Super Mario Bros. 3', 'Nintendo'],
  1989: ['Tetris (Game Boy)', 'Nintendo'],
  1990: ['Super Mario World', 'Nintendo'],
  1991: ['Sonic the Hedgehog', 'Sega'],
  1992: ['The Legend of Zelda: A Link to the Past', 'Nintendo'],
  1993: ['Doom', 'id Software'],
  1994: ['Final Fantasy VI', 'Square'],
  1995: ['Chrono Trigger', 'Square'],
  1996: ['Super Mario 64', 'Nintendo'],
  1997: ['Final Fantasy VII', 'Square'],
  1998: ['The Legend of Zelda: Ocarina of Time', 'Nintendo'],
  1999: ['Pokémon Gold & Silver', 'Game Freak / Nintendo'],
  2000: ['The Sims', 'Maxis'],
  2001: ['Grand Theft Auto III', 'Rockstar Games'],
  2002: ['Metroid Prime', 'Retro Studios / Nintendo'],
  2003: ['Star Wars: Knights of the Old Republic', 'BioWare'],
  2004: ['Half-Life 2', 'Valve'],
  2005: ['Resident Evil 4', 'Capcom'],
  2006: ['The Elder Scrolls IV: Oblivion', 'Bethesda'],
  2007: ['BioShock', 'Irrational Games / 2K'],
  2008: ['Grand Theft Auto IV', 'Rockstar Games'],
  2009: ['Uncharted 2: Among Thieves', 'Naughty Dog / Sony'],
  2010: ['Red Dead Redemption', 'Rockstar Games'],
  2011: ['The Elder Scrolls V: Skyrim', 'Bethesda'],
  2012: ['The Walking Dead', 'Telltale Games'],
  2013: ['Grand Theft Auto V', 'Rockstar Games'],
  2014: ['Dragon Age: Inquisition', 'BioWare / EA'],
  2015: ['The Witcher 3: Wild Hunt', 'CD Projekt Red'],
  2016: ['Overwatch', 'Blizzard'],
  2017: ['The Legend of Zelda: Breath of the Wild', 'Nintendo'],
  2018: ['God of War', 'Santa Monica Studio / Sony'],
  2019: ['Sekiro: Shadows Die Twice', 'FromSoftware / Activision'],
  2020: ['The Last of Us Part II', 'Naughty Dog / Sony'],
  2021: ['It Takes Two', 'Hazelight / EA'],
  2022: ['Elden Ring', 'FromSoftware / Bandai Namco'],
  2023: ["Baldur's Gate 3", 'Larian Studios'],
  2024: ['Astro Bot', 'Team Asobi / Sony'],
  2025: ['Clair Obscur: Expedition 33', 'Sandfall Interactive / Kepler Interactive'],
})

const hash = text => [...text].reduce((value, char) => (value * 31 + char.charCodeAt(0)) % 997, 17)

export function realAwardCandidate(year) {
  const [title, studio] = YEAR_HEADLINERS[year] ?? [`Destaque da indústria ${year}`, 'Indústria mundial']
  const seed = hash(`${title}:${year}`)
  return {
    id: `real-${year}`,
    title,
    studio,
    source: 'real',
    released: `DEZ ${year}`,
    score: 84 + seed % 8,
    sales: 1_200_000 + (seed % 21) * 180_000,
    scale: 'large',
    focus: seed % 3 === 0 ? 'story' : seed % 3 === 1 ? 'gameplay' : 'innovation',
    innovation: 7 + seed % 9,
    trust: 74 + seed % 18,
  }
}
