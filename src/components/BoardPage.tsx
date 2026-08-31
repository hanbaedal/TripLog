import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { listBoard, saveBoardPost } from '../lib/community'
import type { BoardPost } from '../types'
import type { SiteNav } from '../lib/siteNav'

export function BoardPage(nav: SiteNav) {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [name, setName] = useState(nav.user?.name ?? '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const sorted = useMemo(() => [...posts].sort((a, b) => b.at.localeCompare(a.at)), [posts])

  useEffect(() => {
    void listBoard().then(setPosts)
  }, [])

  useEffect(() => {
    if (nav.user?.name) setName(nav.user.name)
  }, [nav.user])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const nextTitle = title.trim()
    const nextBody = body.trim()
    const nextName = (nav.user?.name || name).trim()
    if (!nextTitle || !nextBody || !nextName) {
      setError('이름, 제목, 내용이 필요합니다.')
      return
    }
    setError('')
    try {
      const saved = await saveBoardPost({
        name: nextName,
        title: nextTitle,
        body: nextBody,
        ownerId: nav.user?.id,
      })
      setPosts((cur) => [saved, ...cur.filter((row) => row.id !== saved.id)])
      setTitle('')
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '글을 남기지 못했습니다.')
    }
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>자유게시판</h2>
        </div>
        <form className="board-form" onSubmit={(e) => void submit(e)}>
          {nav.user ? null : (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" required />
          )}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="내용" required />
          <button className="btn" type="submit">
            글쓰기
          </button>
          {error ? <p className="muted">{error}</p> : null}
        </form>
        <div className="board-list">
          {sorted.map((post) => (
            <article className="info-card" key={post.id}>
              <h3>{post.title}</h3>
              <p className="muted">
                {post.name} · {post.at.slice(0, 10)}
              </p>
              <p>{post.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
