import { useEffect, useMemo, useRef, useState } from 'react'
import type { ItemKind } from '../types'
import {
  buildGalleryFilter,
  filteredPickablePhotos,
  loadGalleryPhotos,
  resolvePhotoSrc,
  uploadGalleryImage,
  type GalleryFilter,
  type GalleryUploadMeta,
} from '../lib/galleryResolve'
import { photoTaxonomyLabel } from '../lib/galleryFilter'
import {
  galleryCategoryLabel,
  galleryCityLabel,
  sightTypeLabel,
} from '../data/galleryTaxonomy.js'
import type { GalleryPhoto, User } from '../types'

type Props = {
  photoId: string
  onChange: (photoId: string) => void
  user: User | null
  label?: string
  defaultTitle?: string
  disabled?: boolean
  scope?: 'default' | 'mine' | 'all'
  uploadMeta?: GalleryUploadMeta
  filter?: GalleryFilter
  itemKind?: ItemKind
  tripDestination?: string
  itemTitle?: string
}

export function ImagePicker({
  photoId,
  onChange,
  user,
  label = '사진',
  defaultTitle,
  disabled,
  scope = 'default',
  uploadMeta,
  filter: filterProp,
  itemKind,
  tripDestination,
  itemTitle,
}: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filter = useMemo(
    () => filterProp ?? buildGalleryFilter({ itemKind, tripDestination, itemTitle }),
    [filterProp, itemKind, tripDestination, itemTitle],
  )

  useEffect(() => {
    void loadGalleryPhotos().then(setPhotos)
  }, [])

  const { items: choices, relaxed } = useMemo(
    () => filteredPickablePhotos(photos, user, scope, filter),
    [photos, user, scope, filter],
  )
  const preview = resolvePhotoSrc(photoId, photos)

  async function onPc(file: File | undefined) {
    if (!file || disabled) return
    if (!user) {
      setError('로그인 후 PC에서 사진을 올릴 수 있습니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const meta = uploadMeta ?? { city: 'dalian', category: 'sight' as const }
      const saved = await uploadGalleryImage(file, user, defaultTitle, meta)
      const rows = await loadGalleryPhotos()
      setPhotos(rows)
      onChange(saved.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진을 올리지 못했습니다.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function pick(id: string) {
    onChange(id)
    setOpen(false)
    setError('')
  }

  const pcDisabled = disabled || busy || !user || (scope === 'mine' && (!uploadMeta?.city || !uploadMeta?.category))

  return (
    <div className="image-picker">
      <span className="image-picker-label">{label}</span>
      {preview ? <img className="gallery-preview" src={preview} alt="" /> : null}
      <div className="nav-actions image-picker-actions">
        <button className="btn ghost" type="button" disabled={pcDisabled} onClick={() => fileRef.current?.click()}>
          PC에서 선택
        </button>
        <button className="btn ghost" type="button" disabled={disabled || busy} onClick={() => setOpen(true)}>
          갤러리에서 선택
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void onPc(e.target.files?.[0])}
      />
      {error ? <p className="muted">{error}</p> : null}
      {!user ? <p className="muted">PC 업로드는 로그인 후 이용할 수 있습니다.</p> : null}
      {scope === 'mine' && user && (!uploadMeta?.city || !uploadMeta?.category) ? (
        <p className="muted">PC 업로드 전에 도시와 분류를 선택해 주세요.</p>
      ) : null}

      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)} role="presentation">
          <div className="modal image-picker-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>갤러리에서 선택</h3>
            {filter && (filter.city || filter.category) ? (
              <p className="muted image-picker-filter-note">
                {relaxed ? '맞는 사진이 적어 범위를 넓혔습니다. ' : '추천: '}
                {filter.city ? galleryCityLabel(filter.city) : '전체 도시'}
                {' · '}
                {filter.category ? galleryCategoryLabel(filter.category) : '전체 분류'}
                {filter.sightType ? ` · ${sightTypeLabel(filter.sightType)}` : ''}
              </p>
            ) : null}
            <div className="image-picker-grid">
              {choices.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={photo.id === photoId ? 'image-picker-cell on' : 'image-picker-cell'}
                  onClick={() => pick(photo.id)}
                >
                  <div className="image-picker-cell-thumb">
                    <img src={photo.src} alt={photo.title} />
                  </div>
                  <span>{photo.title}</span>
                  <small>{photoTaxonomyLabel(photo)}</small>
                </button>
              ))}
            </div>
            <div className="nav-actions">
              <button className="btn ghost" type="button" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
