import fs from 'node:fs'

const [kind = 'patch', ...words] = process.argv.slice(2)
if (!['major', 'minor', 'patch'].includes(kind)) {
  console.error('Use: npm run version -- patch|minor|major "descrição"')
  process.exit(1)
}

const versionInfo = JSON.parse(fs.readFileSync('version.json', 'utf8'))
const packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const writeVersionModule = info => fs.writeFileSync('src/version.js', `export const VERSION_INFO = Object.freeze(${JSON.stringify(info, null, 2)})\n`)
const parts = versionInfo.version.split('.').map(Number)
const index = { major: 0, minor: 1, patch: 2 }[kind]
parts[index] += 1
for (let i = index + 1; i < parts.length; i += 1) parts[i] = 0

const next = parts.join('.')
versionInfo.version = next
versionInfo.releasedAt = new Date().toISOString().slice(0, 10)
packageInfo.version = next
fs.writeFileSync('version.json', `${JSON.stringify(versionInfo, null, 2)}\n`)
fs.writeFileSync('package.json', `${JSON.stringify(packageInfo, null, 2)}\n`)
writeVersionModule(versionInfo)

const description = words.join(' ').trim() || 'Alterações ainda não descritas.'
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
const marker = changelog.indexOf('\n## ')
const entry = `\n## ${next} — ${versionInfo.codename} — ${versionInfo.releasedAt}\n\n- ${description}\n`
fs.writeFileSync('CHANGELOG.md', `${changelog.slice(0, marker)}${entry}${changelog.slice(marker)}`)
console.log(`Gamebobo ${next}`)
