import { useMemo } from 'react'
import type { FormEvent } from 'react'
import { ImagePicker } from './ImagePicker'
import { GalleryTaxonomyFields } from './GalleryTaxonomyFields'
import type { Market, GalleryCategory, GalleryPhoto, SightType } from '../types'
import type { User } from '../types'

export type PhotoFormValues = {
  title: string
  photoId: string
  pendingSrc?: string
  city: string
  category: GalleryCategory | ''
  sightType: SightType | ''
  asCatalog: boolean
}

export const EMPTY_PHOTO_FORM: PhotoFormValues = {
  title: '',
  photoId: '',
  city: '',
  category: '',
  sightType: '',
  asCatalog: false,
}

export const CATALOG_REGISTER_FORM: PhotoFormValues = {
  ...EMPTY_PHOTO_FORM,
  asCatalog: true,
}

export function photoToFormValues(photo: GalleryPhoto): PhotoFormValues {
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

type Props = {
  values: PhotoFormValues
  onChange: (patch: Partial<PhotoFormValues>) => void
  user: User | null
  supervisor: boolean
  editing?: GalleryPhoto | null
  busy: boolean
  error: string
  onSubmit: (e: FormEvent) => void
  onCancel?: () => void
  submitLabel: string
  catalogMode?: boolean
  market?: Market
}

export function GalleryPhotoForm({
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
}: Props) {
  const uploadMeta = useMemo(() => {
    if (!values.city || !values.category) return undefined
    return {
      city: values.city,
      category: values.category,
      sightType: (values.category === 'sight' ? values.sightType || 'town' : '') as SightType | '',
    }
  }, [values.city, values.category, values.sightType])

  const showCatalogFlag = catalogMode || (supervisor && !editing && !catalogMode)

  return (
    <form className="board-form gallery-write-form gallery-write-compact" onSubmit={(e) => void onSubmit(e)}>
      <div className="gallery-write-stack">
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
          {catalogMode ? (
            <p className="gallery-write-catalog-label">카탈로그 사진으로 등록</p>
          ) : supervisor && !editing ? (
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
        <div className="gallery-write-photo">
          {!showCatalogFlag ? <span className="gallery-write-photo-label">사진 선택</span> : null}
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
