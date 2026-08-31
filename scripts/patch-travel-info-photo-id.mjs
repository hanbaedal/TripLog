import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/travelInfoCatalog.js', import.meta.url)
let text = readFileSync(path, 'utf8')
text = text.replace(/id: '(info-[^']+)',\n/g, (match, id) => {
  const photoId = id.replace(/^info-/, '')
  return `${match}    photoId: '${photoId}',\n`
})
writeFileSync(path, text)
console.log('travelInfoCatalog photoId added')
