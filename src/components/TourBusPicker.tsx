import { useEffect, useMemo, useState } from 'react'
import {
  buildTourBusPick,
  listTourBusCities,
  loadTourBusCity,
  resolveTourBusCity,
  type TourBusCityDoc,
  type TourBusCourse,
  type TourBusPick,
} from '../lib/tourbus'

type Step = 'city' | 'course' | 'time'

type Props = {
  initialCity?: string
  onClose: () => void
  onPick: (pick: TourBusPick) => void
}

const TYPE_LABEL: Record<string, string> = {
  loop: '순환',
  package: '패키지',
  themed: '테마',
}

export function TourBusPicker({ initialCity, onClose, onPick }: Props) {
  const [step, setStep] = useState<Step>('city')
  const [cities, setCities] = useState<{ city: string; cityLabel: string }[]>([])
  const [cityInput, setCityInput] = useState(initialCity ?? '')
  const [cityDoc, setCityDoc] = useState<TourBusCityDoc | null>(null)
  const [course, setCourse] = useState<TourBusCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resolvedSlug = useMemo(() => resolveTourBusCity(cityInput), [cityInput])

  useEffect(() => {
    void listTourBusCities().then((data) => setCities(data.cities))
  }, [])

  useEffect(() => {
    if (initialCity) {
      setCityInput(initialCity)
    }
  }, [initialCity])

  async function loadCity(slug: string, label?: string) {
    setLoading(true)
    setError('')
    try {
      const doc = await loadTourBusCity(slug)
      if (!doc) {
        setError('이 도시의 투어버스 참고 일정은 아직 준비 중입니다.')
        setCityDoc(null)
        return
      }
      setCityDoc(doc)
      if (label) setCityInput(label)
      else setCityInput(doc.cityLabel)
      setCourse(null)
      setStep('course')
    } catch {
      setError('투어버스 일정을 불러오지 못했습니다.')
      setCityDoc(null)
    } finally {
      setLoading(false)
    }
  }

  function pickCityFromList(row: { city: string; cityLabel: string }) {
    void loadCity(row.city, row.cityLabel)
  }

  function submitCity(e: React.FormEvent) {
    e.preventDefault()
    const slug = resolvedSlug
    if (!slug) {
      setError('서울 · 부산 · 제주 · 경주 · 전주 중에서 선택하거나 입력해 주세요.')
      return
    }
    void loadCity(slug)
  }

  function pickCourse(row: TourBusCourse) {
    setCourse(row)
    setStep('time')
  }

  function pickTime(time: string) {
    if (!cityDoc || !course) return
    onPick(buildTourBusPick(cityDoc, course, time))
  }

  function goBack() {
    if (step === 'time') {
      setStep('course')
      return
    }
    if (step === 'course') {
      setStep('city')
      setCityDoc(null)
      setCourse(null)
    }
  }

  const stepTitle =
    step === 'city' ? '① 도시 선택' : step === 'course' ? '② 투어 코스' : '③ 출발 시간'

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
                  placeholder="서울 · 부산 · 제주 · 경주 · 전주"
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
            <div className="tourbus-city-chips">
              {cities.map((row) => (
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
                    <span className="muted">출발: {row.departPlace}</span>
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
              <span className="muted">{course.departPlace}</span>
            </div>
            <p className="muted tourbus-disclaimer">{cityDoc.disclaimer}</p>
            <div className="tourbus-time-grid">
              {course.times.map((time) => (
                <button key={time} type="button" className="btn ghost tourbus-time-btn" onClick={() => pickTime(time)}>
                  {time}
                </button>
              ))}
            </div>
            {course.note ? <p className="muted tourbus-course-note">{course.note}</p> : null}
          </>
        ) : null}

        {error ? <p className="tourbus-error">{error}</p> : null}
      </div>
    </div>
  )
}
