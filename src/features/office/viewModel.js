import { eraAt } from '../../game/data/economy.js'
import { genreById, themeById } from '../../game/data/genres.js'
import { topPillar } from '../../game/engine/staff.js'

export function officeView(state) {
  const era = eraAt(state.year)
  const project = state.project
  const topics = []
  if (project?.kind === 'game') {
    topics.push(genreById(project.genre)?.icon, themeById(project.theme)?.icon, 'bug')
  }
  if (state.games.length) topics.push('trophy', 'chart')
  if (state.money < 0) topics.push('money', 'storm')
  return {
    office: state.office,
    era,
    decor: state.decor,
    studioName: state.studio.name,
    staff: state.staff.map(person => ({
      id: person.id,
      name: person.name,
      look: person.look,
      founder: person.founder,
      trait: person.trait,
      energy: person.energy,
      status: person.status,
      top: topPillar(person),
    })),
    working: Boolean(project && !project.ready),
    pace: project?.pace ?? 'normal',
    ideas: state.ideas.map(idea => idea.staffId),
    visitor: Boolean(state.visitor),
    couples: state.couples ?? [],
    posters: [...state.games].sort((a, b) => b.score - a.score).slice(0, 5),
    trophies: state.trophies.length,
    topics: topics.filter(Boolean),
    sound: state.settings.sound,
  }
}
