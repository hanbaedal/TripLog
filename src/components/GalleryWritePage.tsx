import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { GalleryEditModal } from './GalleryEditModal'
import { GalleryManageCardList } from './GalleryManageCardList'
import {
  CATALOG_REGISTER_FORM,
  EMPTY_PHOTO_FORM,
  GalleryPhotoForm,
  type PhotoFormValues,
} from './GalleryPhotoForm'
import { GallerySlidePanel } from './GallerySlidePanel'
import { isSupervisor } from '../lib/auth'
import { canEditGallery, listGallery, removeGalleryPhoto, saveGalleryPhoto } from '../lib/community'
import { galleryPhotoMarket, MARKET_SHORT } from '../lib/market'
import { galleryCityLabel } from '../lib/galleryFilter'
import { loadGalleryPhotos, resolvePhotoSrc } from '../lib/galleryResolve'
import type { GalleryPhoto } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  editPhotoId?: string | null
  pageMode?: 'catalog' | 'upload'
  onEditClose?: () => void
}

export function GalleryWritePage({ editPhotoId, pageMode = 'upload', onEditClose, ...nav }: Props) {
  const catalogMode = pageMode === 'catalog'
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [register, setRegister] = useState<PhotoFormValues>(catalogMode ? CATALOG_REGISTER_FORM : EMPTY_PHOTO_FORM)
  const [registerBusy, setRegisterBusy] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [slidePhotos, setSlidePhotos] = useState<GalleryPhoto[]>([])
  const [slideActiveId, setSlideActiveId] = useState<string | null>(null)
  const [slideMode, setSlideMode] = useState(false)
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
    void refreshPhotos()
  }, [nav.user, catalogMode, nav.market])

  async function refreshPhotos() {
    setPhotos(await loadGalleryPhotos())
  }

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

  function startEdit(photo: GalleryPhoto) {
    setEditing(photo)
    onEditClose?.()
  }

  useEffect(() => {
    if (!editPhotoId || !photos.length || !nav.user) return
    const photo = photos.find((row) => row.id === editPhotoId)
    if (photo && canEditGallery(photo, nav.user)) startEdit(photo)
  }, [editPhotoId, photos, nav.user])

  function closeEdit() {
    setEditing(null)
    onEditClose?.()
  }

  function openSlide(photo: GalleryPhoto, sectionPhotos: GalleryPhoto[]) {
    setSlidePhotos(sectionPhotos)
    setSlideActiveId(photo.id)
    setSlideMode(true)
  }

  function backFromSlide() {
    setSlideMode(false)
    setSlideActiveId(null)
    setSlidePhotos([])
  }

  const slideCityLabel = useMemo(() => {
    if (!slideActiveId) return ''
    const photo = slidePhotos.find((row) => row.id === slideActiveId)
    return photo?.city ? galleryCityLabel(photo.city) : ''
  }, [slideActiveId, slidePhotos])

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
      const saved = await saveGalleryPhoto({
        id: target?.id || '',
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
      const rows = await listGallery(nav.market)
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
      setRegister(catalogMode ? CATALOG_REGISTER_FORM : EMPTY_PHOTO_FORM)
    })
  }

  async function remove(id: string) {
    if (!window.confirm('이 사진을 삭제할까요?')) return
    await removeGalleryPhoto(id)
    await refreshPhotos()
    if (editing?.id === id) closeEdit()
    if (slideActiveId === id) backFromSlide()
  }

  return (
    <PageShell {...nav} wide={slideMode}>
      {slideMode ? (
        <GallerySlidePanel
          photos={slidePhotos}
          activeId={slideActiveId}
          cityLabel={slideCityLabel}
          onBack={backFromSlide}
        />
      ) : (
        <section className="wrap section">
          <div className="section-head">
            <h2>
              {catalogMode ? '카탈로그' : '갤러리 등록'}
              <span className="market-badge">{MARKET_SHORT[nav.market]}</span>
            </h2>
            <button className="btn ghost" type="button" onClick={() => nav.go.gallery()}>
              갤러리 보기
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
                  onOpen={(photo) => openSlide(photo, catalogPhotos)}
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
                  onOpen={(photo) => openSlide(photo, memberPhotos)}
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
                  onOpen={(photo) => openSlide(photo, memberPhotos)}
                  onEdit={startEdit}
                  onRemove={remove}
                />
              ) : (
                <p className="muted">수정할 사진이 없습니다.</p>
              )}
            </>
          )}
        </section>
      )}

      {editing && nav.user ? (
        <GalleryEditModal
          photo={editing}
          photos={photos}
          user={nav.user}
          market={nav.market}
          catalogMode={catalogMode}
          onClose={closeEdit}
          onSaved={() => void refreshPhotos()}
        />
      ) : null}
    </PageShell>
  )
}
