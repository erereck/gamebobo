// Catálogo curado de plataformas de relevância global. Datas usam mês 0-11.
// A simulação libera a plataforma no primeiro lançamento regional registrado.
export const PLATFORM_HISTORY = [
  { id: 'pc', label: 'PC', company: 'Ecossistema aberto', type: 'computer', launch: { global: [1980, 0] }, endYear: 9999, royalty: 0.88 },
  { id: 'atari-2600', label: 'Atari 2600', company: 'Atari', type: 'console', launch: { na: [1977, 8], eu: [1978, 0] }, endYear: 1992, royalty: 0.72 },
  { id: 'colecovision', label: 'ColecoVision', company: 'Coleco', type: 'console', launch: { na: [1982, 7], eu: [1983, 6] }, endYear: 1985, royalty: 0.7 },
  { id: 'famicom-nes', label: 'Famicom / NES', company: 'Nintendo', type: 'console', launch: { jp: [1983, 6, 15], na: [1985, 9, 18], eu: [1986, 8, 1] }, endYear: 1995, royalty: 0.68 },
  { id: 'master-system', label: 'Master System', company: 'Sega', type: 'console', launch: { jp: [1985, 9], na: [1986, 8], eu: [1987, 5] }, endYear: 1996, royalty: 0.7 },
  { id: 'atari-7800', label: 'Atari 7800', company: 'Atari', type: 'console', launch: { na: [1986, 4], eu: [1987, 0] }, endYear: 1992, royalty: 0.71 },
  { id: 'pc-engine', label: 'PC Engine / TurboGrafx-16', company: 'NEC / Hudson Soft', type: 'console', launch: { jp: [1987, 9], na: [1989, 7], eu: [1990, 0] }, endYear: 1994, royalty: 0.7 },
  { id: 'mega-drive', label: 'Mega Drive / Genesis', company: 'Sega', type: 'console', launch: { jp: [1988, 9, 29], na: [1989, 7, 14], eu: [1990, 10, 30] }, endYear: 1997, royalty: 0.7 },
  { id: 'game-boy', label: 'Game Boy', company: 'Nintendo', type: 'handheld', launch: { jp: [1989, 3, 21], na: [1989, 6, 31], eu: [1990, 8, 28] }, endYear: 2003, royalty: 0.66 },
  { id: 'neo-geo', label: 'Neo Geo AES', company: 'SNK', type: 'console', launch: { jp: [1990, 3], na: [1991, 6], eu: [1991, 6] }, endYear: 2004, royalty: 0.64 },
  { id: 'game-gear', label: 'Game Gear', company: 'Sega', type: 'handheld', launch: { jp: [1990, 9], na: [1991, 3], eu: [1991, 5] }, endYear: 1997, royalty: 0.66 },
  { id: 'snes', label: 'Super Famicom / SNES', company: 'Nintendo', type: 'console', launch: { jp: [1990, 10, 21], na: [1991, 7, 23], eu: [1992, 3, 11] }, endYear: 1999, royalty: 0.68 },
  { id: '3do', label: '3DO', company: 'The 3DO Company', type: 'console', launch: { na: [1993, 9], jp: [1994, 2], eu: [1994, 5] }, endYear: 1996, royalty: 0.74 },
  { id: 'jaguar', label: 'Atari Jaguar', company: 'Atari', type: 'console', launch: { na: [1993, 10], eu: [1994, 5] }, endYear: 1996, royalty: 0.74 },
  { id: 'saturn', label: 'Sega Saturn', company: 'Sega', type: 'console', launch: { jp: [1994, 10, 22], na: [1995, 4, 11], eu: [1995, 6, 8] }, endYear: 2000, royalty: 0.7 },
  { id: 'playstation', label: 'PlayStation', company: 'Sony', type: 'console', launch: { jp: [1994, 11, 3], na: [1995, 8, 9], eu: [1995, 8, 29] }, endYear: 2006, royalty: 0.72 },
  { id: 'nintendo-64', label: 'Nintendo 64', company: 'Nintendo', type: 'console', launch: { jp: [1996, 5, 23], na: [1996, 8, 29], eu: [1997, 2, 1] }, endYear: 2003, royalty: 0.67 },
  { id: 'game-boy-color', label: 'Game Boy Color', company: 'Nintendo', type: 'handheld', launch: { jp: [1998, 9], na: [1998, 10], eu: [1998, 10] }, endYear: 2003, royalty: 0.66 },
  { id: 'dreamcast', label: 'Dreamcast', company: 'Sega', type: 'console', launch: { jp: [1998, 10, 27], na: [1999, 8, 9], eu: [1999, 9, 14] }, endYear: 2001, royalty: 0.74 },
  { id: 'playstation-2', label: 'PlayStation 2', company: 'Sony', type: 'console', launch: { jp: [2000, 2, 4], na: [2000, 9, 26], eu: [2000, 10, 24] }, endYear: 2013, royalty: 0.72 },
  { id: 'game-boy-advance', label: 'Game Boy Advance', company: 'Nintendo', type: 'handheld', launch: { jp: [2001, 2, 21], na: [2001, 5, 11], eu: [2001, 5, 22] }, endYear: 2010, royalty: 0.67 },
  { id: 'gamecube', label: 'Nintendo GameCube', company: 'Nintendo', type: 'console', launch: { jp: [2001, 8, 14], na: [2001, 10, 18], eu: [2002, 4, 3] }, endYear: 2007, royalty: 0.68 },
  { id: 'xbox', label: 'Xbox', company: 'Microsoft', type: 'console', launch: { na: [2001, 10, 15], jp: [2002, 1, 22], eu: [2002, 2, 14] }, endYear: 2009, royalty: 0.72 },
  { id: 'nintendo-ds', label: 'Nintendo DS', company: 'Nintendo', type: 'handheld', launch: { na: [2004, 10, 21], jp: [2004, 11, 2], eu: [2005, 2, 11] }, endYear: 2013, royalty: 0.67 },
  { id: 'psp', label: 'PSP', company: 'Sony', type: 'handheld', launch: { jp: [2004, 11, 11], na: [2005, 2, 24], eu: [2005, 8, 1] }, endYear: 2014, royalty: 0.69 },
  { id: 'xbox-360', label: 'Xbox 360', company: 'Microsoft', type: 'console', launch: { na: [2005, 10, 22], eu: [2005, 11, 2], jp: [2005, 11, 10] }, endYear: 2016, royalty: 0.72 },
  { id: 'playstation-3', label: 'PlayStation 3', company: 'Sony', type: 'console', launch: { jp: [2006, 10, 11], na: [2006, 10, 17], eu: [2007, 2, 23] }, endYear: 2017, royalty: 0.72 },
  { id: 'wii', label: 'Wii', company: 'Nintendo', type: 'console', launch: { na: [2006, 10, 19], jp: [2006, 11, 2], eu: [2006, 11, 8] }, endYear: 2013, royalty: 0.68 },
  { id: 'mobile', label: 'Mobile', company: 'Ecossistema aberto', type: 'mobile', launch: { global: [2007, 5] }, endYear: 9999, royalty: 0.7 },
  { id: 'nintendo-3ds', label: 'Nintendo 3DS', company: 'Nintendo', type: 'handheld', launch: { jp: [2011, 1, 26], eu: [2011, 2, 25], na: [2011, 2, 27] }, endYear: 2020, royalty: 0.67 },
  { id: 'ps-vita', label: 'PlayStation Vita', company: 'Sony', type: 'handheld', launch: { jp: [2011, 11, 17], na: [2012, 1, 22], eu: [2012, 1, 22] }, endYear: 2019, royalty: 0.69 },
  { id: 'wii-u', label: 'Wii U', company: 'Nintendo', type: 'console', launch: { na: [2012, 10, 18], eu: [2012, 10, 30], jp: [2012, 11, 8] }, endYear: 2017, royalty: 0.7 },
  { id: 'playstation-4', label: 'PlayStation 4', company: 'Sony', type: 'console', launch: { na: [2013, 10, 15], eu: [2013, 10, 29], jp: [2014, 1, 22] }, endYear: 2025, royalty: 0.72 },
  { id: 'xbox-one', label: 'Xbox One', company: 'Microsoft', type: 'console', launch: { global: [2013, 10, 22] }, endYear: 2020, royalty: 0.72 },
  { id: 'switch', label: 'Nintendo Switch', company: 'Nintendo', type: 'hybrid', launch: { global: [2017, 2, 3] }, endYear: 9999, royalty: 0.68 },
  { id: 'playstation-5', label: 'PlayStation 5', company: 'Sony', type: 'console', launch: { jp: [2020, 10, 12], na: [2020, 10, 12], eu: [2020, 10, 19], global: [2020, 10, 19] }, endYear: 9999, royalty: 0.72 },
  { id: 'xbox-series', label: 'Xbox Series X|S', company: 'Microsoft', type: 'console', launch: { global: [2020, 10, 10] }, endYear: 9999, royalty: 0.72 },
]

export const firstLaunch = platform => Object.values(platform.launch).sort(([yearA, monthA], [yearB, monthB]) => yearA - yearB || monthA - monthB)[0]
export const platformUnlockYear = platform => firstLaunch(platform)[0]
export const platformAtDate = (platform, date) => {
  const [year, month] = firstLaunch(platform)
  return (date.year > year || (date.year === year && date.month >= month)) && date.year <= platform.endYear
}
export const regionDate = value => value ? `${value[2] ? `${String(value[2]).padStart(2, '0')}/` : ''}${String(value[1] + 1).padStart(2, '0')}/${value[0]}` : '—'

PLATFORM_HISTORY.forEach(platform => { platform.unlockYear = platformUnlockYear(platform) })
