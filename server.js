require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 1. 인증 URL 생성
app.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  res.redirect(url);
});

// 2. 인증 후 콜백
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    // 실제 서비스에서는 토큰을 DB/세션에 저장
    res.send('Google 인증 성공! 이제 캘린더 연동이 가능합니다.');
  } catch (err) {
    res.status(500).send('인증 실패: ' + err.message);
  }
});

// 3. 예약 이벤트 생성 (Google Meet 링크 포함)
app.post('/calendar/create', async (req, res) => {
  // 실제 서비스에서는 사용자별로 토큰을 불러와야 함
  // 여기서는 예시로 oAuth2Client에 이미 토큰이 세팅되어 있다고 가정
  try {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const event = {
      summary: req.body.summary || '상담 예약',
      start: { dateTime: req.body.start },
      end: { dateTime: req.body.end },
      conferenceData: { createRequest: { requestId: 'meet-' + Date.now() } },
      attendees: req.body.attendees || [],
    };
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });
    res.json({ meetLink: response.data.hangoutLink, event: response.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
}); 