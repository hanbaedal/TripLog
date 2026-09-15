import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { ImagePicker } from './ImagePicker'
import { GalleryTaxonomyFields } from './GalleryTaxonomyFields'
import { isSupervisor } from '../lib/auth'
import { canEditGallery, listGallery, removeGalleryPhoto, saveGalleryPhoto } from '../lib/community'
import { galleryPhotoMarket, MARKET_SHORT } from '../lib/market'
import type { Market } from '../types'
import { loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
import { GalleryManageCardList } from './GalleryManageCardList'
import type { GalleryCategory, GalleryPhoto, SightType } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  editPhotoId?: string | null
  pageMode?: 'catalog' | 'upload'
  onEditClose?: () => void
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
  catalogMode = false,
  market = 'cn',
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
  catalogMode?: boolean
  market?: Market
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
      <div className="gallery-write-stack">
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
            market={market}
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
          {supervisor && !editing && !catalogMode ? (
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

const CATALOG_REGISTER: PhotoFormValues = {
  ...EMPTY_FORM,
  asCatalog: true,
}

export function GalleryWritePage({ editPhotoId, pageMode = 'upload', onEditClose, ...nav }: Props) {
  const catalogMode = pageMode === 'catalog'
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [register, setRegister] = useState<PhotoFormValues>(catalogMode ? CATALOG_REGISTER : EMPTY_FORM)
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
    if (catalogMode && !isSupervisor(nav.user)) {
      nav.go.home()
      return
    }
    void loadGalleryPhotos().then(setPhotos)
  }, [nav.user, catalogMode, nav.market])

  const marketPhotos = useMemo(
    () => photos.filter((photo) => galleryPhotoMarket(photo) === nav.market),
    [photos, nav.market],
  )

  const editable = useMemo(
    () => marketPhotos.filter((photo) => canEditGallery(photo, nav.user)),
    [marketPhotos, nav.user],
  )

  const catalogPhotos = useMemo(() => editable.filter((photo) => photo.catalog), [editable])
  const memberPhotos = useMemo(() => editable.filter((photo) => !photo.catalog), [editable])
  const uploadListLabel = catalogMode
    ? '회원 사진'
    : supervisor
      ? '내·회원 사진'
      : '내가 올린 사진'

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
    onEditClose?.()
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
      const existing = target
      const saved = await saveGalleryPhoto({
        id: existing?.id || '',
        title: values.title.trim(),
        src,
        city: values.city,
        category: values.category,
        sightType: values.category === 'sight' ? values.sightType || 'town' : undefined,
        ownerId: target?.ownerId || nav.user.id,
        ownerName: target?.ownerName || nav.user.name,
        catalog: catalogMode
          ? true
          : supervisor
            ? Boolean(target?.catalog || values.asCatalog)
            : undefined,
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
      setRegister(catalogMode ? CATALOG_REGISTER : EMPTY_FORM)
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
          <h2>
            {catalogMode ? '카탈로그' : '갤러리 등록'}
            <span className="market-badge">{MARKET_SHORT[nav.market]}</span>
          </h2>
          <button className="btn ghost" type="button" onClick={() => nav.go.gallery()}>
            {catalogMode ? '갤러리 보기' : '갤러리'}
          </button>
        </div>
        {catalogMode ? (
          <p className="muted gallery-write-note">
            {MARKET_SHORT[nav.market]} 시장 기본 사진(카탈로그)을 등록·수정합니다. 다른 시장 사진은 헤더 국기로
            전환해 관리하세요.
          </p>
        ) : (
          <p className="muted gallery-write-note">도시·분류·제목·사진을 입력한 뒤 등록합니다.</p>
        )}
        <GalleryPhotoForm
          values={register}
          onChange={(patch) => setRegister((prev) => ({ ...prev, ...patch }))}
          user={nav.user}
          supervisor={supervisor}
          catalogMode={catalogMode}
          market={nav.market}
          busy={registerBusy}
          error={registerError}
          onSubmit={submitRegister}
          submitLabel="등록"
        />

        {catalogMode ? (
          <>
            <div className="section-head">
              <h2>카탈로그 사진</h2>
              <span className="muted">{catalogPhotos.length}장</span>
            </div>
            {catalogPhotos.length ? (
              <GalleryManageCardList
                photos={catalogPhotos}
                allowCatalogDelete
                onOpen={startEdit}
                onEdit={startEdit}
                onRemove={remove}
              />
            ) : (
              <p className="muted">카탈로그 사진이 없습니다.</p>
            )}
            <div className="section-head">
              <h2>회원 사진</h2>
              <span className="muted">{memberPhotos.length}장</span>
            </div>
            {memberPhotos.length ? (
              <GalleryManageCardList
                photos={memberPhotos}
                onOpen={startEdit}
                onEdit={startEdit}
                onRemove={remove}
              />
            ) : (
              <p className="muted">회원 사진이 없습니다.</p>
            )}
          </>
        ) : (
          <>
            <div className="section-head">
              <h2>{uploadListLabel}</h2>
            </div>
            {memberPhotos.length ? (
              <GalleryManageCardList
                photos={memberPhotos}
                onOpen={startEdit}
                onEdit={startEdit}
                onRemove={remove}
              />
            ) : (
              <p className="muted">수정할 사진이 없습니다.</p>
            )}
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
              catalogMode={catalogMode}
              market={nav.market}
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
