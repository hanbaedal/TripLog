import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { MARKET_SHORT } from '../lib/market'
import {
  loadTaxonomy,
  nextTaxonomySort,
  removeTaxonomyRow,
  saveTaxonomyRow,
  type TaxonomyBundle,
  type TaxonomyKind,
  type TaxonomyRow,
} from '../lib/taxonomy'
import type { Market } from '../types'
import type { SiteNav } from '../lib/siteNav'

const KIND_LABEL: Record<TaxonomyKind, string> = {
  city: '도시 분류',
  category: '일정 분류',
  sightType: '관광 유형',
  foodType: '음식 종류',
}

const SLUG_PLACEHOLDER: Record<Market, Record<TaxonomyKind, string>> = {
  cn: {
    city: 'beijing',
    category: 'sight',
    sightType: 'mountain',
    foodType: 'beijingkaoya',
  },
  kr: {
    city: 'kr-seoul',
    category: 'sight',
    sightType: 'mountain',
    foodType: 'bibimbap',
  },
}

const ZH_PLACEHOLDER: Record<TaxonomyKind, string> = {
  city: '北京',
  category: '观光',
  sightType: '山·峡谷',
  foodType: '北京烤鸭',
}

const KO_PLACEHOLDER: Record<Market, Record<TaxonomyKind, string>> = {
  cn: {
    city: '베이징',
    category: '관광',
    sightType: '산·협곡',
    foodType: '베이징 오리구이',
  },
  kr: {
    city: '서울',
    category: '관광',
    sightType: '산·협곡',
    foodType: '비빔밥',
  },
}

function TaxonomySection({
  market,
  kind,
  rows,
  onChange,
}: {
  market: Market
  kind: TaxonomyKind
  rows: TaxonomyRow[]
  onChange: (next: TaxonomyBundle) => void
}) {
  const [slug, setSlug] = useState('')
  const [labelZh, setLabelZh] = useState('')
  const [label, setLabel] = useState('')
  const [sort, setSort] = useState('1')
  const [editing, setEditing] = useState<TaxonomyRow | null>(null)
  const [error, setError] = useState('')
  const slugLabel = market === 'kr' ? '코드' : '핑yin'

  useEffect(() => {
    if (!editing) setSort(String(nextTaxonomySort(rows)))
  }, [rows, editing])

  function reset() {
    setSlug('')
    setLabelZh('')
    setLabel('')
    setSort(String(nextTaxonomySort(rows)))
    setEditing(null)
    setError('')
  }

  function startEdit(row: TaxonomyRow) {
    setEditing(row)
    setSlug(row.slug)
    setLabelZh(row.labelZh || '')
    setLabel(row.label)
    setSort(String(row.sort ?? nextTaxonomySort(rows)))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const next = await saveTaxonomyRow({
        market,
        kind,
        slug: slug.trim().toLowerCase(),
        labelZh: labelZh.trim(),
        label: label.trim(),
        sort: Number(sort) || nextTaxonomySort(rows),
        prevSlug: editing?.slug,
      })
      onChange(next)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    }
  }

  async function remove(row: TaxonomyRow) {
    if (!window.confirm(`「${row.label}」 항목을 삭제할까요?`)) return
    setError('')
    try {
      const next = await removeTaxonomyRow(market, kind, row.slug)
      onChange(next)
      if (editing?.slug === row.slug) reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.')
    }
  }

  return (
    <section className="admin-section">
      <p className="muted taxonomy-admin-count">{rows.length}개 항목</p>
      <form
        className={`board-form admin-inline-form admin-taxonomy-form${market === 'kr' ? ' is-kr' : ''}`}
        onSubmit={(e) => void submit(e)}
      >
        <label>
          {slugLabel}
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={SLUG_PLACEHOLDER[market][kind]}
            required
          />
        </label>
        {market === 'cn' ? (
          <label>
            중문
            <input
              value={labelZh}
              onChange={(e) => setLabelZh(e.target.value)}
              placeholder={ZH_PLACEHOLDER[kind]}
            />
          </label>
        ) : null}
        <label>
          한글
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={KO_PLACEHOLDER[market][kind]}
            required
          />
        </label>
        <label>
          순번
          <input value={sort} onChange={(e) => setSort(e.target.value)} placeholder="1" inputMode="numeric" />
        </label>
        <div className="nav-actions">
          <button className="btn" type="submit">
            {editing ? '수정' : '추가'}
          </button>
          {editing ? (
            <button className="btn ghost" type="button" onClick={reset}>
              취소
            </button>
          ) : null}
        </div>
      </form>
      {error ? <p className="muted">{error}</p> : null}
      <div className="admin-table admin-taxonomy-table">
        <div className={`admin-row admin-row-taxonomy admin-row-head${market === 'kr' ? ' is-kr' : ''}`}>
          <span>{slugLabel}</span>
          {market === 'cn' ? <span>중문</span> : null}
          <span>한글</span>
          <span>순번</span>
          <span />
        </div>
        {rows.map((row) => (
          <div className={`admin-row admin-row-taxonomy${market === 'kr' ? ' is-kr' : ''}`} key={row.slug}>
            <span className="admin-row-code">{row.slug}</span>
            {market === 'cn' ? <span className="admin-row-zh">{row.labelZh || '—'}</span> : null}
            <span>{row.label}</span>
            <span className="muted">{row.sort ?? ''}</span>
            <div className="nav-actions">
              <button className="btn ghost" type="button" onClick={() => startEdit(row)}>
                수정
              </button>
              <button className="btn ghost" type="button" onClick={() => void remove(row)}>
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function rowsForKind(bundle: TaxonomyBundle, kind: TaxonomyKind): TaxonomyRow[] {
  if (kind === 'city') return bundle.cities
  if (kind === 'category') return bundle.categories
  if (kind === 'sightType') return bundle.sightTypes
  return bundle.foodTypes
}

export function TaxonomyAdminPage({ kind, ...nav }: SiteNav & { kind: TaxonomyKind }) {
  const [bundle, setBundle] = useState<TaxonomyBundle | null>(null)

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!isSupervisor(nav.user)) {
      nav.go.home()
      return
    }
    setBundle(null)
    void loadTaxonomy(nav.market).then(setBundle)
  }, [nav.user, nav.market])

  if (!isSupervisor(nav.user)) return null

  const rows = bundle ? rowsForKind(bundle, kind) : []

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>
            {KIND_LABEL[kind]}
            <span className="market-badge">{MARKET_SHORT[nav.market]}</span>
          </h2>
          <button className="btn ghost" type="button" onClick={() => nav.go.catalog()}>
            카탈로그
          </button>
        </div>
        <p className="muted taxonomy-admin-note">
          헤더 {nav.market === 'kr' ? '🇰🇷' : '🇨🇳'} 시장별로 관리합니다. 저장하면 해당 시장의 갤러리·등록 화면에
          바로 반영됩니다.
        </p>
        {bundle ? (
          <TaxonomySection market={nav.market} kind={kind} rows={rows} onChange={setBundle} />
        ) : null}
      </section>
    </PageShell>
  )
}
