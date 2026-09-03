import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { isRemote } from '../lib/remote'
import {
  loadTaxonomy,
  nextTaxonomySort,
  removeTaxonomyRow,
  saveTaxonomyRow,
  type TaxonomyBundle,
  type TaxonomyKind,
  type TaxonomyRow,
} from '../lib/taxonomy'
import type { SiteNav } from '../lib/siteNav'

const KIND_LABEL: Record<TaxonomyKind, string> = {
  city: '도시',
  category: '분류',
  sightType: '관광 유형',
  foodType: '음식 종류',
}

const SLUG_PLACEHOLDER: Record<TaxonomyKind, string> = {
  city: '핑인 (pinyin)',
  category: '핑인 (pinyin)',
  sightType: '핑인 (pinyin)',
  foodType: '핑인 (pinyin)',
}

function TaxonomySection({
  kind,
  rows,
  onChange,
}: {
  kind: TaxonomyKind
  rows: TaxonomyRow[]
  onChange: (next: TaxonomyBundle) => void
}) {
  const [slug, setSlug] = useState('')
  const [label, setLabel] = useState('')
  const [sort, setSort] = useState('1')
  const [editing, setEditing] = useState<TaxonomyRow | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) setSort(String(nextTaxonomySort(rows)))
  }, [rows, editing])

  function reset() {
    setSlug('')
    setLabel('')
    setSort(String(nextTaxonomySort(rows)))
    setEditing(null)
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const next = await saveTaxonomyRow({
        kind,
        slug: slug.trim().toLowerCase(),
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
      const next = await removeTaxonomyRow(kind, row.slug)
      onChange(next)
      if (editing?.slug === row.slug) reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.')
    }
  }

  return (
    <section className="admin-section">
      <div className="section-head">
        <h3>{KIND_LABEL[kind]}</h3>
        <span className="muted">{rows.length}개</span>
      </div>
      <form className="board-form admin-inline-form" onSubmit={(e) => void submit(e)}>
        <label>
          코드
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={SLUG_PLACEHOLDER[kind]}
            required
          />
        </label>
        <label>
          한글
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="한글 이름" required />
        </label>
        <label>
          순번
          <input value={sort} onChange={(e) => setSort(e.target.value)} placeholder="순번" inputMode="numeric" />
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
      <div className="admin-table">
        {rows.map((row) => (
          <div className="admin-row" key={row.slug}>
            <span className="admin-row-code">{row.slug}</span>
            <span>{row.label}</span>
            <span className="muted">{row.sort ?? ''}</span>
            <div className="nav-actions">
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setEditing(row)
                  setSlug(row.slug)
                  setLabel(row.label)
                  setSort(String(row.sort ?? nextTaxonomySort(rows)))
                }}
              >
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

export function TaxonomyAdminPage(nav: SiteNav) {
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
    void loadTaxonomy().then(setBundle)
  }, [nav.user])

  if (!isSupervisor(nav.user)) return null

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>분류 관리</h2>
          <button className="btn ghost" type="button" onClick={() => nav.go.galleryWrite()}>
            갤러리
          </button>
        </div>
        <p className="muted taxonomy-admin-note">코드는 중국어 핑인, 이름은 한글로 입력합니다. 순번은 마지막 번호 다음 값이 자동 표시됩니다.</p>
        {!isRemote() ? (
          <p className="muted">분류 관리는 서버(Render) 배포 환경에서 이용할 수 있습니다.</p>
        ) : bundle ? (
          <>
            <TaxonomySection kind="city" rows={bundle.cities} onChange={setBundle} />
            <TaxonomySection kind="category" rows={bundle.categories} onChange={setBundle} />
            <TaxonomySection kind="sightType" rows={bundle.sightTypes} onChange={setBundle} />
            <TaxonomySection kind="foodType" rows={bundle.foodTypes} onChange={setBundle} />
          </>
        ) : null}
      </section>
    </PageShell>
  )
}
