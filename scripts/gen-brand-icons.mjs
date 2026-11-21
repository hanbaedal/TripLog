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

/** 탭·북마크에서 로고가 더 크게 보이도록 안쪽을 살짝 확대(여백·테두리 크롭) */
const FAVICON_ZOOM = 1.22

async function circlePngBuffer(size, zoom = FAVICON_ZOOM) {
  const r = size / 2
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  )
  const scaled = Math.max(size, Math.round(size * zoom))
  const crop = Math.max(0, Math.floor((scaled - size) / 2))
  return sharp(source)
    .resize(scaled, scaled, { fit: 'cover', position: 'centre' })
    .extract({ left: crop, top: crop, width: size, height: size })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

/** 헤더 등 UI — 원본 비율에 가깝게(줌 없음) */
async function circlePngBufferUi(size) {
  return circlePngBuffer(size, 1)
}

async function circleSvgFromPng(pngBuffer, viewSize = 512) {
  const b64 = pngBuffer.toString('base64')
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}">
  <image href="data:image/png;base64,${b64}" width="${viewSize}" height="${viewSize}" preserveAspectRatio="xMidYMid slice"/>
</svg>`
  return svg
}

async function main() {
  const icon512 = await circlePngBuffer(512)
  const icon48 = await circlePngBuffer(48)
  const icon32 = await circlePngBuffer(32)
  const icon180 = await circlePngBuffer(180)
  const icon112 = await circlePngBufferUi(112)

  await fs.writeFile(path.join(brandDir, 'favicon.svg'), await circleSvgFromPng(icon512))
  await fs.writeFile(path.join(publicDir, 'favicon.svg'), await circleSvgFromPng(icon512))
  await fs.writeFile(path.join(brandDir, 'favicon-48.png'), icon48)
  await fs.writeFile(path.join(brandDir, 'favicon-32.png'), icon32)
  await fs.writeFile(path.join(brandDir, 'apple-touch-icon.png'), icon180)
  await fs.writeFile(path.join(brandDir, 'logo.png'), icon112)

  console.log('brand icons updated (transparent, zoom', FAVICON_ZOOM, ')')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})