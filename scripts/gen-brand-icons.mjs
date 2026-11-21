/**
 * public/brand/haesu.jpg → 원형 favicon.svg · favicon-32.png · apple-touch-icon.png
 * 로고 이미지 교체 후: node scripts/gen-brand-icons.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const brandDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brand')
const source = path.join(brandDir, 'haesu.jpg')

async function circlePng(size, outName) {
  const r = size / 2
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  )
  await sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(path.join(brandDir, outName))
}

async function circleSvg() {
  const jpg = await fs.readFile(source)
  const b64 = jpg.toString('base64')
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><clipPath id="c"><circle cx="256" cy="256" r="256"/></clipPath></defs>
  <image href="data:image/jpeg;base64,${b64}" width="512" height="512" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>
</svg>`
  await fs.writeFile(path.join(brandDir, 'favicon.svg'), svg)
}

async function main() {
  await circleSvg()
  await circlePng(32, 'favicon-32.png')
  await circlePng(180, 'apple-touch-icon.png')
  console.log('brand icons updated in public/brand/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})