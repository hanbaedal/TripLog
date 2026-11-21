/**
 * public/brand/haesu.jpg → 원형 · 배경 투명 favicon.svg · PNG 아이콘
 * 로고 이미지 교체 후: npm run gen:brand-icons
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const brandDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'brand')
const publicDir = path.join(brandDir, '..')
const source = path.join(brandDir, 'haesu.jpg')

async function circlePngBuffer(size) {
  const r = size / 2
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  )
  return sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

async function circleSvgFromPng(pngBuffer, viewSize = 512) {
  const b64 = pngBuffer.toString('base64')
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}">
  <image href="data:image/png;base64,${b64}" width="${viewSize}" height="${viewSize}" preserveAspectRatio="xMidYMid meet"/>
</svg>`
  return svg
}

async function main() {
  const icon512 = await circlePngBuffer(512)
  const icon32 = await circlePngBuffer(32)
  const icon180 = await circlePngBuffer(180)
  const icon96 = await circlePngBuffer(96)

  await fs.writeFile(path.join(brandDir, 'favicon.svg'), await circleSvgFromPng(icon512))
  await fs.writeFile(path.join(publicDir, 'favicon.svg'), await circleSvgFromPng(icon512))
  await fs.writeFile(path.join(brandDir, 'favicon-32.png'), icon32)
  await fs.writeFile(path.join(brandDir, 'apple-touch-icon.png'), icon180)
  await fs.writeFile(path.join(brandDir, 'logo.png'), icon96)

  console.log('brand icons updated (transparent) in public/brand/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})