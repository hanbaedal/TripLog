import { mergeGallery } from '../data/galleryPhotos'
import { invalidateGalleryCache } from './galleryResolve'
import { TRAVEL_INFO_CATALOG } from '../data/travelInfoCatalog.js'
import { TRAVEL_SPOT_CATALOG } from '../data/travelSpotCatalog.js'
import type { BoardPost, GalleryPhoto, Inquiry, TravelInfo, TravelSpot, User } from '../types'
import { isSupervisor } from './auth'
import { api } from './remote'

const GUEST_INQUIRY_KEY = 'triplog.inquiry.guestIds'

function catalogTravel(): TravelInfo[] {
  return (TRAVEL_INFO_CATALOG as TravelInfo[]).map((row) => ({ ...row, catalog: true }))
}

function catalogSpots(cityId: string): TravelSpot[] {
  return (TRAVEL_SPOT_CATALOG as TravelSpot[]).filter((row) => row.cityId === cityId).map((row) => ({ ...row, catalog: true }))
}

export function guestInquiryIds(): string[] {
  try {
    const raw = sessionStorage.getItem(GUEST_INQUIRY_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function rememberGuestInquiry(id: string) {
  const next = [...new Set([id, ...guestInquiryIds()])]
  sessionStorage.setItem(GUEST_INQUIRY_KEY, JSON.stringify(next))
}

export async function listGallery(): Promise<GalleryPhoto[]> {
  const data = await api<{ photos: GalleryPhoto[] }>('/gallery')
  return mergeGallery(data.photos || [])
}

export async function saveGalleryPhoto(photo: GalleryPhoto): Promise<GalleryPhoto> {
  const data = await api<{ photo: GalleryPhoto }>(photo.id ? `/gallery/${photo.id}` : '/gallery', {
    method: photo.id ? 'PUT' : 'POST',
    body: JSON.stringify(photo),
  })
  invalidateGalleryCache()
  return data.photo
}

export async function removeGalleryPhoto(id: string): Promise<void> {
  await api(`/gallery/${id}`, { method: 'DELETE' })
  invalidateGalleryCache()
}

export function canEditGallery(photo: GalleryPhoto, user?: User | null): boolean {
  if (!user) return false
  if (photo.catalog) return isSupervisor(user)
  return isSupervisor(user) || photo.ownerId === user.id
}

export async function listBoard(): Promise<BoardPost[]> {
  const data = await api<{ posts: BoardPost[] }>('/board')
  return data.posts || []
}

export async function saveBoardPost(post: Omit<BoardPost, 'id' | 'at' | 'comments'> & { id?: string }): Promise<BoardPost> {
  if (!post.ownerId) throw new Error('로그인이 필요합니다.')
  const data = await api<{ post: BoardPost }>(post.id ? `/board/${post.id}` : '/board', {
    method: post.id ? 'PUT' : 'POST',
    body: JSON.stringify(post),
  })
  return data.post
}

export async function removeBoardPost(id: string): Promise<void> {
  await api(`/board/${id}`, { method: 'DELETE' })
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
  const data = await api<{ post: BoardPost }>(
    commentId ? `/board/${postId}/comments/${commentId}` : `/board/${postId}/comments`,
    {
      method: commentId ? 'PUT' : 'POST',
      body: JSON.stringify({ body }),
    },
  )
  return data.post
}

export async function removeBoardComment(postId: string, commentId: string): Promise<BoardPost> {
  const data = await api<{ post: BoardPost }>(`/board/${postId}/comments/${commentId}`, { method: 'DELETE' })
  return data.post
}

export async function listInquiries(ids?: string[]): Promise<Inquiry[]> {
  const q = ids?.length ? `?ids=${encodeURIComponent(ids.join(','))}` : ''
  const data = await api<{ inquiries: Inquiry[] }>(`/inquiries${q}`)
  return data.inquiries || []
}

export async function saveInquiry(input: Omit<Inquiry, 'id' | 'at' | 'reply' | 'replyAt'>): Promise<Inquiry> {
  const data = await api<{ inquiry: Inquiry }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!input.ownerId) rememberGuestInquiry(data.inquiry.id)
  return data.inquiry
}

export async function updateInquiry(inquiry: Inquiry): Promise<Inquiry> {
  const data = await api<{ inquiry: Inquiry }>(`/inquiries/${inquiry.id}`, {
    method: 'PUT',
    body: JSON.stringify(inquiry),
  })
  return data.inquiry
}

export async function removeInquiry(id: string): Promise<void> {
  await api(`/inquiries/${id}`, { method: 'DELETE' })
}

export async function replyInquiry(id: string, reply: string): Promise<Inquiry> {
  const data = await api<{ inquiry: Inquiry }>(`/inquiries/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ reply }),
  })
  return data.inquiry
}

export async function listTravelInfo(): Promise<TravelInfo[]> {
  const data = await api<{ items: TravelInfo[] }>('/travel-info')
  return data.items?.length ? data.items : catalogTravel()
}

export async function saveTravelInfo(item: Omit<TravelInfo, 'id' | 'at'> & { id?: string }): Promise<TravelInfo> {
  const data = await api<{ item: TravelInfo }>(item.id ? `/travel-info/${item.id}` : '/travel-info', {
    method: item.id ? 'PUT' : 'POST',
    body: JSON.stringify(item),
  })
  return data.item
}

export async function removeTravelInfo(id: string): Promise<void> {
  await api(`/travel-info/${id}`, { method: 'DELETE' })
}

export function canEditTravelInfo(item: TravelInfo, user?: User | null): boolean {
  if (!user) return false
  if (isSupervisor(user)) return true
  if (item.catalog) return false
  return item.ownerId === user.id
}

export async function listTravelSpots(cityId: string): Promise<TravelSpot[]> {
  const data = await api<{ spots: TravelSpot[] }>(`/travel-info/${encodeURIComponent(cityId)}/spots`)
  return data.spots?.length ? data.spots : catalogSpots(cityId)
}

export async function saveTravelSpot(
  spot: Omit<TravelSpot, 'id' | 'at'> & { id?: string },
): Promise<TravelSpot> {
  const data = await api<{ spot: TravelSpot }>(
    spot.id ? `/travel-info/spots/${spot.id}` : `/travel-info/${encodeURIComponent(spot.cityId)}/spots`,
    {
      method: spot.id ? 'PUT' : 'POST',
      body: JSON.stringify(spot),
    },
  )
  return data.spot
}

export async function removeTravelSpot(id: string): Promise<void> {
  await api(`/travel-info/spots/${id}`, { method: 'DELETE' })
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

export { GALLERY_PHOTOS } from '../data/galleryPhotos'
