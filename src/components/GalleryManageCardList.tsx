import { galleryMediaSrc } from '../lib/galleryResolve'
import { photoManageCardDisplay } from '../lib/galleryFilter'
import type { GalleryPhoto } from '../types'

type Props = {
  photos: GalleryPhoto[]
  allowCatalogDelete?: boolean
  canManage?: (photo: GalleryPhoto) => boolean
  onOpen: (photo: GalleryPhoto) => void
  onEdit: (photo: GalleryPhoto) => void
  onRemove: (id: string) => void
}

export function GalleryManageCardList({
  photos,
  allowCatalogDelete,
  canManage,
  onOpen,
  onEdit,
  onRemove,
}: Props) {
  if (!photos.length) return null

  return (
    <div className="gallery-mine">
      {photos.map((photo) => {
        const display = photoManageCardDisplay(photo)
        const managed = canManage?.(photo) ?? true
        const showDelete = managed && (!photo.catalog || allowCatalogDelete)

        return (
          <article className="info-card gallery-manage-card" key={photo.id}>
            <button type="button" className="gallery-manage-open" onClick={() => onOpen(photo)}>
              <div className="gallery-card-thumb">
                <img src={galleryMediaSrc(photo.src)} alt={photo.title} loading="lazy" />
              </div>
              <div className="gallery-manage-meta">
                {display.title ? <span className="gallery-manage-title">{display.title}</span> : null}
                <span className="gallery-manage-taxonomy muted">{display.taxonomy}</span>
              </div>
            </button>
            {managed ? (
              <div className="gallery-manage-actions">
                <button className="btn ghost gallery-manage-btn" type="button" onClick={() => onEdit(photo)}>
                  수정
                </button>
                {showDelete ? (
                  <button
                    className="btn ghost gallery-manage-btn gallery-manage-btn-danger"
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
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
