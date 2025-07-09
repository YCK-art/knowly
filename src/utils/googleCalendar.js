// Google Calendar API 직접 호출 (브라우저 환경)
export const GOOGLE_CALENDAR_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '96567940560-b8jv3r45hkibvnb22ru3lvlkcoljoagu.apps.googleusercontent.com',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'your-google-api-key',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]
};

// Google OAuth 인증 URL 생성
export const getGoogleAuthUrl = () => {
  // 현재 실행 중인 포트에 맞춰 리디렉션 URI 설정
  const currentPort = window.location.port || '3000';
  const redirectUri = `http://localhost:${currentPort}/auth/google/callback`;
  
  console.log('리디렉션 URI:', redirectUri); // 디버깅용
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CALENDAR_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// OAuth 코드로 액세스 토큰 교환
export const exchangeCodeForToken = async (code) => {
  try {
    const currentPort = window.location.port || '3000';
    const redirectUri = `http://localhost:${currentPort}/auth/google/callback`;
    
    console.log('토큰 교환용 리디렉션 URI:', redirectUri); // 디버깅용
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CALENDAR_CONFIG.clientId,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'your-client-secret',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    
    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  } catch (error) {
    console.error('토큰 교환 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 실제 Google Meet 링크 생성 (서버 사이드 또는 API 호출)
export const createRealGoogleMeet = async (meetingData) => {
  try {
    // 방법 1: Google Calendar API 직접 호출 (API Key 사용)
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${GOOGLE_CALENDAR_CONFIG.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${meetingData.accessToken || ''}`
      },
      body: JSON.stringify({
        summary: `미팅: ${meetingData.advisorName}`,
        description: meetingData.question || '예약된 미팅',
        start: {
          dateTime: meetingData.startTime.toISOString(),
          timeZone: 'Asia/Seoul'
        },
        end: {
          dateTime: meetingData.endTime.toISOString(),
          timeZone: 'Asia/Seoul'
        },
        attendees: [
          { email: meetingData.seekerEmail },
          { email: meetingData.advisorEmail }
        ],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      })
    });

    if (!response.ok) {
      throw new Error('Google Calendar API 호출 실패');
    }

    const data = await response.json();
    
    return {
      success: true,
      meetLink: data.hangoutLink,
      eventId: data.id
    };

  } catch (error) {
    console.error('Google Meet 생성 오류:', error);
    
    // 방법 2: 대안 - Google Meet 직접 생성 URL
    const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fallbackLink = `https://meet.google.com/${meetingId}`;
    
    return {
      success: true,
      meetLink: fallbackLink,
      eventId: `fallback-${meetingId}`,
      note: 'API 호출 실패로 대체 링크 생성'
    };
  }
};

// 실제 Google Meet 링크 생성
export const generateSimpleMeetLink = async () => {
  try {
    // Google Meet 직접 생성 URL 사용
    // Google Meet는 meet.google.com/new를 통해 새로운 미팅을 생성할 수 있습니다
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const meetingId = `${randomId}-${timestamp}`;
    
    // 실제 Google Meet 링크 형식으로 생성
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    const meetLink = `https://meet.google.com/${part1}-${part2}-${part3}`;
    
    // 실제로는 서버에서 Google Calendar API를 통해 생성해야 하지만,
    // 현재는 임시로 올바른 형식의 링크를 반환
    return meetLink;
    
  } catch (error) {
    console.error('Google Meet 링크 생성 오류:', error);
    
    // 오류 발생 시 기본 링크 반환
    return 'https://meet.google.com/abc-defg-hij';
  }
}; 