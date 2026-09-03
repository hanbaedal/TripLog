import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PageShell } from './PageShell'
import { isSupervisor } from '../lib/auth'
import {
  canEditBoard,
  listBoard,
  removeBoardComment,
  removeBoardPost,
  saveBoardComment,
  saveBoardPost,
} from '../lib/community'
import type { BoardComment, BoardPost } from '../types'
import type { SiteNav } from '../lib/siteNav'

export function BoardPage(nav: SiteNav) {
  const supervisor = isSupervisor(nav.user)
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [name, setName] = useState(nav.user?.name ?? '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editing, setEditing] = useState<BoardPost | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editComments, setEditComments] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const sorted = useMemo(() => [...posts].sort((a, b) => b.at.localeCompare(a.at)), [posts])

  useEffect(() => {
    void listBoard().then(setPosts)
  }, [])

  useEffect(() => {
    if (nav.user?.name) setName(nav.user.name)
  }, [nav.user])

  function replace(saved: BoardPost) {
    setPosts((cur) => cur.map((row) => (row.id === saved.id ? saved : row)))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!nav.user) {
      nav.go.auth()
      return
    }
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
        id: editing?.id,
        name: nextName,
        title: nextTitle,
        body: nextBody,
    ownerId: nav.user.id,
      })
      setPosts((cur) => [saved, ...cur.filter((row) => row.id !== saved.id)])
      setTitle('')
      setBody('')
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '글을 남기지 못했습니다.')
    }
  }

  function startEdit(post: BoardPost) {
    setEditing(post)
    setTitle(post.title)
    setBody(post.body)
    setName(post.name)
    setError('')
  }

  async function remove(id: string) {
    if (!window.confirm('이 글을 삭제할까요?')) return
    await removeBoardPost(id)
    setPosts((cur) => cur.filter((row) => row.id !== id))
    if (editing?.id === id) {
      setEditing(null)
      setTitle('')
      setBody('')
    }
  }

  async function sendComment(post: BoardPost) {
    if (!nav.user) {
      nav.go.auth()
      return
    }
    const text = (drafts[post.id] || '').trim()
    if (!text) return
    const saved = await saveBoardComment(post.id, text, { name: nav.user.name, ownerId: nav.user.id })
    replace(saved)
    setDrafts((cur) => ({ ...cur, [post.id]: '' }))
  }

  async function saveComment(post: BoardPost, comment: BoardComment) {
    const text = (editComments[comment.id] ?? comment.body).trim()
    if (!text) return
    const saved = await saveBoardComment(post.id, text, { commentId: comment.id })
    replace(saved)
    setEditComments((cur) => {
      const next = { ...cur }
      delete next[comment.id]
      return next
    })
  }

  async function dropComment(post: BoardPost, commentId: string) {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    replace(await removeBoardComment(post.id, commentId))
  }

  function canEditComment(comment: BoardComment) {
    if (!nav.user) return false
    return supervisor || comment.ownerId === nav.user.id
  }

  return (
    <PageShell {...nav}>
      <section className="wrap section">
        <div className="section-head">
          <h2>자유게시판</h2>
        </div>
        {nav.user ? (
        <form className="board-form" onSubmit={(e) => void submit(e)}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="내용" required />
          <div className="nav-actions">
            <button className="btn" type="submit">
              {editing ? '수정' : '글쓰기'}
            </button>
            {editing ? (
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setEditing(null)
                  setTitle('')
                  setBody('')
                }}
              >
                취소
              </button>
            ) : null}
          </div>
          {error ? <p className="muted">{error}</p> : null}
        </form>
        ) : (
          <p className="muted board-readonly-note">글쓰기와 댓글은 로그인 후 이용할 수 있습니다.</p>
        )}
        <div className="board-list">
          {sorted.map((post) => (
            <article className="info-card" key={post.id}>
              <h3>{post.title}</h3>
              <p className="muted">
                {post.name} · {post.at.slice(0, 10)}
              </p>
              <p>{post.body}</p>
              {canEditBoard(post, nav.user) ? (
                <div className="nav-actions">
                  <button className="btn ghost" type="button" onClick={() => startEdit(post)}>
                    수정
                  </button>
                  <button className="btn ghost" type="button" onClick={() => void remove(post.id)}>
                    삭제
                  </button>
                </div>
              ) : null}

              <div className="comment-list">
                {(post.comments || []).map((comment) => (
                  <div className="comment-item" key={comment.id}>
                    {editComments[comment.id] != null ? (
                      <>
                        <textarea
                          rows={2}
                          value={editComments[comment.id]}
                          onChange={(e) => setEditComments((cur) => ({ ...cur, [comment.id]: e.target.value }))}
                        />
                        <div className="nav-actions">
                          <button className="btn" type="button" onClick={() => void saveComment(post, comment)}>
                            저장
                          </button>
                          <button
                            className="btn ghost"
                            type="button"
                            onClick={() =>
                              setEditComments((cur) => {
                                const next = { ...cur }
                                delete next[comment.id]
                                return next
                              })
                            }
                          >
                            취소
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          <b>{comment.name}</b> {comment.body}
                        </p>
                        <p className="muted">{comment.at.slice(0, 10)}</p>
                        {canEditComment(comment) ? (
                          <div className="nav-actions">
                            <button
                              className="btn ghost"
                              type="button"
                              onClick={() => setEditComments((cur) => ({ ...cur, [comment.id]: comment.body }))}
                            >
                              수정
                            </button>
                            <button className="btn ghost" type="button" onClick={() => void dropComment(post, comment.id)}>
                              삭제
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                ))}
                {nav.user ? (
                  <div className="comment-write">
                    <textarea
                      rows={2}
                      value={drafts[post.id] || ''}
                      onChange={(e) => setDrafts((cur) => ({ ...cur, [post.id]: e.target.value }))}
                      placeholder="댓글"
                    />
                    <button className="btn" type="button" onClick={() => void sendComment(post)}>
                      댓글
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
