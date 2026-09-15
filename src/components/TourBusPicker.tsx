import { useEffect, useMemo, useState } from 'react'
import { krw } from '../lib/costs'
import {
  buildTourBusPick,
  computeTourBusBudget,
  discoverTourBusCity,
  listTourBusCities,
  resolveTourBusCity,
  saveTourBusCity,
  type TourBusCityDoc,
  type TourBusCourse,
  type TourBusPick,
  type TourBusStop,
} from '../lib/tourbus'

type Step = 'city' | 'save' | 'course' | 'stop' | 'time'

type Props = {
  initialCity?: string
  tripAdults?: number
  tripChildren?: number
  onClose: () => void
  onPick: (pick: TourBusPick) => void
}

const TYPE_LABEL: Record<string, string> = {
  loop: '순환',
  package: '패키지',
  themed: '테마',
}

function hasStops(course: TourBusCourse): course is TourBusCourse & { stops: TourBusStop[] } {
  return Boolean(course.stops?.length)
}

export function TourBusPicker({
  initialCity,
  tripAdults = 1,
  tripChildren = 0,
  onClose,
  onPick,
}: Props) {
  const [step, setStep] = useState<Step>('city')
  const [cities, setCities] = useState<{ city: string; cityLabel: string }[]>([])
  const [cityInput, setCityInput] = useState(initialCity ?? '')
  const [cityDoc, setCityDoc] = useState<TourBusCityDoc | null>(null)
  const [course, setCourse] = useState<TourBusCourse | null>(null)
  const [stop, setStop] = useState<TourBusStop | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discoverSource, setDiscoverSource] = useState<'catalog' | 'opendata' | 'db' | null>(null)
  const [needsSaveChoice, setNeedsSaveChoice] = useState(false)

  const resolvedSlug = useMemo(() => resolveTourBusCity(cityInput), [cityInput])

  useEffect(() => {
    void listTourBusCities().then((data) => setCities(data.cities))
  }, [])

  useEffect(() => {
    if (initialCity) {
      setCityInput(initialCity)
    }
  }, [initialCity])

  async function discoverCity(query: string, label?: string) {
    const bit = (label || query).trim()
    if (!bit) {
      setError('도시명을 입력해 주세요.')
      return
    }
    setLoading(true)
    setError('')
    setNeedsSaveChoice(false)
    setDiscoverSource(null)
    try {
      const hit = await discoverTourBusCity(bit)
      if (hit.status === 'not_found') {
        setError(hit.message || '이 도시는 시티투어버스를 운영하지 않습니다.')
        setCityDoc(null)
        return
      }
      if (hit.status !== 'found' || !hit.city) {
        setError(
          hit.status === 'invalid'
            ? hit.error || '도시명을 입력해 주세요.'
            : '투어버스 일정을 불러오지 못했습니다.',
        )
        setCityDoc(null)
        return
      }
      setCityDoc(hit.city)
      setCityInput(hit.city.cityLabel)
      setDiscoverSource(hit.source)
      setCourse(null)
      setStop(null)
      if (hit.saved) {
        setStep('course')
      } else {
        setNeedsSaveChoice(true)
        setStep('save')
      }
    } catch {
      setError('투어버스 일정을 불러오지 못했습니다.')
      setCityDoc(null)
    } finally {
      setLoading(false)
    }
  }

  function pickCityFromList(row: { city: string; cityLabel: string }) {
    void discoverCity(row.cityLabel, row.cityLabel)
  }

  function submitCity(e: React.FormEvent) {
    e.preventDefault()
    void discoverCity(cityInput.trim())
  }

  async function confirmSave(save: boolean) {
    if (!cityDoc) return
    if (save) {
      setLoading(true)
      const saved = await saveTourBusCity(cityDoc)
      setLoading(false)
      if (!saved) {
        setError('DB 저장에 실패했습니다. 이번만 이용하기로 계속할 수 있습니다.')
        return
      }
      setCityDoc(saved)
    }
    setNeedsSaveChoice(false)
    setStep('course')
  }

  function skipSave() {
    setNeedsSaveChoice(false)
    setStep('course')
  }

  function pickCourse(row: TourBusCourse) {
    setCourse(row)
    setStop(null)
    setStep(hasStops(row) ? 'stop' : 'time')
  }

  function pickStop(row: TourBusStop) {
    setStop(row)
    setStep('time')
  }

  function pickTime(time: string) {
    if (!cityDoc || !course) return
    onPick(
      buildTourBusPick(cityDoc, course, time, stop ?? undefined, {
        adults: tripAdults,
        children: tripChildren,
      }),
    )
  }

  function fareHint(row: TourBusCourse): string {
    if (!row.fareAdult) return ''
    const total = computeTourBusBudget(row, tripAdults, tripChildren)
    const people = Math.max(1, tripAdults + tripChildren)
    if (people <= 1) return `참고 ${krw(row.fareAdult)}`
    return `참고 ${krw(row.fareAdult)} · 일행 ${krw(total)}`
  }

  function goBack() {
    if (step === 'time') {
      setStep(hasStops(course!) ? 'stop' : 'course')
      if (hasStops(course!)) setStop(null)
      return
    }
    if (step === 'stop') {
      setStep('course')
      setCourse(null)
      setStop(null)
      return
    }
    if (step === 'course') {
      setStep(needsSaveChoice ? 'save' : 'city')
      if (!needsSaveChoice) {
        setCityDoc(null)
        setCourse(null)
        setStop(null)
      }
      return
    }
    if (step === 'save') {
      setStep('city')
      setCityDoc(null)
      setCourse(null)
      setStop(null)
      setNeedsSaveChoice(false)
    }
  }

  const stepTitle =
    step === 'city'
      ? '① 도시 선택'
      : step === 'save'
        ? '② 정보 확인'
        : step === 'course'
          ? needsSaveChoice
            ? '② 투어 코스'
            : '② 투어 코스'
          : step === 'stop'
            ? '③ 승차 장소'
            : '④ 출발 시간'

  const timeOptions = stop?.times?.length ? stop.times : course?.times ?? []

  return (
    <div className="modal-back tourbus-picker-back" onClick={onClose} role="presentation">
      <div
        className="modal tourbus-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tourbus-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tourbus-picker-head">
          {step !== 'city' ? (
            <button type="button" className="btn ghost item-modal-back" onClick={goBack}>
              ← 이전
            </button>
          ) : (
            <span />
          )}
          <h2 id="tourbus-picker-title">투어버스 일정</h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            닫기
          </button>
        </div>

        <p className="muted tourbus-picker-step">{stepTitle}</p>

        <div className="tourbus-picker-body">
        {step === 'city' ? (
          <>
            <form className="tourbus-city-form" onSubmit={submitCity}>
              <label>
                도시명
                <input
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value)
                    setError('')
                  }}
                  placeholder="예: 대구 · 인천 · 여수 · 강릉 · 청주"
                  list="tourbus-city-options"
                  autoFocus
                />
              </label>
              <datalist id="tourbus-city-options">
                {cities.map((row) => (
                  <option key={row.city} value={row.cityLabel} />
                ))}
              </datalist>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? '불러오는 중…' : '코스 보기'}
              </button>
            </form>
            <p className="muted tourbus-city-hint">
              전국 시티투어 운영 도시를 입력하면 공공데이터에서 코스를 불러옵니다. 자주 쓰는 도시는 칩에서
              선택하세요.
            </p>
            <div className="tourbus-city-chips">
              {cities.slice(0, 18).map((row) => (
                <button
                  key={row.city}
                  type="button"
                  className={`btn ghost${resolvedSlug === row.city ? ' on' : ''}`}
                  onClick={() => pickCityFromList(row)}
                  disabled={loading}
                >
                  {row.cityLabel}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 'save' && cityDoc ? (
          <div className="tourbus-save-panel">
            <p className="tourbus-save-title">
              <strong>{cityDoc.cityLabel}</strong> 시티투어 정보 {cityDoc.courses.length}개 코스를 불러왔습니다.
            </p>
            <p className="muted">
              {discoverSource === 'opendata'
                ? '출처: 공공데이터포털 전국시티투어정보 (참고용)'
                : '상세 일정·시간은 공식 사이트에서 확인하세요.'}
            </p>
            {cityDoc.sourceUrl ? (
              <p className="muted tourbus-save-link">
                공식:{' '}
                <a href={cityDoc.sourceUrl} target="_blank" rel="noreferrer">
                  {cityDoc.sourceUrl}
                </a>
              </p>
            ) : null}
            <ul className="tourbus-save-preview">
              {cityDoc.courses.slice(0, 4).map((row) => (
                <li key={row.id}>{row.title}</li>
              ))}
              {cityDoc.courses.length > 4 ? (
                <li className="muted">외 {cityDoc.courses.length - 4}개 코스</li>
              ) : null}
            </ul>
            <p className="muted">이 도시 정보를 DB에 저장할까요? 저장하면 다음부터 더 빠르게 불러옵니다.</p>
            <div className="tourbus-save-actions">
              <button className="btn" type="button" onClick={() => void confirmSave(true)} disabled={loading}>
                DB에 저장하고 계속
              </button>
              <button className="btn ghost" type="button" onClick={skipSave} disabled={loading}>
                이번만 보기
              </button>
            </div>
          </div>
        ) : null}

        {step === 'course' && cityDoc ? (
          <>
            <p className="muted tourbus-disclaimer">{cityDoc.disclaimer}</p>
            <ul className="tourbus-course-list">
              {cityDoc.courses.map((row) => (
                <li key={row.id}>
                  <button type="button" className="tourbus-course-card" onClick={() => pickCourse(row)}>
                    <span className="tourbus-course-type">{TYPE_LABEL[row.type] || row.type}</span>
                    <strong>{row.title}</strong>
                    {row.operator ? <span className="muted">{row.operator}</span> : null}
                    {row.routeSummary ? <span className="muted">{row.routeSummary}</span> : null}
                    <span className="muted">기준: {row.departPlace}</span>
                    {row.stops?.length ? (
                      <span className="muted">승차 장소 {row.stops.length}곳 선택 가능</span>
                    ) : null}
                    {row.fareAdult ? <span className="muted">{fareHint(row)}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === 'stop' && course?.stops?.length ? (
          <>
            <div className="tourbus-time-summary">
              <strong>{course.title}</strong>
            </div>
            <ul className="tourbus-course-list">
              {course.stops.map((row) => (
                <li key={row.id}>
                  <button type="button" className="tourbus-course-card" onClick={() => pickStop(row)}>
                    <strong>{row.label}</strong>
                    <span className="muted">{row.place}</span>
                    {row.hint ? <span className="muted">{row.hint}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {step === 'time' && cityDoc && course ? (
          <>
            <div className="tourbus-time-summary">
              <strong>{course.title}</strong>
              <span className="muted">{stop?.label || course.departPlace}</span>
              <span className="muted">{stop?.place || course.departPlace}</span>
            </div>
            <p className="muted tourbus-disclaimer">{cityDoc.disclaimer}</p>
            <div className="tourbus-time-grid">
              {timeOptions.map((time) => (
                <button key={time} type="button" className="btn ghost tourbus-time-btn" onClick={() => pickTime(time)}>
                  {time}
                </button>
              ))}
            </div>
            {stop?.hint ? <p className="muted tourbus-course-note">{stop.hint}</p> : null}
            {!stop && course.note ? <p className="muted tourbus-course-note">{course.note}</p> : null}
          </>
        ) : null}

        {error ? <p className="tourbus-error">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
