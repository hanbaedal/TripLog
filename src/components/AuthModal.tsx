import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../types'
import { checkEmailAvailable, findEmail, resetPassword, signIn, signUp } from '../lib/auth'
import { PasswordField } from './PasswordField'

type Props = {
  onClose: () => void
  onAuthed: (user: User) => void
}

type Mode = 'in' | 'up' | 'findId' | 'findPw'

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4C7.03 4 3 7.13 3 11c0 2.55 1.67 4.78 4.18 6.05-.18.64-.66 2.33-.76 2.7-.12.45.17.44.35.32.15-.1 2.4-1.62 3.38-2.27.58.08 1.18.12 1.85.12 4.97 0 9-3.13 9-7s-4.03-7-9-7"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22 12.24c0-.82-.07-1.42-.22-2.04H12v3.72h5.68a4.7 4.7 0 0 1-2.04 3.08v2.55h3.3c1.93-1.78 3.06-4.4 3.06-7.31" />
      <path fill="#34A853" d="M12 22c2.76 0 5.08-.92 6.78-2.5l-3.3-2.55c-.92.62-2.1.98-3.48.98-2.67 0-4.93-1.8-5.74-4.22H1.13v2.63A10 10 0 0 0 12 22" />
      <path fill="#FBBC05" d="M6.26 13.71A5.98 5.98 0 0 1 5.84 12c0-.59.1-1.16.42-1.71V7.66H1.13A10 10 0 0 0 2 15.29z" />
      <path fill="#EA4335" d="M12 5.38c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.06 2.09 14.74 1 12 1 7.7 1 3.99 3.47 2.18 7.34l5.13 3.98C8.07 8.18 9.92 5.38 12 5.38" />
    </svg>
  )
}

export function AuthModal({ onClose, onAuthed }: Props) {
  const [mode, setMode] = useState<Mode>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [emailChecked, setEmailChecked] = useState('')
  const [foundEmail, setFoundEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setFoundEmail('')
    setPassword('')
    setConfirm('')
    if (next !== 'up') setEmailChecked('')
  }

  async function onCheckEmail() {
    setError('')
    setBusy(true)
    try {
      const available = await checkEmailAvailable(email)
      if (!available) {
        setEmailChecked('')
        setError('이미 가입된 이메일입니다.')
        return
      }
      setEmailChecked(email.trim().toLowerCase())
    } catch (err) {
      setEmailChecked('')
      setError(err instanceof Error ? err.message : '다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'up') {
        if (emailChecked !== email.trim().toLowerCase()) {
          throw new Error('이메일 중복 확인을 해 주세요.')
        }
        if (password !== confirm) throw new Error('비밀번호 확인이 같지 않습니다.')
        onAuthed(await signUp(name, email, password, phone))
        return
      }
      if (mode === 'findId') {
        setFoundEmail(await findEmail(name, phone))
        return
      }
      if (mode === 'findPw') {
        if (password !== confirm) throw new Error('비밀번호 확인이 같지 않습니다.')
        onAuthed(await resetPassword(email, phone, password))
        return
      }
      onAuthed(await signIn(email, password))
    } catch (err) {
      setError(err instanceof Error ? err.message : '다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  function onSocial(provider: 'kakao' | 'google') {
    setError(`${provider === 'kakao' ? '카카오' : 'Google'} 로그인은 준비 중입니다. 이메일로 로그인해 주세요.`)
  }

  const primaryLabel =
    mode === 'up' ? '가입하기' : mode === 'findId' ? '아이디 찾기' : mode === 'findPw' ? '비밀번호 바꾸기' : '로그인'

  const thirdLabel = mode === 'in' ? '회원가입' : '로그인'
  const onThird = () => switchMode(mode === 'in' ? 'up' : 'in')

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <form
        className="modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label="계정"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void submit(e)}
      >
        <button className="auth-modal-close" type="button" aria-label="닫기" onClick={onClose}>
          ×
        </button>

        {mode === 'up' ? (
          <div className="auth-extra">
            <label>
              이름
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </label>
            <label>
              전화번호
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="010-0000-0000"
              />
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
                  }}
                  required
                />
                <button className="btn ghost" type="button" disabled={busy} onClick={() => void onCheckEmail()}>
                  중복 확인
                </button>
              </span>
            </label>
            {emailChecked && emailChecked === email.trim().toLowerCase() ? (
              <p className="muted auth-hint">사용 가능한 이메일입니다.</p>
            ) : null}
          </div>
        ) : null}

        {mode === 'findPw' ? (
          <div className="auth-extra">
            <PasswordField
              label="새 비밀번호"
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <PasswordField
              label="비밀번호 확인"
              value={confirm}
              onChange={setConfirm}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        ) : null}

        <div className="auth-row auth-row-fields">
          {mode === 'findId' ? (
            <>
              <label>
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </label>
              <label>
                전화번호
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="010-0000-0000"
                />
              </label>
            </>
          ) : mode === 'findPw' ? (
            <>
              <label>
                이메일
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                전화번호
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="010-0000-0000"
                />
              </label>
            </>
          ) : mode === 'up' ? (
            <>
              <PasswordField
                label="비밀번호"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <PasswordField
                label="비밀번호 확인"
                value={confirm}
                onChange={setConfirm}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </>
          ) : (
            <>
              <label>
                이메일
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <PasswordField
                label="비밀번호"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </>
          )}
        </div>

        {foundEmail ? <p className="muted auth-hint">가입 이메일: {foundEmail}</p> : null}
        {error ? <p className="form-error auth-hint">{error}</p> : null}

        <div className="auth-row auth-row-actions">
          <button className="btn auth-btn-primary" type="submit" disabled={busy}>
            {busy ? '확인 중…' : primaryLabel}
          </button>
          <button
            className={`btn ghost${mode === 'findId' ? ' is-on' : ''}`}
            type="button"
            onClick={() => switchMode('findId')}
          >
            아이디찾기
          </button>
          <button
            className={`btn ghost${mode === 'findPw' ? ' is-on' : ''}`}
            type="button"
            onClick={() => switchMode('findPw')}
          >
            비밀번호찾기
          </button>
        </div>

        <div className="auth-row auth-row-social">
          <button className="btn auth-btn-kakao" type="button" onClick={() => onSocial('kakao')}>
            <KakaoIcon />
            카카오
          </button>
          <button className="btn auth-btn-google" type="button" onClick={() => onSocial('google')}>
            <GoogleIcon />
            Google
          </button>
          <button className="btn ghost auth-btn-switch" type="button" onClick={onThird}>
            {thirdLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
