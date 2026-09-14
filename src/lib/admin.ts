import type { User } from '../types'
import { api } from './remote'

export type AdminUser = User & { createdAt?: string }

export async function listUsers(): Promise<AdminUser[]> {
  const data = await api<{ users: AdminUser[] }>('/admin/users')
  return data.users || []
}

export async function updateUser(
  id: string,
  input: Partial<Pick<User, 'name' | 'email' | 'phone' | 'role'>> & { password?: string },
): Promise<User> {
  const data = await api<{ user: User }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return data.user
}

export async function removeUser(id: string): Promise<void> {
  await api(`/admin/users/${id}`, { method: 'DELETE' })
}
