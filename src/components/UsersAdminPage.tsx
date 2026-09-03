import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { listUsers, removeUser, updateUser, type AdminUser } from '../lib/admin'
import { isRemote } from '../lib/remote'
import type { SiteNav } from '../lib/siteNav'

export function UsersAdminPage(nav: SiteNav) {
  const [rows, setRows] = useState<AdminUser[]>([])
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'user' | 'supervisor'>('user')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    if (!isSupervisor(nav.user)) {
      nav.go.home()
      return
    }
    void listUsers().then(setRows)
  }, [nav.user])

  function startEdit(user: AdminUser) {
    setEditing(user)
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone || '')
    setRole(user.role === 'supervisor' ? 'supervisor' : 'user')
    setPassword('')
    setError('')
  }

  function reset() {
    setEditing(null)
    setName('')
    setEmail('')
    setPhone('')
    setRole('user')
    setPassword('')
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setError('')
    try {
      await updateUser(editing.id, {
        name: name.trim(),
        email: email.trim(),
        phone,
        role,
        password: password.trim() || undefined,
      })
      setRows(await listUsers())
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다.')
    }
  }

  async function remove(id: string) {
    if (!window.confirm('이 회원을 삭제할까요?')) return
    setError('')
    try {
      await removeUser(id)
      setRows(await listUsers())
      if (editing?.id === id) reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.')
    }
  }

  if (!isSupervisor(nav.user)) return null

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>회원 관리</h2>
        </div>
        {!isRemote() ? (
          <p className="muted">회원 관리는 서버(Render) 배포 환경에서 이용할 수 있습니다.</p>
        ) : (
          <>
            {editing ? (
              <form className="board-form" onSubmit={(e) => void submit(e)}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="전화번호" />
                <label>
                  역할
                  <select value={role} onChange={(e) => setRole(e.target.value as 'user' | 'supervisor')}>
                    <option value="user">회원</option>
                    <option value="supervisor">슈퍼바이저</option>
                  </select>
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="새 비밀번호(선택)"
                  type="password"
                />
                <div className="nav-actions">
                  <button className="btn" type="submit">
                    저장
                  </button>
                  <button className="btn ghost" type="button" onClick={reset}>
                    취소
                  </button>
                </div>
                {error ? <p className="muted">{error}</p> : null}
              </form>
            ) : null}
            <div className="admin-table users-table">
              {rows.map((user) => (
                <div className="admin-row" key={user.id}>
                  <span>{user.name}</span>
                  <span className="admin-row-email">{user.email}</span>
                  <span className="muted">{user.role === 'supervisor' ? '슈퍼바이저' : '회원'}</span>
                  <div className="nav-actions">
                    <button className="btn ghost" type="button" onClick={() => startEdit(user)}>
                      수정
                    </button>
                    {user.id !== nav.user?.id ? (
                      <button className="btn ghost" type="button" onClick={() => void remove(user.id)}>
                        삭제
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </PageShell>
  )
}
