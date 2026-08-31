import { useEffect, useMemo, useState } from 'react'
import { PageShell } from './PageShell'
import { loadGalleryPhotos } from '../lib/galleryResolve'
import type { GalleryPhoto, SampleRecord } from '../types'
import { SAMPLE_GROUPS, SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { sampleCover } from '../data/sampleCovers'
import { canManageSample, listSamples, nightsLabel, removeSample } from '../data/samples'
import { isSupervisor } from '../lib/auth'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  onPick: (sample: SampleRecord) => void
  onEdit: (sample: SampleRecord) => void
  onCreate: () => void
  onUnpublish: (sample: SampleRecord) => void
}

export function SampleGallery({ onPick, onEdit, onCreate, onUnpublish, ...nav }: Props) {
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const supervisor = isSupervisor(nav.user)

  useEffect(() => {
    void listSamples().then(setRows)
    void loadGalleryPhotos().then(setPhotos)
  }, [])

  const groups = useMemo(() => {
    const known = SAMPLE_GROUPS.map((group: { nights: number; label: string }) => ({
      ...group,
      items: rows.filter((row) => row.nights === group.nights).sort((a, b) => a.sort - b.sort),
    }))
    const extraNights = [...new Set(rows.map((row) => row.nights))]
      .filter((n) => !SAMPLE_GROUPS.some((g: { nights: number }) => g.nights === n))
      .sort((a, b) => a - b)
    const extra = extraNights.map((nights) => ({
      nights,
      label: nightsLabel(nights),
      items: rows.filter((row) => row.nights === nights).sort((a, b) => a.sort - b.sort),
    }))
    return [...known, ...extra].filter((group) => group.items.length > 0 || supervisor)
  }, [rows, supervisor])

  async function handleDelete(id: string) {
    if (!window.confirm('이 샘플을 삭제할까요?')) return
    setRows(await removeSample(id))
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        {supervisor ? (
          <div className="section-head">
            <h2>추천 일정</h2>
            <button className="btn ghost" type="button" onClick={onCreate}>
              새 샘플
            </button>
          </div>
        ) : null}
        {groups.map((group) => (
          <div className="sample-group" key={group.nights}>
            <div className="section-head">
              <h2>{group.label}</h2>
            </div>
            <div className="sample-cards">
              {group.items.map((sample) => (
                <article className="sample-card" key={sample.id}>
                  <button type="button" className="sample-card-main" onClick={() => onPick(sample)}>
                    <img className="sample-card-photo" src={sampleCover(sample, photos)} alt="" />
                    <span className="sample-card-label">
                      <h3>{sample.place}</h3>
                      {sample.ownerName ? <small>{sample.ownerName}</small> : null}
                    </span>
                  </button>
                  {supervisor ? (
                    <div className="sample-card-actions">
                      <button className="btn ghost" type="button" onClick={() => onEdit(sample)}>
                        수정
                      </button>
                      <button className="btn ghost" type="button" onClick={() => void handleDelete(sample.id)}>
                        삭제
                      </button>
                    </div>
                  ) : canManageSample(sample, nav.user) ? (
                    <div className="sample-card-actions">
                      <button className="btn ghost" type="button" onClick={() => onUnpublish(sample)}>
                        공개 취소
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  )
}
