import type { User } from '../types'
import { api, isRemote } from './remote'

export type AdminUser = User & { createdAt?: string }

export async function listUsers(): Promise<AdminUser[]> {
  if (!isRemote()) return []
  const data = await api<{ users: AdminUser[] }>('/admin/users')
  return data.users || []
}

export async function updateUser(
  id: string,
  input: Partial<Pick<User, 'name' | 'email' | 'phone' | 'role'>> & { password?: string },
): Promise<User> {
  if (!isRemote()) throw new Error('회원 관리는 서버 연결 시에만 가능합니다.')
  const data = await api<{ user: User }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return data.user
}

export async function removeUser(id: string): Promise<void> {
  if (!isRemote()) throw new Error('회원 관리는 서버 연결 시에만 가능합니다.')
  await api(`/admin/users/${id}`, { method: 'DELETE' })
}
