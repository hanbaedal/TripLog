import { useEffect, useState } from 'react'
import { listGallery } from '../lib/community'
import { galleryMediaSrc } from '../lib/galleryResolve'
import type { GalleryPhoto, Market } from '../types'

type Props = {
  market?: Market
  onOpen: (photoId: string) => void
}

export function GalleryHero({ market = 'cn', onOpen }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    void listGallery(market).then(setPhotos)
    setIndex(0)
  }, [market])

  useEffect(() => {
    if (photos.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((cur) => (cur + 1) % photos.length)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [photos.length])

  const photo = photos[index]
  if (!photo) return null

  return (
    <button type="button" className="gallery-hero" onClick={() => onOpen(photo.id)}>
      {photos.map((row, i) => (
        <img
          key={row.id}
          src={galleryMediaSrc(row.src)}
          alt={row.title}
          className={i === index ? 'is-on' : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
      <span className="gallery-hero-label">{photo.title}</span>
    </button>
  )
}
