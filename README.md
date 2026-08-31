# TripLog (triplog.my)

나만의 여행 일정 · 항공 · 호텔 · 식사 · 예상비용 · 안내서.

- GitHub: [hanbaedal/TripLog](https://github.com/hanbaedal/TripLog)
- MongoDB Atlas: 창길's Org / Project `triplog`
- Render: My project / Production / `TripLog`

## 로컬

```bash
npm install
```

프론트만:

```bash
npm run dev
```

MongoDB까지:

1. `.env.example`을 `.env`로 복사하고 Atlas 연결 문자열을 넣습니다.
2. `npm run dev:all`

## Render

1. GitHub `hanbaedal/TripLog`를 Production 서비스 `TripLog`에 연결합니다.
2. Build: `npm ci && npm run build` / Start: `npm start`
3. Environment
   - `MONGODB_URI` — Atlas Project **triplog** 클러스터 연결 문자열
   - `MONGODB_DB=triplog`
   - `JWT_SECRET` — 임의 긴 문자열
4. Atlas Network Access에 `0.0.0.0/0`을 허용해야 Render에서 접속됩니다.

항공·호텔 검색은 시범 연동이며 결제·발권은 하지 않습니다.
