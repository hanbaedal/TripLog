import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { ImagePicker } from './ImagePicker'
import { GalleryTaxonomyFields } from './GalleryTaxonomyFields'
import { isSupervisor } from '../lib/auth'
import { canEditGallery, listGallery, removeGalleryPhoto, saveGalleryPhoto } from '../lib/community'
import { loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
import { photoTaxonomyLabel } from '../lib/galleryFilter'
import type { GalleryCategory, GalleryPhoto, SightType } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  editPhotoId?: string | null
}

function EditableGalleryList({
  photos,
  allowCatalogDelete,
  onEdit,
  onRemove,
}: {
  photos: GalleryPhoto[]
  allowCatalogDelete?: boolean
  onEdit: (photo: GalleryPhoto) => void
  onRemove: (id: string) => void
}) {
  if (!photos.length) return <p className="muted">수정할 사진이 없습니다.</p>
  return (
    <div className="gallery-mine">
      {photos.map((photo) => (
        <article className="info-card" key={photo.id}>
          <img className="gallery-preview" src={photo.src} alt={photo.title} />
          <h3>{photo.title}</h3>
          <p className="muted">{photoTaxonomyLabel(photo)}</p>
          <div className="nav-actions">
            <button className="btn ghost" type="button" onClick={() => onEdit(photo)}>
              수정
            </button>
            {!photo.catalog || allowCatalogDelete ? (
              <button className="btn ghost" type="button" onClick={() => void onRemove(photo.id)}>
                삭제
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

export function GalleryWritePage({ editPhotoId, ...nav }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [title, setTitle] = useState('')
  const [photoId, setPhotoId] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState<GalleryCategory | ''>('')
  const [sightType, setSightType] = useState<SightType | ''>('')
  const [asCatalog, setAsCatalog] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const supervisor = isSupervisor(nav.user)

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    void loadGalleryPhotos().then(setPhotos)
  }, [nav.user])

  const uploadMeta = useMemo(() => {
    if (!city || !category) return undefined
    return {
      city,
      category,
      sightType: (category === 'sight' ? sightType || 'other' : '') as SightType | '',
    }
  }, [city, category, sightType])

  const editable = useMemo(
    () => photos.filter((photo) => canEditGallery(photo, nav.user)),
    [photos, nav.user],
  )

  const catalogPhotos = useMemo(() => editable.filter((photo) => photo.catalog), [editable])
  const memberPhotos = useMemo(() => editable.filter((photo) => !photo.catalog), [editable])

  function startEdit(photo: GalleryPhoto) {
    setEditing(photo)
    setTitle(photo.title)
    setPhotoId(photo.id)
    setCity(photo.city || '')
    setCategory(photo.category || '')
    setSightType(photo.sightType || '')
    setAsCatalog(Boolean(photo.catalog))
    setError('')
  }

  useEffect(() => {
    if (!editPhotoId || !photos.length || !nav.user) return
    const photo = photos.find((row) => row.id === editPhotoId)
    if (photo && canEditGallery(photo, nav.user)) startEdit(photo)
  }, [editPhotoId, photos, nav.user])

  function reset() {
    setEditing(null)
    setTitle('')
    setPhotoId('')
    setCity('')
    setCategory('')
    setSightType('')
    setAsCatalog(false)
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!title.trim() || !photoId || !city || !category) {
      setError('제목, 도시, 분류, 사진이 필요합니다.')
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
        id: editing?.id || '',
        title: title.trim(),
        src,
        city,
        category,
        sightType: category === 'sight' ? sightType || 'other' : undefined,
        ownerId: editing?.ownerId || nav.user.id,
        ownerName: editing?.ownerName || nav.user.name,
        catalog: supervisor ? Boolean(editing?.catalog || asCatalog) : undefined,
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
        {supervisor ? (
          <p className="muted gallery-write-note">
            슈퍼바이저(해수)는 카탈로그 사진의 제목·분류·이미지를 수정할 수 있습니다.
          </p>
        ) : null}
        <form className="board-form gallery-write-form" onSubmit={(e) => void submit(e)}>
          <GalleryTaxonomyFields
            city={city}
            category={category}
            sightType={sightType}
            onCity={setCity}
            onCategory={(value) => {
              setCategory(value)
              if (value !== 'sight') setSightType('')
            }}
            onSightType={setSightType}
            disabled={busy}
          />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="사진 제목" required />
          {supervisor && !editing ? (
            <label className="check-row">
              <input
                type="checkbox"
                checked={asCatalog}
                onChange={(e) => setAsCatalog(e.target.checked)}
                disabled={busy}
              />
              카탈로그 사진으로 등록
            </label>
          ) : null}
          <ImagePicker
            photoId={photoId}
            onChange={setPhotoId}
            user={nav.user}
            defaultTitle={title}
            disabled={busy}
            scope={supervisor ? 'all' : 'mine'}
            uploadMeta={uploadMeta}
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

        {supervisor ? (
          <>
            <div className="section-head">
              <h2>카탈로그 사진</h2>
              <span className="muted">{catalogPhotos.length}장</span>
            </div>
            <EditableGalleryList photos={catalogPhotos} allowCatalogDelete onEdit={startEdit} onRemove={remove} />
            <div className="section-head">
              <h2>회원 사진</h2>
              <span className="muted">{memberPhotos.length}장</span>
            </div>
            <EditableGalleryList photos={memberPhotos} onEdit={startEdit} onRemove={remove} />
          </>
        ) : (
          <>
            <div className="section-head">
              <h2>내가 올린 사진</h2>
            </div>
            <EditableGalleryList photos={memberPhotos} onEdit={startEdit} onRemove={remove} />
          </>
        )}
      </section>
    </PageShell>
  )
}
