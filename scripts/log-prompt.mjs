import fs from 'node:fs'

const summary = process.argv.slice(2).join(' ').trim()
if (!summary) {
  console.error('Use: npm run prompt -- "resumo do pedido"')
  process.exit(1)
}

const versionInfo = JSON.parse(fs.readFileSync('version.json', 'utf8'))
const writeVersionModule = info => fs.writeFileSync('src/version.js', `export const VERSION_INFO = Object.freeze(${JSON.stringify(info, null, 2)})\n`)
const ids = versionInfo.promptIds.map(id => Number(id.replace('P-', '')))
const nextId = `P-${String(Math.max(0, ...ids) + 1).padStart(3, '0')}`
versionInfo.promptIds.push(nextId)
fs.writeFileSync('version.json', `${JSON.stringify(versionInfo, null, 2)}\n`)
writeVersionModule(versionInfo)

const prompts = fs.readFileSync('docs/PROMPTS.md', 'utf8')
const entry = `\n## ${nextId} — ${new Date().toISOString().slice(0, 10)} — A registrar\n\nPedido: ${summary}\n\nResultado: em andamento.\n`
const marker = prompts.indexOf('\n## ')
fs.writeFileSync('docs/PROMPTS.md', `${prompts.slice(0, marker)}${entry}${prompts.slice(marker)}`)
console.log(nextId)
