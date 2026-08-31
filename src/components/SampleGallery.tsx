import { useEffect, useMemo, useState } from 'react'
import { BrandMark } from './Icons'
import { SampleSlider } from './SampleSlider'
import type { SampleRecord, User } from '../types'
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { listSamples, removeSample } from '../data/samples'
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

  const samples = useMemo(
    () => [...rows].sort((a, b) => a.sort - b.sort || a.nights - b.nights),
    [rows],
  )

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

      <section className="samples-home">
        <SampleSlider
          items={samples}
          supervisor={supervisor}
          onPick={onPick}
          onEdit={onEdit}
          onDelete={(id) => void handleDelete(id)}
        />
      </section>
    </div>
  )
}
