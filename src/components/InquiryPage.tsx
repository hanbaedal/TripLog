import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import { guestInquiryIds, listInquiries, removeInquiry, replyInquiry, saveInquiry, updateInquiry } from '../lib/community'
import type { Inquiry } from '../types'
import type { SiteNav } from '../lib/siteNav'

export function InquiryPage(nav: SiteNav) {
  const supervisor = isSupervisor(nav.user)
  const [name, setName] = useState(nav.user?.name ?? '')
  const [email, setEmail] = useState(nav.user?.email ?? '')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<Inquiry[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Inquiry | null>(null)

  useEffect(() => {
    if (nav.user?.name) setName(nav.user.name)
    if (nav.user?.email) setEmail(nav.user.email)
  }, [nav.user])

  useEffect(() => {
    const ids = nav.user || supervisor ? undefined : guestInquiryIds()
    void listInquiries(ids).then((next) => {
      if (supervisor || !nav.user) {
        setRows(next)
        return
      }
      setRows(next.filter((row) => !row.ownerId || row.ownerId === nav.user?.id))
    })
  }, [nav.user, supervisor])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next = {
      name: (nav.user?.name || name).trim(),
      email: (nav.user?.email || email).trim(),
      message: message.trim(),
      ownerId: nav.user?.id,
    }
    if (!next.name || !next.email || !next.message) {
      setError('이름, 이메일, 문의 내용이 필요합니다.')
      return
    }
    setError('')
    try {
      const saved = await saveInquiry(next)
      setRows((cur) => [saved, ...cur.filter((row) => row.id !== saved.id)])
      setMessage('')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '접수하지 못했습니다.')
    }
  }

  async function sendReply(row: Inquiry) {
    const reply = (drafts[row.id] ?? row.reply ?? '').trim()
    if (!reply) return
    const saved = await replyInquiry(row.id, reply)
    setRows((cur) => cur.map((item) => (item.id === row.id ? saved : item)))
    setDrafts((cur) => ({ ...cur, [row.id]: '' }))
  }

  async function saveEdit() {
    if (!editing) return
    const saved = await updateInquiry({
      ...editing,
      name: editing.name.trim(),
      email: editing.email.trim(),
      message: editing.message.trim(),
      reply: (drafts[editing.id] ?? editing.reply ?? '').trim() || undefined,
    })
    setRows((cur) => cur.map((item) => (item.id === saved.id ? saved : item)))
    setEditing(null)
  }

  async function drop(id: string) {
    if (!window.confirm('이 문의를 삭제할까요?')) return
    await removeInquiry(id)
    setRows((cur) => cur.filter((row) => row.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>문의사항</h2>
        </div>
        <form className="board-form" onSubmit={(e) => void submit(e)}>
          {nav.user ? null : (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
            </>
          )}
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="문의 내용" required />
          <button className="btn" type="submit">
            보내기
          </button>
          {done ? <p className="muted">접수했습니다.</p> : null}
          {error ? <p className="muted">{error}</p> : null}
        </form>

        <div className="board-list">
          {rows.map((row) => (
            <article className="info-card" key={row.id}>
              {editing?.id === row.id ? (
                <div className="board-form" style={{ marginBottom: 0 }}>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="이름"
                  />
                  <input
                    type="email"
                    value={editing.email}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    placeholder="이메일"
                  />
                  <textarea
                    rows={4}
                    value={editing.message}
                    onChange={(e) => setEditing({ ...editing, message: e.target.value })}
                  />
                  <textarea
                    rows={3}
                    value={drafts[row.id] ?? editing.reply ?? ''}
                    onChange={(e) => setDrafts((cur) => ({ ...cur, [row.id]: e.target.value }))}
                    placeholder="답변"
                  />
                  <div className="nav-actions">
                    <button className="btn" type="button" onClick={() => void saveEdit()}>
                      저장
                    </button>
                    <button className="btn ghost" type="button" onClick={() => setEditing(null)}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{row.name}</h3>
                  <p className="muted">
                    {row.email} · {row.at.slice(0, 10)}
                  </p>
                  <p>{row.message}</p>
                  {row.reply ? (
                    <p className="inquiry-reply">
                      <b>해수</b> {row.reply}
                    </p>
                  ) : null}
                </>
              )}
              {supervisor && editing?.id !== row.id ? (
                <div className="board-form" style={{ marginTop: 12, marginBottom: 0 }}>
                  <textarea
                    rows={3}
                    value={drafts[row.id] ?? row.reply ?? ''}
                    onChange={(e) => setDrafts((cur) => ({ ...cur, [row.id]: e.target.value }))}
                    placeholder="답변"
                  />
                  <div className="nav-actions">
                    <button className="btn" type="button" onClick={() => void sendReply(row)}>
                      답변
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setEditing(row)
                        setDrafts((cur) => ({ ...cur, [row.id]: row.reply ?? '' }))
                      }}
                    >
                      수정
                    </button>
                    <button className="btn ghost" type="button" onClick={() => void drop(row.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
