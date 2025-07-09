# Knowly

## Google Calendar API 설정

실제 Google Meet 링크 생성을 위해 Google Calendar API 설정이 필요합니다:

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Calendar API 활성화
4. OAuth 2.0 클라이언트 ID 생성:
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `http://localhost:3000/auth/google/callback`

### 2. 환경변수 설정

`.env` 파일에 다음 설정을 추가:

```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 3. 필요한 스코프

- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

## 설치 및 실행

```bash
npm install
npm start
```

## 주요 기능

- 실제 Google Calendar API를 통한 Google Meet 링크 생성
- OAuth 2.0 인증을 통한 안전한 API 접근
- 예약 완료 시 자동으로 캘린더 이벤트 생성
- 참석자에게 자동 이메일 알림 발송
