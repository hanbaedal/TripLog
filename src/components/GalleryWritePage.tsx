import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { ImagePicker } from './ImagePicker'
import { isSupervisor } from '../lib/auth'
import { canEditGallery, listGallery, removeGalleryPhoto, saveGalleryPhoto } from '../lib/community'
import { loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
import type { GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

export function GalleryWritePage(nav: SiteNav) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [title, setTitle] = useState('')
  const [photoId, setPhotoId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    void loadGalleryPhotos().then(setPhotos)
  }, [nav.user])

  const mine = useMemo(
    () => photos.filter((photo) => canEditGallery(photo, nav.user)),
    [photos, nav.user],
  )

  function startEdit(photo: GalleryPhoto) {
    setEditing(photo)
    setTitle(photo.title)
    setPhotoId(photo.id)
    setError('')
  }

  function reset() {
    setEditing(null)
    setTitle('')
    setPhotoId('')
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!title.trim() || !photoId) {
      setError('제목과 사진이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const src = resolvePhotoSrc(photoId, photos)
      if (!src) {
        setError('갤러리에서 사진을 선택해 주세요.')
        return
      }
      const saved = await saveGalleryPhoto({
        id: editing?.id || photoId,
        title: title.trim(),
        src,
        ownerId: nav.user.id,
        ownerName: nav.user.name,
        at: editing?.at,
      })
      const rows = await listGallery()
      setPhotos(rows.some((row) => row.id === saved.id) ? rows : [...rows, saved])
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    await removeGalleryPhoto(id)
    setPhotos(await listGallery())
    if (editing?.id === id) reset()
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>{editing ? '사진 수정' : '갤러리 등록'}</h2>
          <button className="btn ghost" type="button" onClick={() => nav.go.gallery()}>
            갤러리
          </button>
        </div>
        <form className="board-form" onSubmit={(e) => void submit(e)}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="사진 제목" required />
          <ImagePicker
            photoId={photoId}
            onChange={setPhotoId}
            user={nav.user}
            defaultTitle={title}
            disabled={busy}
            scope="mine"
          />
          <div className="nav-actions">
            <button className="btn" type="submit" disabled={busy}>
              {editing ? '수정' : '등록'}
            </button>
            {editing ? (
              <button className="btn ghost" type="button" onClick={reset}>
                취소
              </button>
            ) : null}
          </div>
          {error ? <p className="muted">{error}</p> : null}
        </form>

        <div className="section-head">
          <h2>{isSupervisor(nav.user) ? '회원 사진' : '내가 올린 사진'}</h2>
        </div>
        <div className="gallery-mine">
          {mine.map((photo) => (
            <article className="info-card" key={photo.id}>
              <img className="gallery-preview" src={photo.src} alt={photo.title} />
              <h3>{photo.title}</h3>
              <div className="nav-actions">
                <button className="btn ghost" type="button" onClick={() => startEdit(photo)}>
                  수정
                </button>
                <button className="btn ghost" type="button" onClick={() => void remove(photo.id)}>
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
