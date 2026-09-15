import { useEffect, useMemo, useState } from 'react'
import { GalleryHero } from './GalleryHero'
import { PageShell } from './PageShell'
import { SampleSlider } from './SampleSlider'
import type { SampleRecord } from '../types'
import { compareSamples, filterSamplesByMarket, listSamples } from '../data/samples'
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  onPickSample: (sample: SampleRecord) => void
}

export function Landing({ onPickSample, ...nav }: Props) {
  const { market } = nav
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])

  useEffect(() => {
    void listSamples().then(setRows)
  }, [])

  const samples = useMemo(
    () => filterSamplesByMarket(rows, market).sort(compareSamples),
    [rows, market],
  )

  return (
    <PageShell {...nav} shellClass="home-shell">
      <GalleryHero market={market} onOpen={(id) => nav.go.gallery(id, 'home')} />
      <section className="samples-home">
        <SampleSlider items={samples} auto onPick={onPickSample} />
      </section>
    </PageShell>
  )
}
