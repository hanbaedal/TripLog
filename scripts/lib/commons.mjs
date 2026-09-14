const API = 'https://commons.wikimedia.org/w/api.php'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url, retries = 4) {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url)
    if (res.status === 429) {
      await sleep(4000 * (i + 1))
      continue
    }
    if (!res.ok) throw new Error(`Commons API ${res.status}`)
    return res.json()
  }
  throw new Error('Commons API 429 (retries exhausted)')
}

export async function commonsThumbForFile(fileTitle, width = 960) {
  const title = fileTitle.startsWith('File:') ? fileTitle : `File:${fileTitle}`
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json`
  const data = await fetchJson(url)
  const page = Object.values(data.query?.pages || {})[0]
  if (!page || page.missing !== undefined) return null
  return page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || null
}

export async function commonsSearchThumb(query, width = 960) {
  const searchUrl = `${API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=1&format=json`
  const searchData = await fetchJson(searchUrl)
  const hit = searchData.query?.search?.[0]
  if (!hit?.title) return null
  return commonsThumbForFile(hit.title, width)
}

export async function downloadUrl(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download ${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf
}

export { sleep }
