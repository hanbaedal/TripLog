import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { ImagePicker } from './ImagePicker'
import { GalleryTaxonomyFields } from './GalleryTaxonomyFields'
import { isSupervisor } from '../lib/auth'
import { canEditGallery, listGallery, removeGalleryPhoto, saveGalleryPhoto } from '../lib/community'
import { galleryMediaSrc, loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
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
        <article className="info-card gallery-manage-card" key={photo.id}>
          <button type="button" className="gallery-manage-open" onClick={() => onEdit(photo)}>
            <div className="gallery-card-thumb">
              <img src={galleryMediaSrc(photo.src)} alt={photo.title} loading="lazy" />
            </div>
            <h3>{photo.title}</h3>
            <p className="muted">{photoTaxonomyLabel(photo)}</p>
          </button>
          <div className="nav-actions">
            <button className="btn ghost" type="button" onClick={() => onEdit(photo)}>
              수정
            </button>
            {!photo.catalog || allowCatalogDelete ? (
              <button
                className="btn ghost"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void onRemove(photo.id)
                }}
              >
                삭제
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

type PhotoFormValues = {
  title: string
  photoId: string
  pendingSrc?: string
  city: string
  category: GalleryCategory | ''
  sightType: SightType | ''
  asCatalog: boolean
}

function GalleryPhotoForm({
  values,
  onChange,
  user,
  supervisor,
  editing,
  busy,
  error,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  values: PhotoFormValues
  onChange: (patch: Partial<PhotoFormValues>) => void
  user: SiteNav['user']
  supervisor: boolean
  editing?: GalleryPhoto | null
  busy: boolean
  error: string
  onSubmit: (e: FormEvent) => void
  onCancel?: () => void
  submitLabel: string
}) {
  const uploadMeta = useMemo(() => {
    if (!values.city || !values.category) return undefined
    return {
      city: values.city,
      category: values.category,
      sightType: (values.category === 'sight' ? values.sightType || 'town' : '') as SightType | '',
    }
  }, [values.city, values.category, values.sightType])

  return (
    <form className="board-form gallery-write-form gallery-write-compact" onSubmit={(e) => void onSubmit(e)}>
      <div className="gallery-write-grid">
        <ImagePicker
          photoId={values.photoId}
          pendingSrc={values.pendingSrc}
          deferUpload
          compact
          onChange={(photoId, pending) => {
            if (pending === null) onChange({ photoId, pendingSrc: undefined })
            else if (pending?.src) onChange({ photoId, pendingSrc: pending.src })
            else onChange({ photoId })
          }}
          user={user}
          defaultTitle={values.title}
          disabled={busy}
          scope={supervisor ? 'all' : 'mine'}
          uploadMeta={uploadMeta}
        />
        <div className="gallery-write-meta">
          <GalleryTaxonomyFields
            compact
            city={values.city}
            category={values.category}
            sightType={values.sightType}
            onCity={(city) => onChange({ city })}
            onCategory={(category) => {
              onChange({ category, sightType: category === 'sight' ? values.sightType : '' })
            }}
            onSightType={(sightType) => onChange({ sightType })}
            disabled={busy}
          />
          <label className="gallery-write-title">
            사진 제목
            <input
              value={values.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="예: 만리장성 전경"
              required
            />
          </label>
          {supervisor && !editing ? (
            <label className="check-row gallery-write-catalog">
              <input
                type="checkbox"
                checked={values.asCatalog}
                onChange={(e) => onChange({ asCatalog: e.target.checked })}
                disabled={busy}
              />
              카탈로그 사진으로 등록
            </label>
          ) : null}
        </div>
      </div>
      {error ? <p className="gallery-write-error">{error}</p> : null}
      <div className={onCancel ? 'modal-actions gallery-write-actions' : 'nav-actions gallery-write-actions'}>
        {onCancel ? (
          <button className="btn ghost" type="button" onClick={onCancel} disabled={busy}>
            취소
          </button>
        ) : null}
        <button className="btn" type="submit" disabled={busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

const EMPTY_FORM: PhotoFormValues = {
  title: '',
  photoId: '',
  city: '',
  category: '',
  sightType: '',
  asCatalog: false,
}

export function GalleryWritePage({ editPhotoId, ...nav }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [register, setRegister] = useState<PhotoFormValues>(EMPTY_FORM)
  const [registerBusy, setRegisterBusy] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [editForm, setEditForm] = useState<PhotoFormValues>(EMPTY_FORM)
  const [editBusy, setEditBusy] = useState(false)
  const [editError, setEditError] = useState('')
  const supervisor = isSupervisor(nav.user)

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    void loadGalleryPhotos().then(setPhotos)
  }, [nav.user])

  const editable = useMemo(
    () => photos.filter((photo) => canEditGallery(photo, nav.user)),
    [photos, nav.user],
  )

  const catalogPhotos = useMemo(() => editable.filter((photo) => photo.catalog), [editable])
  const memberPhotos = useMemo(() => editable.filter((photo) => !photo.catalog), [editable])

  function photoToForm(photo: GalleryPhoto): PhotoFormValues {
    return {
      title: photo.title,
      photoId: photo.id,
      pendingSrc: undefined,
      city: photo.city || '',
      category: photo.category || '',
      sightType: photo.sightType || '',
      asCatalog: Boolean(photo.catalog),
    }
  }

  function startEdit(photo: GalleryPhoto) {
    setEditing(photo)
    setEditForm(photoToForm(photo))
    setEditError('')
  }

  useEffect(() => {
    if (!editPhotoId || !photos.length || !nav.user) return
    const photo = photos.find((row) => row.id === editPhotoId)
    if (photo && canEditGallery(photo, nav.user)) startEdit(photo)
  }, [editPhotoId, photos, nav.user])

  function closeEdit() {
    setEditing(null)
    setEditForm(EMPTY_FORM)
    setEditError('')
  }

  async function persistPhoto(
    values: PhotoFormValues,
    target: GalleryPhoto | null,
    setBusy: (busy: boolean) => void,
    setError: (message: string) => void,
    onDone: () => void,
  ) {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!values.title.trim() || (!values.photoId && !values.pendingSrc) || !values.city || !values.category) {
      setError('제목, 도시, 분류, 사진이 필요합니다.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const src = values.pendingSrc?.trim() || resolvePhotoSrc(values.photoId, photos)
      if (!src) {
        setError('갤러리에서 사진을 선택해 주세요.')
        return
      }
      const existing =
        target ??
        (values.photoId
          ? photos.find((row) => row.id === values.photoId && canEditGallery(row, nav.user))
          : undefined)
      const saved = await saveGalleryPhoto({
        id: existing?.id || '',
        title: values.title.trim(),
        src,
        city: values.city,
        category: values.category,
        sightType: values.category === 'sight' ? values.sightType || 'town' : undefined,
        ownerId: target?.ownerId || nav.user.id,
        ownerName: target?.ownerName || nav.user.name,
        catalog: supervisor ? Boolean(target?.catalog || values.asCatalog) : undefined,
        at: target?.at,
      })
      const rows = await listGallery()
      setPhotos(rows.some((row) => row.id === saved.id) ? rows : [...rows, saved])
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  async function submitRegister(e: FormEvent) {
    e.preventDefault()
    await persistPhoto(register, null, setRegisterBusy, setRegisterError, () => {
      setRegister(EMPTY_FORM)
    })
  }

  async function submitEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    await persistPhoto(editForm, editing, setEditBusy, setEditError, closeEdit)
  }

  async function remove(id: string) {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    await removeGalleryPhoto(id)
    setPhotos(await listGallery())
    if (editing?.id === id) closeEdit()
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>{supervisor ? '카탈로그 관리' : '갤러리 등록'}</h2>
          <button className="btn ghost" type="button" onClick={() => nav.go.gallery()}>
            갤러리
          </button>
        </div>
        {supervisor ? (
          <p className="muted gallery-write-note">
            목록에서 사진을 누르면 수정합니다. 새 사진은 아래 폼에서 등록합니다.
          </p>
        ) : (
          <p className="muted gallery-write-note">도시·분류·제목·사진을 입력한 뒤 등록합니다.</p>
        )}
        <GalleryPhotoForm
          values={register}
          onChange={(patch) => setRegister((prev) => ({ ...prev, ...patch }))}
          user={nav.user}
          supervisor={supervisor}
          busy={registerBusy}
          error={registerError}
          onSubmit={submitRegister}
          submitLabel="등록"
        />

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

      {editing ? (
        <div className="modal-back" onClick={closeEdit} role="presentation">
          <div
            className="modal gallery-edit-modal gallery-write-compact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="gallery-edit-title">사진 수정</h2>
            <p className="muted">{editing.title}</p>
            <GalleryPhotoForm
              values={editForm}
              onChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
              user={nav.user}
              supervisor={supervisor}
              editing={editing}
              busy={editBusy}
              error={editError}
              onSubmit={submitEdit}
              onCancel={closeEdit}
              submitLabel="저장"
            />
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
