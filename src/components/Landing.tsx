import { useEffect, useMemo, useState } from 'react'
import { AppNav } from './AppNav'
import { GalleryHero } from './GalleryHero'
import { SampleSlider } from './SampleSlider'
import { SideMenu } from './SideMenu'
import type { SampleRecord } from '../types'
import { SAMPLE_CATALOG } from '../data/sampleCatalog.js'
import { listSamples } from '../data/samples'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  onPickSample: (sample: SampleRecord) => void
}

export function Landing({ onPickSample, ...nav }: Props) {
  const [rows, setRows] = useState<SampleRecord[]>(() => SAMPLE_CATALOG as SampleRecord[])

  useEffect(() => {
    void listSamples().then(setRows)
  }, [])

  const samples = useMemo(
    () => [...rows].sort((a, b) => a.sort - b.sort || a.nights - b.nights),
    [rows],
  )

  return (
    <div className="home-shell">
      <AppNav {...nav} />
      <div className="home-body">
        <SideMenu {...nav} />
        <div className="home-main">
          <GalleryHero onOpen={(id) => nav.go.gallery(id)} />
          <section className="samples-home">
            <SampleSlider items={samples} auto onPick={onPickSample} />
          </section>
        </div>
      </div>
    </div>
  )
}
