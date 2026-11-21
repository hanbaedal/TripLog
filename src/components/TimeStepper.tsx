type Props = {
  value: string
  onChange: (next: string) => void
  required?: boolean
  label?: string
}

function parseHm(value: string): { hour24: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim())
  if (!match) return { hour24: 9, minute: 0 }
  const hour24 = Math.min(23, Math.max(0, Number(match[1]) || 0))
  const minute = Math.min(59, Math.max(0, Math.round((Number(match[2]) || 0) / 5) * 5))
  return { hour24, minute: minute === 60 ? 55 : minute }
}

function toValue(hour24: number, minute: number): string {
  const h = ((hour24 % 24) + 24) % 24
  const m = ((Math.round(minute / 5) * 5) % 60 + 60) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function to12(hour24: number): { period: 'am' | 'pm'; hour12: number } {
  const period = hour24 >= 12 ? 'pm' : 'am'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { period, hour12 }
}

function from12(period: 'am' | 'pm', hour12: number): number {
  const h = Math.min(12, Math.max(1, hour12))
  if (period === 'am') return h === 12 ? 0 : h
  return h === 12 ? 12 : h + 12
}

export function TimeStepper({ value, onChange, label }: Props) {
  const { hour24, minute } = parseHm(value)
  const { period, hour12 } = to12(hour24)

  function setPeriod(next: 'am' | 'pm') {
    onChange(toValue(from12(next, hour12), minute))
  }

  function bumpHour(delta: number) {
    let next12 = hour12 + delta
    let nextPeriod = period
    if (next12 > 12) {
      next12 = 1
      nextPeriod = period === 'am' ? 'pm' : 'am'
    } else if (next12 < 1) {
      next12 = 12
      nextPeriod = period === 'am' ? 'pm' : 'am'
    }
    onChange(toValue(from12(nextPeriod, next12), minute))
  }

  function bumpMinute(delta: number) {
    let next = minute + delta
    let nextHour24 = hour24
    if (next >= 60) {
      next = 0
      nextHour24 = (hour24 + 1) % 24
    } else if (next < 0) {
      next = 55
      nextHour24 = (hour24 + 23) % 24
    }
    onChange(toValue(nextHour24, next))
  }

  return (
    <div className="time-stepper">
      {label ? <span className="time-stepper-label">{label}</span> : null}
      <div className="time-stepper-row" role="group" aria-label={label || '시간'}>
        <div className="time-stepper-period" role="group" aria-label="오전 오후">
          <button type="button" className={period === 'am' ? 'on' : ''} onClick={() => setPeriod('am')}>
            오전
          </button>
          <button type="button" className={period === 'pm' ? 'on' : ''} onClick={() => setPeriod('pm')}>
            오후
          </button>
        </div>
        <div className="stepper time-stepper-unit">
          <button type="button" aria-label="시간 감소" onClick={() => bumpHour(-1)}>
            −
          </button>
          <strong aria-live="polite">{hour12}</strong>
          <button type="button" aria-label="시간 증가" onClick={() => bumpHour(1)}>
            +
          </button>
          <span className="time-stepper-unit-label">시</span>
        </div>
        <div className="stepper time-stepper-unit">
          <button type="button" aria-label="분 감소" onClick={() => bumpMinute(-5)}>
            −
          </button>
          <strong aria-live="polite">{String(minute).padStart(2, '0')}</strong>
          <button type="button" aria-label="분 증가" onClick={() => bumpMinute(5)}>
            +
          </button>
          <span className="time-stepper-unit-label">분</span>
        </div>
      </div>
    </div>
  )
}
