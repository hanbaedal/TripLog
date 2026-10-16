import { Capacitor } from '@capacitor/core'

/** Static file under public/manual/ — replace to update the manual. */
export const USER_MANUAL_FILE = '/manual/triplog-user-manual.pptx'
export const USER_MANUAL_DOWNLOAD_NAME = 'TripLog-사용자메뉴얼.pptx'

export function userManualPublicUrl(): string {
  const base = Capacitor.isNativePlatform() ? 'https://triplog-361k.onrender.com' : window.location.origin
  return new URL(USER_MANUAL_FILE, base).href
}

export function userManualViewerUrl(): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(userManualPublicUrl())}`
}

export async function userManualAvailable(): Promise<boolean> {
  try {
    const res = await fetch(USER_MANUAL_FILE, { method: 'HEAD', cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}
