import { useEffect, useState } from 'react'
import { PageShell } from './PageShell'
import type { SiteNav } from '../lib/siteNav'
import {
  USER_MANUAL_DOWNLOAD_NAME,
  USER_MANUAL_FILE,
  userManualAvailable,
  userManualPublicUrl,
  userManualViewerUrl,
} from '../lib/userManual'

export function UserManualPage(nav: SiteNav) {
  const [ready, setReady] = useState<boolean | null>(null)

  useEffect(() => {
    void userManualAvailable().then(setReady)
  }, [])

  const downloadHref = USER_MANUAL_FILE
  const viewerSrc = userManualViewerUrl()

  return (
    <PageShell {...nav} wide shellClass="manual-shell">
      <section className="wrap section manual-page">
        <div className="section-head manual-head">
          <div>
            <h2>사용자메뉴얼</h2>
            <p className="muted manual-lead">TripLog 이용 방법을 PPT 형식으로 보거나 파일로 저장할 수 있습니다.</p>
          </div>
          <div className="manual-actions">
            <a
              className="btn"
              href={downloadHref}
              download={USER_MANUAL_DOWNLOAD_NAME}
              aria-disabled={ready === false}
              onClick={(e) => {
                if (ready === false) e.preventDefault()
              }}
            >
              PPT 다운로드
            </a>
            <a className="btn ghost" href={userManualPublicUrl()} target="_blank" rel="noopener noreferrer">
              새 창에서 열기
            </a>
          </div>
        </div>

        {ready === null ? <p className="muted">메뉴얼을 불러오는 중…</p> : null}
        {ready === false ? (
          <p className="form-error">메뉴얼 파일을 찾지 못했습니다. 관리자에게 문의해 주세요.</p>
        ) : null}
        {ready ? (
          <div className="manual-viewer-wrap">
            <iframe
              className="manual-viewer"
              title="TripLog 사용자메뉴얼 PPT 보기"
              src={viewerSrc}
              allowFullScreen
            />
            <p className="muted manual-viewer-note">
              슬라이드가 보이지 않으면 「PPT 다운로드」 후 PowerPoint·한컴오피스 등에서 열어 주세요.
            </p>
          </div>
        ) : null}
      </section>
    </PageShell>
  )
}
