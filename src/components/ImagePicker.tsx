import { useEffect, useMemo, useRef, useState } from 'react'
import {
  loadGalleryPhotos,
  pickableGalleryPhotos,
  resolvePhotoSrc,
  uploadGalleryImage,
} from '../lib/galleryResolve'
import type { GalleryPhoto, User } from '../types'

type Props = {
  photoId: string
  onChange: (photoId: string) => void
  user: User | null
  label?: string
  defaultTitle?: string
  disabled?: boolean
  scope?: 'default' | 'mine' | 'all'
}

export function ImagePicker({ photoId, onChange, user, label = '사진', defaultTitle, disabled, scope = 'default' }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void loadGalleryPhotos().then(setPhotos)
  }, [])

  const choices = useMemo(() => pickableGalleryPhotos(photos, user, scope), [photos, user, scope])
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
      const saved = await uploadGalleryImage(file, user, defaultTitle)
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

  return (
    <div className="image-picker">
      <span className="image-picker-label">{label}</span>
      {preview ? <img className="gallery-preview" src={preview} alt="" /> : null}
      <div className="nav-actions image-picker-actions">
        <button
          className="btn ghost"
          type="button"
          disabled={disabled || busy || !user}
          onClick={() => fileRef.current?.click()}
        >
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

      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)} role="presentation">
          <div className="modal image-picker-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>갤러리에서 선택</h3>
            <div className="image-picker-grid">
              {choices.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={photo.id === photoId ? 'image-picker-cell on' : 'image-picker-cell'}
                  onClick={() => pick(photo.id)}
                >
                  <img src={photo.src} alt={photo.title} />
                  <span>{photo.title}</span>
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
