import { useEffect, useState, type ReactNode } from 'react'
import { AppNav } from './AppNav'
import { SideMenu } from './SideMenu'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  children: ReactNode
  wide?: boolean
  shellClass?: string
}

export function PageShell({ children, wide, shellClass, ...nav }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [nav.view])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const menu = (
    <SideMenu
      {...nav}
      overlay={wide}
      drawerOpen={drawerOpen}
      onDrawerClose={() => setDrawerOpen(false)}
    />
  )

  return (
    <div className={shellClass}>
      <AppNav
        {...nav}
        menuOpen={drawerOpen}
        onOpenMenu={() => setDrawerOpen((open) => !open)}
      />
      {wide ? (
        <>
          {menu}
          {children}
        </>
      ) : (
        <div className="page-body">
          {menu}
          <div className="page-main">{children}</div>
        </div>
      )}
    </div>
  )
}
