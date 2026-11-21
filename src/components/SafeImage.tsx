import { useEffect, useState } from 'react'
import { galleryMediaSrc } from '../lib/galleryResolve'

type Props = {
  src?: string | null
  alt?: string
  className?: string
  fallbackSrc?: string
  missingClassName?: string
}

/** 깨진 /uploads 등 로드 실패 시 폴백·플레이스홀더로 대체한다. */
export function SafeImage({
  src,
  alt = '',
  className,
  fallbackSrc,
  missingClassName = 'safe-image-missing',
}: Props) {
  const primary = galleryMediaSrc(src)
  const fallback = galleryMediaSrc(fallbackSrc)
  const [display, setDisplay] = useState(primary || fallback)
  const [dead, setDead] = useState(false)

  useEffect(() => {
    setDisplay(primary || fallback)
    setDead(false)
  }, [primary, fallback])

  if (dead || !display) {
    return <div className={missingClassName} aria-hidden="true" />
  }

  return (
    <img
      className={className}
      src={display}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (fallback && display !== fallback) {
          setDisplay(fallback)
          return
        }
        setDead(true)
      }}
    />
  )
}
