import type { ReactNode } from 'react'
import { AppNav } from './AppNav'
import { SideMenu } from './SideMenu'
import type { SiteNav } from '../lib/siteNav'

type Props = SiteNav & {
  children: ReactNode
  wide?: boolean
}

export function PageShell({ children, wide, ...nav }: Props) {
  return (
    <div>
      <AppNav {...nav} />
      {wide ? (
        children
      ) : (
        <div className="page-body">
          <SideMenu {...nav} />
          <div className="page-main">{children}</div>
        </div>
      )}
    </div>
  )
}
