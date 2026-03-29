# Peter Kim Command Center — 배포 가이드

## 🚀 Vercel 배포 (3단계로 끝)

### 1단계: GitHub에 올리기
1. https://github.com/new 접속
2. Repository name: `peter-command-center` 입력
3. **Private** 선택 (비공개)
4. "Create repository" 클릭
5. 터미널에서 아래 명령어 실행:
```bash
cd ~/peter-command-center
git remote add origin https://github.com/YOUR_USERNAME/peter-command-center.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel에 연결
1. https://vercel.com/new 접속
2. "Import Git Repository" 클릭
3. `peter-command-center` 선택
4. Team: **pentahexagon** 선택
5. "Deploy" 클릭 → 자동 배포 완료!

### 3단계: Google Calendar 연동 (진짜 일정 표시)
1. Vercel 프로젝트 → Settings → Environment Variables
2. 아래 3개 추가:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console에서 발급 |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console에서 발급 |
| `GOOGLE_REFRESH_TOKEN` | OAuth 인증 후 발급 |
| `GOOGLE_CALENDAR_ID` | `eijconstruction0316@gmail.com` |

3. Redeploy 클릭

---

## 📱 핸드폰에 앱처럼 설치하기

### iPhone
1. Safari에서 배포된 URL 접속
2. 공유 버튼 (□↑) 터치
3. "홈 화면에 추가" 선택
4. "추가" 터치 → 완료!

### Android
1. Chrome에서 배포된 URL 접속
2. "홈 화면에 추가" 팝업이 뜸
3. "설치" 터치 → 완료!

---

## 🔑 Google Calendar API 키 발급 방법

1. https://console.cloud.google.com 접속
2. 프로젝트 생성 (이미 있으면 선택)
3. "API 및 서비스" → "라이브러리"
4. "Google Calendar API" 검색 → 사용 설정
5. "API 및 서비스" → "사용자 인증 정보"
6. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
7. 유형: 웹 애플리케이션
8. 리디렉션 URI: `https://developers.google.com/oauthplayground`
9. Client ID와 Client Secret 복사
10. https://developers.google.com/oauthplayground 접속
11. 오른쪽 상위 설정(⚙) → "Use your own OAuth credentials" 체크
12. Client ID, Client Secret 입력
13. 왼쪽에서 "Google Calendar API v3" 선택 → Authorize
14. "Exchange authorization code for tokens" 클릭
15. Refresh Token 복사 → Vercel 환경변수에 입력

---

환경변수 없이도 데모 모드로 작동합니다!
