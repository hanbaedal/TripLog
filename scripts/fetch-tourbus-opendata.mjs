import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '../src/data/krTourBusOpenData.json')
const key = process.env.DATA_GO_KR_SERVICE_KEY || process.env.ODCLOUD_SERVICE_KEY
const uddi = process.env.TOURBUS_ODCLOUD_UDDI || 'adfd55ce-4a6e-4795-877d-83d8258444c6'

if (!key) {
  console.error('Set DATA_GO_KR_SERVICE_KEY to refresh open data snapshot.')
  process.exit(1)
}

const url = new URL(`https://api.odcloud.kr/api/15025456/v1/uddi:${uddi}`)
url.searchParams.set('serviceKey', key)
url.searchParams.set('page', '1')
url.searchParams.set('perPage', '5000')
url.searchParams.set('returnType', 'JSON')

const res = await fetch(url)
const body = await res.json()
if (!body.data?.length) {
  console.error('No data returned', body)
  process.exit(1)
}
fs.writeFileSync(out, JSON.stringify(body.data, null, 0))
console.log(`Wrote ${body.data.length} rows to ${out}`)
