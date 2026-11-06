// r(id, título, estúdio, rival ou null, ano, mês 0-11, gênero, tema, nota 0-10, cópias em milhões, plataforma, puxa a moda?)
export const r = (id, title, studio, rivalId, year, month, genre, theme, score, copies, platform, trend = false) => ({ id, title, studio, rivalId, year, month, genre, theme, score, copies, platform, trend })
