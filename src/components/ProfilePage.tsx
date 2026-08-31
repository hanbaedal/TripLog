import { useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { PasswordField } from './PasswordField'
import { checkEmailAvailable, updateProfile } from '../lib/auth'
import { formatPhone } from '../lib/phone'
import type { User } from '../types'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  onSaved: (user: User) => void
}

export function ProfilePage({ onSaved, ...nav }: Props) {
  const user = nav.user
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ? formatPhone(user.phone) : '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [emailChecked, setEmailChecked] = useState(user?.email ?? '')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!user) return null

  async function onCheckEmail() {
    if (!user) return
    setError('')
    setBusy(true)
    try {
      const available = await checkEmailAvailable(email, user.id)
      if (!available) {
        setEmailChecked('')
        setError('이미 가입된 이메일입니다.')
        return
      }
      setEmailChecked(email.trim().toLowerCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : '다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (emailChecked !== email.trim().toLowerCase()) {
      setError('이메일 중복 확인을 해 주세요.')
      return
    }
    if (password && password !== confirm) {
      setError('비밀번호 확인이 같지 않습니다.')
      return
    }
    setBusy(true)
    setError('')
    setDone(false)
    try {
      onSaved(
        await updateProfile({
          email,
          phone,
          currentPassword,
          password: password || undefined,
        }),
      )
      setCurrentPassword('')
      setPassword('')
      setConfirm('')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>내정보수정</h2>
          <button className="btn ghost" type="button" onClick={nav.go.trips}>
            내 여행
          </button>
        </div>
        <form className="board-form profile-form" onSubmit={(e) => void submit(e)}>
          <label>
            이름
            <input value={user.name} readOnly />
          </label>
          <label>
            이메일
            <span className="email-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailChecked('')
                  setDone(false)
                }}
                required
              />
              <button className="btn ghost" type="button" disabled={busy} onClick={() => void onCheckEmail()}>
                중복 확인
              </button>
            </span>
          </label>
          {emailChecked && emailChecked === email.trim().toLowerCase() ? (
            <p className="muted">사용 가능한 이메일입니다.</p>
          ) : null}
          <label>
            전화번호
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setDone(false)
              }}
              required
              placeholder="010-0000-0000"
            />
          </label>
          <PasswordField
            label="현재 비밀번호"
            value={currentPassword}
            onChange={setCurrentPassword}
            required
            autoComplete="current-password"
          />
          <PasswordField
            label="새 비밀번호"
            value={password}
            onChange={setPassword}
            minLength={6}
            autoComplete="new-password"
            placeholder="바꿀 때만 입력"
          />
          <PasswordField
            label="새 비밀번호 확인"
            value={confirm}
            onChange={setConfirm}
            minLength={6}
            autoComplete="new-password"
          />
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '저장 중…' : '저장'}
          </button>
          {done ? <p className="muted">저장했습니다.</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      </section>
    </PageShell>
  )
}
