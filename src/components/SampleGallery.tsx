import { useEffect, useMemo, useState } from 'react'
import { BrandMark } from './Icons'
import type { SampleRecord, User } from '../types'
import { SAMPLE_GROUPS, SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { sampleCover } from '../data/sampleCovers'
import { listSamples, nightsLabel, removeSample } from '../data/samples'
import { isSupervisor } from '../lib/auth'

type Props = {
  user: User | null
  onBack: () => void
  onPick: (sample: SampleRecord) => void
  onEdit: (sample: SampleRecord) => void
  onCreate: () => void
}

export function SampleGallery({ user, onBack, onPick, onEdit, onCreate }: Props) {
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])
  const supervisor = isSupervisor(user)

  useEffect(() => {
    void listSamples().then(setRows)
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
    <div>
      <header className="wrap topnav">
        <button className="brand" type="button" onClick={onBack} style={{ background: 'none', border: 0, padding: 0 }}>
          <BrandMark className="brand-mark" />
          <span className="brand-name">
            triplog.my
            <small>samples</small>
          </span>
        </button>
        <div className="nav-actions">
          {supervisor ? (
            <button className="btn ghost" type="button" onClick={onCreate}>
              새 샘플
            </button>
          ) : null}
          <button className="btn" type="button" onClick={onBack}>
            홈
          </button>
        </div>
      </header>

      <section className="wrap section">
        {groups.map((group) => (
          <div className="sample-group" key={group.nights}>
            <div className="section-head">
              <h2>{group.label}</h2>
            </div>
            <div className="sample-cards">
              {group.items.map((sample) => (
                <article className="sample-card" key={sample.id}>
                  <button type="button" className="sample-card-main" onClick={() => onPick(sample)}>
                    <img className="sample-card-photo" src={sampleCover(sample)} alt="" />
                    <span className="sample-card-label">
                      <h3>{sample.place}</h3>
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
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
