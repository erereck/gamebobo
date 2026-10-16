import { eraAt } from '../../game/data/economy.js'
import { genreById, themeById } from '../../game/data/genres.js'
import { topPillar } from '../../game/engine/staff.js'
import { isRemote, projectOfTeam, teamOf } from '../../game/engine/teams.js'

export function officeView(state) {
  const era = eraAt(state.year)
  const topics = []
  for (const project of state.projects) {
    if (project.kind === 'game') topics.push(genreById(project.genre)?.icon, themeById(project.theme)?.icon)
  }
  if (state.projects.length) topics.push('bug')
  if (state.games.length) topics.push('trophy', 'chart')
  if (state.money < 0) topics.push('money', 'storm')
  const staff = state.staff.filter(person => !isRemote(state, person)).map(person => {
    const project = projectOfTeam(state, teamOf(person))
    const working = Boolean(project && !project.ready)
    return {
      id: person.id,
      name: person.name,
      look: person.look,
      founder: person.founder,
      trait: person.trait,
      energy: person.energy,
      status: person.status,
      top: topPillar(person),
      working,
      pace: working ? project.pace : 'normal',
    }
  })
  return {
    office: state.office,
    era,
    year: state.year,
    month: Math.floor(state.week / 4) % 12,
    decor: state.decor,
    studioName: state.studio.name,
    staff,
    working: staff.some(person => person.working),
    crunch: staff.some(person => person.working && person.pace === 'crunch'),
    ideas: state.ideas.map(idea => idea.staffId),
    visitor: Boolean(state.visitor),
    couples: state.couples ?? [],
    posters: [...state.games].sort((a, b) => b.score - a.score).slice(0, 6),
    trophies: state.trophies.length,
    topics: topics.filter(Boolean),
    sound: state.settings.sound,
  }
}
