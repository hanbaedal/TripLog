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

  const title =
    mode === 'up' ? '회원가입' : mode === 'findId' ? '아이디 찾기' : mode === 'findPw' ? '비밀번호 찾기' : '로그인'
  const submitLabel =
    mode === 'up' ? '가입하기' : mode === 'findId' ? '아이디 찾기' : mode === 'findPw' ? '비밀번호 바꾸기' : '로그인'

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => void submit(e)}
      >
        <h2 id="auth-title">{title}</h2>
        <div className="slot-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button type="button" className={mode === 'in' ? 'on' : ''} onClick={() => switchMode('in')}>
            로그인
          </button>
          <button type="button" className={mode === 'up' ? 'on' : ''} onClick={() => switchMode('up')}>
            회원가입
          </button>
        </div>
        <div className="form-grid">
          {mode === 'up' || mode === 'findId' ? (
            <label>
              이름
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </label>
          ) : null}
          {mode !== 'findId' ? (
            <label>
              이메일
              {mode === 'up' ? (
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
              ) : (
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              )}
            </label>
          ) : null}
          {mode === 'up' && emailChecked && emailChecked === email.trim().toLowerCase() ? (
            <p className="muted">사용 가능한 이메일입니다.</p>
          ) : null}
          {mode === 'up' || mode === 'findId' || mode === 'findPw' ? (
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
          ) : null}
          {mode === 'in' || mode === 'up' || mode === 'findPw' ? (
            <PasswordField
              label={mode === 'findPw' ? '새 비밀번호' : '비밀번호'}
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            />
          ) : null}
          {mode === 'up' || mode === 'findPw' ? (
            <PasswordField
              label="비밀번호 확인"
              value={confirm}
              onChange={setConfirm}
              required
              minLength={6}
              autoComplete="new-password"
            />
          ) : null}
        </div>
        {foundEmail ? <p className="muted">가입 이메일: {foundEmail}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onClose}>
            취소
          </button>
          <button className="btn ghost" type="button" onClick={() => switchMode('findId')}>
            아이디찾기
          </button>
          <button className="btn ghost" type="button" onClick={() => switchMode('findPw')}>
            비밀번호찾기
          </button>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '확인 중…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
