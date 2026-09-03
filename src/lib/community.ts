import { GALLERY_PHOTOS, mergeGallery } from '../data/galleryPhotos'
import { invalidateGalleryCache } from './galleryResolve'
import { TRAVEL_INFO_CATALOG } from '../data/travelInfoCatalog.js'
import { TRAVEL_SPOT_CATALOG } from '../data/travelSpotCatalog.js'
import type { BoardPost, GalleryPhoto, Inquiry, TravelInfo, TravelSpot, User } from '../types'
import { isSupervisor } from './auth'
import { uid } from './id'
import { api, isRemote } from './remote'

const GALLERY_KEY = 'triplog.gallery.v1'
const BOARD_KEY = 'triplog.board.v1'
const INQUIRY_KEY = 'triplog.inquiry.v1'
const GUEST_INQUIRY_KEY = 'triplog.inquiry.guestIds.v1'
const TRAVEL_KEY = 'triplog.travel.v1'
const TRAVEL_DELETED_KEY = 'triplog.travel.deleted.v1'
const TRAVEL_SPOT_KEY = 'triplog.travel.spots.v1'
const TRAVEL_SPOT_DELETED_KEY = 'triplog.travel.spots.deleted.v1'

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
  return Array.isArray(rows) ? rows.map((row) => ({ ...row, comments: row.comments || [] })) : []
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

function catalogTravel(): TravelInfo[] {
  return (TRAVEL_INFO_CATALOG as TravelInfo[]).map((row) => ({ ...row, catalog: true }))
}

function localTravel(): TravelInfo[] {
  const rows = readJson<TravelInfo[]>(TRAVEL_KEY, [])
  return Array.isArray(rows) ? rows : []
}

function deletedTravelIds(): string[] {
  const rows = readJson<string[]>(TRAVEL_DELETED_KEY, [])
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function mergeTravel(extra: TravelInfo[]): TravelInfo[] {
  const deleted = new Set(deletedTravelIds())
  const map = new Map<string, TravelInfo>()
  for (const row of catalogTravel()) map.set(row.id, row)
  for (const row of extra) map.set(row.id, row)
  return [...map.values()]
    .filter((row) => !deleted.has(row.id))
    .sort((a, b) => (a.sort || 80) - (b.sort || 80) || (a.place || '').localeCompare(b.place || ''))
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
    invalidateGalleryCache()
    return data.photo
  }
  const rows = localGallery()
  if (photo.id) {
    writeJson(GALLERY_KEY, rows.map((row) => (row.id === photo.id ? photo : row)))
    invalidateGalleryCache()
    return photo
  }
  const saved = { ...photo, id: uid('gal'), at: new Date().toISOString() }
  writeJson(GALLERY_KEY, [saved, ...rows])
  invalidateGalleryCache()
  return saved
}

export async function removeGalleryPhoto(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/gallery/${id}`, { method: 'DELETE' })
    invalidateGalleryCache()
    return
  }
  writeJson(GALLERY_KEY, localGallery().filter((row) => row.id !== id))
  invalidateGalleryCache()
}

export function canEditGallery(photo: GalleryPhoto, user?: User | null): boolean {
  if (!user) return false
  if (photo.catalog) return isSupervisor(user)
  return isSupervisor(user) || photo.ownerId === user.id
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

export async function saveBoardPost(post: Omit<BoardPost, 'id' | 'at' | 'comments'> & { id?: string }): Promise<BoardPost> {
  if (!post.ownerId) throw new Error('로그인이 필요합니다.')
  if (isRemote()) {
    const data = await api<{ post: BoardPost }>(post.id ? `/board/${post.id}` : '/board', {
      method: post.id ? 'PUT' : 'POST',
      body: JSON.stringify(post),
    })
    return data.post
  }
  const rows = localBoard()
  if (post.id) {
    const next = rows.map((row) =>
      row.id === post.id ? { ...row, title: post.title, body: post.body, name: post.name } : row,
    )
    writeJson(BOARD_KEY, next)
    const found = next.find((row) => row.id === post.id)
    if (!found) throw new Error('글을 찾지 못했습니다.')
    return found
  }
  const saved: BoardPost = {
    id: uid('post'),
    name: post.name,
    title: post.title,
    body: post.body,
    ownerId: post.ownerId,
    at: new Date().toISOString(),
    comments: [],
  }
  writeJson(BOARD_KEY, [saved, ...rows])
  return saved
}

export async function removeBoardPost(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/board/${id}`, { method: 'DELETE' })
    return
  }
  writeJson(BOARD_KEY, localBoard().filter((row) => row.id !== id))
}

export function canEditBoard(post: BoardPost, user?: User | null): boolean {
  if (!user) return false
  return isSupervisor(user) || post.ownerId === user.id
}

export async function saveBoardComment(
  postId: string,
  body: string,
  opts?: { commentId?: string; name?: string; ownerId?: string },
): Promise<BoardPost> {
  const commentId = opts?.commentId
  if (isRemote()) {
    const data = await api<{ post: BoardPost }>(
      commentId ? `/board/${postId}/comments/${commentId}` : `/board/${postId}/comments`,
      {
        method: commentId ? 'PUT' : 'POST',
        body: JSON.stringify({ body }),
      },
    )
    return data.post
  }
  const rows = localBoard()
  const next = rows.map((row) => {
    if (row.id !== postId) return row
    const comments = row.comments || []
    if (commentId) {
      return {
        ...row,
        comments: comments.map((item) => (item.id === commentId ? { ...item, body } : item)),
      }
    }
    return {
      ...row,
      comments: [
        ...comments,
        {
          id: uid('cmt'),
          name: opts?.name || '',
          ownerId: opts?.ownerId,
          body,
          at: new Date().toISOString(),
        },
      ],
    }
  })
  writeJson(BOARD_KEY, next)
  const found = next.find((row) => row.id === postId)
  if (!found) throw new Error('글을 찾지 못했습니다.')
  return found
}

export async function removeBoardComment(postId: string, commentId: string): Promise<BoardPost> {
  if (isRemote()) {
    const data = await api<{ post: BoardPost }>(`/board/${postId}/comments/${commentId}`, { method: 'DELETE' })
    return data.post
  }
  const next = localBoard().map((row) =>
    row.id === postId ? { ...row, comments: (row.comments || []).filter((item) => item.id !== commentId) } : row,
  )
  writeJson(BOARD_KEY, next)
  const found = next.find((row) => row.id === postId)
  if (!found) throw new Error('글을 찾지 못했습니다.')
  return found
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

export async function updateInquiry(inquiry: Inquiry): Promise<Inquiry> {
  if (isRemote()) {
    const data = await api<{ inquiry: Inquiry }>(`/inquiries/${inquiry.id}`, {
      method: 'PUT',
      body: JSON.stringify(inquiry),
    })
    return data.inquiry
  }
  const rows = localInquiries().map((row) => (row.id === inquiry.id ? inquiry : row))
  writeJson(INQUIRY_KEY, rows)
  const found = rows.find((row) => row.id === inquiry.id)
  if (!found) throw new Error('문의를 찾지 못했습니다.')
  return found
}

export async function removeInquiry(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/inquiries/${id}`, { method: 'DELETE' })
    return
  }
  writeJson(INQUIRY_KEY, localInquiries().filter((row) => row.id !== id))
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

export async function listTravelInfo(): Promise<TravelInfo[]> {
  if (isRemote()) {
    try {
      const data = await api<{ items: TravelInfo[] }>('/travel-info')
      return data.items?.length ? data.items : catalogTravel()
    } catch {
      return mergeTravel(localTravel())
    }
  }
  return mergeTravel(localTravel())
}

export async function saveTravelInfo(item: Omit<TravelInfo, 'id' | 'at'> & { id?: string }): Promise<TravelInfo> {
  if (isRemote()) {
    const data = await api<{ item: TravelInfo }>(item.id ? `/travel-info/${item.id}` : '/travel-info', {
      method: item.id ? 'PUT' : 'POST',
      body: JSON.stringify(item),
    })
    return data.item
  }
  const rows = localTravel()
  if (item.id) {
    const saved = { ...item, id: item.id, at: new Date().toISOString() }
    const next = rows.some((row) => row.id === item.id)
      ? rows.map((row) => (row.id === item.id ? saved : row))
      : [...rows, saved]
    writeJson(TRAVEL_KEY, next)
    writeJson(TRAVEL_DELETED_KEY, deletedTravelIds().filter((id) => id !== item.id))
    return saved
  }
  const saved: TravelInfo = { ...item, id: uid('info'), at: new Date().toISOString(), catalog: false }
  writeJson(TRAVEL_KEY, [saved, ...rows])
  return saved
}

export async function removeTravelInfo(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/travel-info/${id}`, { method: 'DELETE' })
    return
  }
  writeJson(TRAVEL_KEY, localTravel().filter((row) => row.id !== id))
  writeJson(TRAVEL_DELETED_KEY, [...new Set([...deletedTravelIds(), id])])
  writeJson(
    TRAVEL_SPOT_KEY,
    localSpots().filter((row) => row.cityId !== id),
  )
}

export function canEditTravelInfo(item: TravelInfo, user?: User | null): boolean {
  if (!user) return false
  if (isSupervisor(user)) return true
  if (item.catalog) return false
  return item.ownerId === user.id
}

function catalogSpots(cityId: string): TravelSpot[] {
  return (TRAVEL_SPOT_CATALOG as TravelSpot[]).filter((row) => row.cityId === cityId).map((row) => ({ ...row, catalog: true }))
}

function localSpots(): TravelSpot[] {
  const rows = readJson<TravelSpot[]>(TRAVEL_SPOT_KEY, [])
  return Array.isArray(rows) ? rows : []
}

function deletedSpotIds(): string[] {
  const rows = readJson<string[]>(TRAVEL_SPOT_DELETED_KEY, [])
  return Array.isArray(rows) ? rows.filter(Boolean) : []
}

function mergeSpots(cityId: string, extra: TravelSpot[]): TravelSpot[] {
  const deleted = new Set(deletedSpotIds())
  const map = new Map<string, TravelSpot>()
  for (const row of catalogSpots(cityId)) map.set(row.id, row)
  for (const row of extra.filter((row) => row.cityId === cityId)) map.set(row.id, row)
  return [...map.values()]
    .filter((row) => !deleted.has(row.id))
    .sort((a, b) => (a.sort || 80) - (b.sort || 80) || a.name.localeCompare(b.name, 'ko'))
}

export async function listTravelSpots(cityId: string): Promise<TravelSpot[]> {
  if (isRemote()) {
    try {
      const data = await api<{ spots: TravelSpot[] }>(`/travel-info/${encodeURIComponent(cityId)}/spots`)
      return data.spots?.length ? data.spots : catalogSpots(cityId)
    } catch {
      return mergeSpots(cityId, localSpots())
    }
  }
  return mergeSpots(cityId, localSpots())
}

export async function saveTravelSpot(
  spot: Omit<TravelSpot, 'id' | 'at'> & { id?: string },
): Promise<TravelSpot> {
  if (isRemote()) {
    const data = await api<{ spot: TravelSpot }>(
      spot.id ? `/travel-info/spots/${spot.id}` : `/travel-info/${encodeURIComponent(spot.cityId)}/spots`,
      {
        method: spot.id ? 'PUT' : 'POST',
        body: JSON.stringify(spot),
      },
    )
    return data.spot
  }
  const rows = localSpots()
  if (spot.id) {
    const saved = { ...spot, id: spot.id, at: new Date().toISOString() }
    const next = rows.some((row) => row.id === spot.id)
      ? rows.map((row) => (row.id === spot.id ? saved : row))
      : [...rows, saved]
    writeJson(TRAVEL_SPOT_KEY, next)
    writeJson(TRAVEL_SPOT_DELETED_KEY, deletedSpotIds().filter((id) => id !== spot.id))
    return saved
  }
  const saved: TravelSpot = { ...spot, id: uid('spot'), at: new Date().toISOString(), catalog: false }
  writeJson(TRAVEL_SPOT_KEY, [saved, ...rows])
  return saved
}

export async function removeTravelSpot(id: string): Promise<void> {
  if (isRemote()) {
    await api(`/travel-info/spots/${id}`, { method: 'DELETE' })
    return
  }
  writeJson(TRAVEL_SPOT_KEY, localSpots().filter((row) => row.id !== id))
  writeJson(TRAVEL_SPOT_DELETED_KEY, [...new Set([...deletedSpotIds(), id])])
}

export function canEditTravelSpot(spot: TravelSpot, user?: User | null): boolean {
  if (!user) return false
  if (isSupervisor(user)) return true
  if (spot.catalog) return false
  return spot.ownerId === user.id
}

export async function findTravelInfo(id: string): Promise<TravelInfo | undefined> {
  const rows = await listTravelInfo()
  return rows.find((row) => row.id === id)
}

export { GALLERY_PHOTOS }
