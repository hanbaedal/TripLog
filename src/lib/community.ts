import { GALLERY_PHOTOS, mergeGallery } from '../data/galleryPhotos'
import type { BoardPost, GalleryPhoto, Inquiry } from '../types'
import { uid } from './id'
import { api, isRemote } from './remote'

const GALLERY_KEY = 'triplog.gallery.v1'
const BOARD_KEY = 'triplog.board.v1'
const INQUIRY_KEY = 'triplog.inquiry.v1'
const GUEST_INQUIRY_KEY = 'triplog.inquiry.guestIds.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as T) : fallback
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function localGallery(): GalleryPhoto[] {
  const rows = readJson<GalleryPhoto[]>(GALLERY_KEY, [])
  return Array.isArray(rows) ? rows : []
}

function localBoard(): BoardPost[] {
  const rows = readJson<BoardPost[]>(BOARD_KEY, [])
  return Array.isArray(rows) ? rows : []
}

function localInquiries(): Inquiry[] {
  const rows = readJson<unknown[]>(INQUIRY_KEY, [])
  if (!Array.isArray(rows)) return []
  return rows.map((row) => {
    const item = row as Inquiry
    return {
      id: item.id || uid('inq'),
      name: item.name || '',
      email: item.email || '',
      message: item.message || '',
      at: item.at || new Date().toISOString(),
      ownerId: item.ownerId,
      reply: item.reply,
      replyAt: item.replyAt,
    }
  })
}

export function guestInquiryIds(): string[] {
  const rows = readJson<string[]>(GUEST_INQUIRY_KEY, [])
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function rememberGuestInquiry(id: string) {
  const next = [...new Set([id, ...guestInquiryIds()])]
  writeJson(GUEST_INQUIRY_KEY, next)
}

export async function listGallery(): Promise<GalleryPhoto[]> {
  if (isRemote()) {
    try {
      const data = await api<{ photos: GalleryPhoto[] }>('/gallery')
      return mergeGallery(data.photos || [])
    } catch {
      return mergeGallery(localGallery())
    }
  }
  return mergeGallery(localGallery())
}

export async function saveGalleryPhoto(photo: GalleryPhoto): Promise<GalleryPhoto> {
  if (isRemote()) {
    const data = await api<{ photo: GalleryPhoto }>(photo.id ? `/gallery/${photo.id}` : '/gallery', {
      method: photo.id ? 'PUT' : 'POST',
      body: JSON.stringify(photo),
    })
    return data.photo
  }
  const rows = localGallery()
  if (photo.id) {
    writeJson(GALLERY_KEY, rows.map((row) => (row.id === photo.id ? photo : row)))
    return photo
  }
  const saved = { ...photo, id: uid('gal'), at: new Date().toISOString() }
  writeJson(GALLERY_KEY, [saved, ...rows])
  return saved
}

export async function removeGalleryPhoto(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/gallery/${id}`, { method: 'DELETE' })
    return
  }
  writeJson(GALLERY_KEY, localGallery().filter((row) => row.id !== id))
}

export function canEditGallery(photo: GalleryPhoto, userId?: string | null): boolean {
  if (!userId || photo.catalog) return false
  return photo.ownerId === userId
}

export async function listBoard(): Promise<BoardPost[]> {
  if (isRemote()) {
    try {
      const data = await api<{ posts: BoardPost[] }>('/board')
      return data.posts || []
    } catch {
      return localBoard()
    }
  }
  return localBoard()
}

export async function saveBoardPost(post: Omit<BoardPost, 'id' | 'at'> & { id?: string }): Promise<BoardPost> {
  if (isRemote()) {
    const data = await api<{ post: BoardPost }>('/board', {
      method: 'POST',
      body: JSON.stringify(post),
    })
    return data.post
  }
  const saved: BoardPost = {
    id: uid('post'),
    name: post.name,
    title: post.title,
    body: post.body,
    ownerId: post.ownerId,
    at: new Date().toISOString(),
  }
  writeJson(BOARD_KEY, [saved, ...localBoard()])
  return saved
}

export async function listInquiries(ids?: string[]): Promise<Inquiry[]> {
  if (isRemote()) {
    try {
      const q = ids?.length ? `?ids=${encodeURIComponent(ids.join(','))}` : ''
      const data = await api<{ inquiries: Inquiry[] }>(`/inquiries${q}`)
      return data.inquiries || []
    } catch {
      const rows = localInquiries()
      if (ids) return rows.filter((row) => ids.includes(row.id))
      return rows
    }
  }
  const rows = localInquiries()
  if (ids) return rows.filter((row) => ids.includes(row.id))
  return rows
}

export async function saveInquiry(input: Omit<Inquiry, 'id' | 'at' | 'reply' | 'replyAt'>): Promise<Inquiry> {
  if (isRemote()) {
    const data = await api<{ inquiry: Inquiry }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (!input.ownerId) rememberGuestInquiry(data.inquiry.id)
    return data.inquiry
  }
  const saved: Inquiry = {
    ...input,
    id: uid('inq'),
    at: new Date().toISOString(),
  }
  writeJson(INQUIRY_KEY, [saved, ...localInquiries()])
  if (!input.ownerId) rememberGuestInquiry(saved.id)
  return saved
}

export async function replyInquiry(id: string, reply: string): Promise<Inquiry> {
  if (isRemote()) {
    const data = await api<{ inquiry: Inquiry }>(`/inquiries/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply }),
    })
    return data.inquiry
  }
  const rows = localInquiries().map((row) =>
    row.id === id ? { ...row, reply: reply.trim(), replyAt: new Date().toISOString() } : row,
  )
  writeJson(INQUIRY_KEY, rows)
  const found = rows.find((row) => row.id === id)
  if (!found) throw new Error('문의를 찾지 못했습니다.')
  return found
}

export { GALLERY_PHOTOS }
