# TripLog (triplog.my)

나만의 여행 일정 · 항공 · 호텔 · 식사 · 예상비용 · 안내서.

- **서비스**: https://triplog.my
- **GitHub**: [hanbaedal/TripLog](https://github.com/hanbaedal/TripLog)
- **Render**: Production 서비스 `TripLog` (빌드·운영)
- **DB**: MongoDB Atlas Project `triplog`

## 배포 (Render)

일반 사용자·운영은 **Render + triplog.my** 기준입니다. 로컬에서 API·프론트를 띄울 필요는 없습니다.

1. 변경 사항을 GitHub `main`에 push
2. Render **Auto-Deploy** (On Commit) 또는 **Manual Deploy → Deploy latest commit**
3. Build: `npm ci && npm run build` · Start: `npm start` · Health: `/api/health`

### Render Environment (요약)

| 변수 | 비고 |
|------|------|
| `MONGODB_URI` | Atlas 연결 문자열 |
| `MONGODB_DB` | `triplog` |
| `JWT_SECRET` | 강한 임의 값 |
| `APP_URL` | `https://triplog.my` |
| `KAKAO_*` / `GOOGLE_*` | 소셜 로그인 (선택) |
| `UPLOAD_DIR` | Persistent Disk 사용 시 `/opt/render/project/src/uploads` |

Atlas Network Access에 Render IP 또는 `0.0.0.0/0` 허용.

환경 변수 템플릿: `.env.example` (로컬 `.env` 운영은 하지 않음, Render 설정 참고용).

## Android APK (선택)

Render 배포와 별도로 APK만 만들 때:

```bash
npm run android:apk
```

APK는 `https://triplog.my` API를 사용합니다.

## 저장소 유지보수

코드 수정·배포는 **GitHub push → Render 빌드** 흐름만 사용합니다.  
`npm run build` / `npm start`는 Render 빌드·시작 명령과 동일합니다.

항공·호텔 검색은 시범 연동이며 결제·발권은 하지 않습니다.