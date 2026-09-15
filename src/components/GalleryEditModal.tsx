import { useState } from 'react'
import type { FormEvent } from 'react'
import { saveGalleryPhoto } from '../lib/community'
import { resolvePhotoSrc } from '../lib/galleryResolve'
import { isSupervisor } from '../lib/auth'
import { GalleryPhotoForm, photoToFormValues, type PhotoFormValues } from './GalleryPhotoForm'
import type { GalleryPhoto, Market, User } from '../types'

type Props = {
  photo: GalleryPhoto
  photos: GalleryPhoto[]
  user: User
  market: Market
  catalogMode?: boolean
  onClose: () => void
  onSaved: () => void
}

export function GalleryEditModal({ photo, photos, user, market, catalogMode = false, onClose, onSaved }: Props) {
  const supervisor = isSupervisor(user)
  const [form, setForm] = useState<PhotoFormValues>(() => photoToFormValues(photo))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || (!form.photoId && !form.pendingSrc) || !form.city || !form.category) {
      setError('제목, 도시, 분류, 사진이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const src = form.pendingSrc?.trim() || resolvePhotoSrc(form.photoId, photos)
      if (!src) {
        setError('갤러리에서 사진을 선택해 주세요.')
        return
      }
      await saveGalleryPhoto({
        id: photo.id,
        title: form.title.trim(),
        src,
        city: form.city,
        category: form.category,
        sightType: form.category === 'sight' ? form.sightType || 'town' : undefined,
        ownerId: photo.ownerId || user.id,
        ownerName: photo.ownerName || user.name,
        catalog: catalogMode ? true : supervisor ? Boolean(photo.catalog || form.asCatalog) : undefined,
        at: photo.at,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div
        className="modal gallery-edit-modal gallery-write-compact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="gallery-edit-title">사진 수정</h2>
        <p className="muted">{photo.title}</p>
        <GalleryPhotoForm
          values={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          user={user}
          supervisor={supervisor}
          catalogMode={catalogMode}
          market={market}
          editing={photo}
          busy={busy}
          error={error}
          onSubmit={submit}
          onCancel={onClose}
          submitLabel="저장"
        />
      </div>
    </div>
  )
}
