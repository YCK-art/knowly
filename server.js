require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { google } = require('googleapis');

const app = express();

// 미들웨어 설정
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Google OAuth2 설정
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
const SERVER_PORT = process.env.SERVER_PORT || 3000;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// API 라우트들
app.get('/api/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    res.cookie('google_token', JSON.stringify(tokens), { httpOnly: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).send('구글 인증 실패');
  }
});

app.post('/api/create-meet', async (req, res) => {
  try {
    const tokens = JSON.parse(req.cookies.google_token || '{}');
    oAuth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const { summary, description, start, end, attendees } = req.body;

    const event = {
      summary: summary || '상담 미팅',
      description: description || '상담 내용',
      start: { dateTime: start, timeZone: 'Asia/Seoul' },
      end: { dateTime: end, timeZone: 'Asia/Seoul' },
      attendees: attendees || [],
      conferenceData: {
        createRequest: {
          requestId: 'meet-' + Date.now(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1
    });

    res.json({ meetLink: response.data.hangoutLink });
  } catch (err) {
    console.error('Google Meet 생성 오류:', err);
    res.status(500).json({ error: 'Google Meet 생성 실패' });
  }
});

// 정적 파일 서빙
app.use(express.static('build'));

// React 라우팅 처리
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/partner/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/favorites', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/onboarding-congrats', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 기타 모든 라우트
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(SERVER_PORT, () => {
  console.log(`서버 실행중: http://localhost:${SERVER_PORT}`);
}); 