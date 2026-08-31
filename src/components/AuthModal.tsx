import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../types'
import { signIn, signUp } from '../lib/auth'

type Props = {
  onClose: () => void
  onAuthed: (user: User) => void
}

export function AuthModal({ onClose, onAuthed }: Props) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = mode === 'up'
        ? await signUp(name, email, password)
        : await signIn(email, password)
      onAuthed(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : '다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="kicker">Account</div>
        <h2 id="auth-title">{mode === 'up' ? '회원가입' : '로그인'}</h2>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          여행은 계정에 묶입니다. 같은 브라우저에서만 유지됩니다.
        </p>
        <div className="slot-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button type="button" className={mode === 'in' ? 'on' : ''} onClick={() => setMode('in')}>
            로그인
          </button>
          <button type="button" className={mode === 'up' ? 'on' : ''} onClick={() => setMode('up')}>
            회원가입
          </button>
        </div>
        <div className="form-grid">
          {mode === 'up' ? (
            <label>
              이름
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </label>
          ) : null}
          <label>
            이메일
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal-actions">
          <button className="btn ghost" type="button" onClick={onClose}>
            닫기
          </button>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? '확인 중…' : mode === 'up' ? '가입하고 시작' : '로그인'}
          </button>
        </div>
      </form>
    </div>
  )
}
