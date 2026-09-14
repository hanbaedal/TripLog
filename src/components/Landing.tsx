import { useEffect, useMemo, useState } from 'react'
import { GalleryHero } from './GalleryHero'
import { PageShell } from './PageShell'
import { SampleSlider } from './SampleSlider'
import type { SampleRecord } from '../types'
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { compareSamples, listSamples } from '../data/samples'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  onPickSample: (sample: SampleRecord) => void
}

export function Landing({ onPickSample, ...nav }: Props) {
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])

  useEffect(() => {
    void listSamples().then(setRows)
  }, [])

  const samples = useMemo(() => [...rows].sort(compareSamples), [rows])

  return (
    <PageShell {...nav} shellClass="home-shell">
      <GalleryHero onOpen={(id) => nav.go.gallery(id)} />
      <section className="samples-home">
        <SampleSlider items={samples} auto onPick={onPickSample} />
      </section>
    </PageShell>
  )
}
