import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { MdCalendarToday, MdAccessTime, MdLocationOn } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, toZonedTime } from 'date-fns-tz';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// samplePartners는 실제로는 별도 데이터/상태로 분리하는 것이 좋으나, 우선 Explore의 samplePartners와 동일하게 복사
const samplePartners = [
  {
    id: 1,
    name: 'Ethan Reynolds',
    title: 'Ethan Reynolds',
    desc: 'I will design and develop a modern webflow website',
    price: 1995,
    duration: '1hr',
    rating: 5.0,
    reviews: 50,
    img: '/default-profile.png',
  },
  {
    id: 2,
    name: 'Olivia Parker',
    title: 'Olivia Parker',
    desc: 'Our agency will build shopify ecommerce website, redesign online store',
    price: 195,
    duration: '30min',
    rating: 5.0,
    reviews: 970,
    img: '/default-profile.png',
  },
  {
    id: 3,
    name: 'Youngchan Kim',
    title: 'Youngchan Kim',
    desc: 'Our agency will design and develop your custom wordpress website',
    price: 500,
    duration: '2hr',
    rating: 4.9,
    reviews: 66,
    img: '/default-profile.png',
  },
  {
    id: 4,
    name: 'Mason Bennett',
    title: 'Mason Bennett',
    desc: 'I will web design and build a responsive modern wordpress website',
    price: 1000,
    duration: '15min',
    rating: 5.0,
    reviews: 456,
    img: '/default-profile.png',
  },
];

const TIMEZONES = [
  { value: 'Asia/Seoul', label: 'Korea (Asia/Seoul)' },
  { value: 'America/New_York', label: 'USA East (New York)' },
  { value: 'America/Los_Angeles', label: 'USA West (LA)' },
  { value: 'Europe/London', label: 'UK (London)' },
  { value: 'Europe/Paris', label: 'France (Paris)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Australia/Sydney', label: 'Australia (Sydney)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Bangkok', label: 'Thailand (Bangkok)' },
  { value: 'Europe/Berlin', label: 'Germany (Berlin)' },
  { value: 'America/Sao_Paulo', label: 'Brazil (Sao Paulo)' },
  { value: 'America/Vancouver', label: 'Canada (Vancouver)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
];

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Seoul';
  }
}

function MeetingBookingModal({ open, onClose, pricing, onSubmit }) {
  const durations = pricing?.durations || [];
  const unitPrice = pricing?.unitPrice || 0;
  const [selectedDuration, setSelectedDuration] = useState(durations[0]);
  const [question, setQuestion] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const [pendingInfo, setPendingInfo] = useState(null);

  // 가격 계산 함수
  const getPrice = (duration) => {
    if (!unitPrice || !duration) return '-';
    return (parseFloat(unitPrice) * (duration / 15)).toFixed(2);
  };

  const handleNext = () => {
    setShowPayPal(true);
    setPendingInfo({ duration: selectedDuration, question });
  };

  const handlePaymentSuccess = () => {
    // Google Meet 링크 생성 (간단 버전)
    const meetUrl = 'https://meet.google.com/new';
    setMeetLink(meetUrl);
    setShowPayPal(false);
    // 예약 정보와 meetUrl을 onSubmit으로 전달
    if (pendingInfo) onSubmit(pendingInfo.duration, pendingInfo.question, meetUrl);
  };

  if (!open) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:18,minWidth:340,maxWidth:420,minHeight:520,padding:'44px 32px 36px 32px',boxShadow:'0 4px 32px rgba(0,0,0,0.13)',fontFamily:'NeueHaasDisplayThin',display:'flex',flexDirection:'column',gap:28,position:'relative'}}>
        {!showPayPal && !meetLink && <>
          <div style={{fontWeight:700,fontSize:24,marginBottom:8,color:'#205080'}}>Book a Meeting</div>
          <div style={{fontSize:17,fontWeight:600,marginBottom:4}}>Select meeting duration</div>
          <div style={{display:'flex',gap:18,marginBottom:8}}>
            {durations.map((d) => (
              <label key={d} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'18px 28px',border:'1.5px solid',borderColor:selectedDuration===d?'#205080':'#ececec',borderRadius:12,cursor:'pointer',background:selectedDuration===d?'#eaf3fa':'#fafbfc',transition:'border 0.13s'}}>
                <input type="radio" name="duration" value={d} checked={selectedDuration===d} onChange={()=>setSelectedDuration(d)} style={{display:'none'}} />
                <span style={{fontSize:20,fontWeight:700}}>{d} min</span>
                <span style={{fontSize:16,color:'#205080',marginTop:6}}>${getPrice(d)}</span>
              </label>
            ))}
          </div>
          <div style={{fontSize:17,fontWeight:600,marginBottom:4}}>What do you want to ask or discuss?</div>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Write your question, goal, or what you want from this meeting..." style={{width:'100%',minHeight:140,borderRadius:12,border:'1.5px solid #ececec',padding:'16px 24px 16px 16px',fontSize:17,fontFamily:'NeueHaasDisplayThin',marginBottom:8,resize:'vertical',color:'#23272a',background:'#fafbfc',boxSizing:'border-box'}} />
          <div style={{display:'flex',gap:14,justifyContent:'flex-end',marginTop:12}}>
            <button onClick={onClose} style={{background:'#f5f5f5',color:'#205080',border:'1.5px solid #ececec',borderRadius:8,padding:'12px 32px',fontSize:17,fontWeight:600,cursor:'pointer'}}>Cancel</button>
            <button onClick={handleNext} style={{background:'#205080',color:'#fff',border:'none',borderRadius:8,padding:'12px 38px',fontSize:17,fontWeight:700,cursor:'pointer'}}>Next</button>
          </div>
        </>}
        {showPayPal && !meetLink && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',minHeight:320,position:'relative'}}>
            {/* 오른쪽 상단 X 버튼 */}
            <button onClick={()=>setShowPayPal(false)} style={{position:'absolute',top:10,right:10,fontSize:24,background:'none',border:'none',cursor:'pointer',color:'#888',zIndex:10}} aria-label="닫기">×</button>
            {/* Payments 제목 */}
            <div style={{fontWeight:700,fontSize:22,marginBottom:32,marginTop:8,color:'#205080',fontFamily:'NeueHaasDisplayThin',letterSpacing:0.2}}>Payments</div>
            {/* PayPal 버튼 영역 중앙 정렬 */}
            <div style={{width:'100%',maxWidth:380,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:24}}>
              <PayPalScriptProvider options={{ 'client-id': 'AQrVAO5-QMZwYQ7tepwmnOMIupGXtzCuhLzKhgcGi0WSoBP1JK2LX_5CKz21x8yrSS_u-eX613Qk45f8' }}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{ amount: { value: getPrice(selectedDuration) } }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(handlePaymentSuccess);
                  }}
                  onCancel={()=>setShowPayPal(false)}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
        {meetLink && (
          <div style={{textAlign:'center',marginTop:40}}>
            <div style={{fontWeight:700,fontSize:22,color:'#205080',marginBottom:18}}>Payment Complete!</div>
            <div style={{fontSize:17,marginBottom:12}}>Your Google Meet link:</div>
            <a href={meetLink} target="_blank" rel="noopener noreferrer" style={{fontSize:18,color:'#1a73e8',fontWeight:700,textDecoration:'underline'}}>{meetLink}</a>
            <div style={{marginTop:24}}>
              <button onClick={onClose} style={{background:'#205080',color:'#fff',border:'none',borderRadius:8,padding:'12px 38px',fontSize:17,fontWeight:700,cursor:'pointer'}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableTime, setAvailableTime] = useState(null);
  const [availableTimezone, setAvailableTimezone] = useState('Asia/Seoul');
  const [availableExceptions, setAvailableExceptions] = useState([]);
  const [pricingDurations, setPricingDurations] = useState([30, 60]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [userTimezone, setUserTimezone] = useState(getBrowserTimezone());
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);

  // 날짜 계산을 위한 헬퍼
  const getAvailableDates = () => {
    if (!availableTime) return [];
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 30; i++) { // 30일치만 표시
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
      const isException = availableExceptions.some(ex => ex.toDateString() === d.toDateString());
      if (!isException && availableTime[dayKey] && availableTime[dayKey].length > 0) {
        dates.push(new Date(d));
      }
    }
    return dates;
  };

  // 시간 슬롯 생성 (타임존 변환)
  const generateTimeSlots = (date) => {
    if (!availableTime || !pricingDurations.length) return [];
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    const ranges = availableTime[dayKey] || [];
    if (!ranges.length) return [];
    const minDuration = Math.min(...pricingDurations);
    const slots = [];
    ranges.forEach(range => {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);
      let cur = new Date(date);
      cur.setHours(startH, startM, 0, 0);
      const end = new Date(date);
      end.setHours(endH, endM, 0, 0);
      while (cur < end) {
        const slotEnd = new Date(cur.getTime() + minDuration * 60000);
        if (slotEnd > end) break;
        // 타임존 변환: 어드바이저 타임존 → 유저 타임존
        const advisorTz = availableTimezone || 'Asia/Seoul';
        const userTz = userTimezone;
        const userStart = toZonedTime(cur, userTz);
        const userEnd = toZonedTime(slotEnd, userTz);
        slots.push({
          start: userStart,
          end: userEnd,
        });
        cur = slotEnd;
      }
    });
    return slots;
  };

  useEffect(() => {
    async function fetchProfile() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && String(id) === String(user.uid)) {
        // 내 프로필 Firestore에서 불러오기
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({ ...data, id: user.uid });
          if (data.availableTime) setAvailableTime(data.availableTime);
          if (data.availableTimezone) setAvailableTimezone(data.availableTimezone);
          if (data.availableExceptions) {
            setAvailableExceptions(data.availableExceptions.map(ts => new Date(ts)));
          }
          if (data.pricing && data.pricing.durations) setPricingDurations(data.pricing.durations);
        }
        setLoading(false);
        return;
      }
      // 더미데이터 fallback
      const partner = samplePartners.find(p => String(p.id) === String(id));
      setProfile(partner || null);
      setLoading(false);
    }
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, availableTime, pricingDurations]);

  // 예약 가능한 시간 슬롯 클릭 시 모달 오픈
  const handleTimeSlotClick = (date, slot) => {
    setBookingDate(date);
    setBookingTime(slot);
    setBookingOpen(true);
  };

  // 예약 제출 핸들러 (PayPal 연동 전 단계)
  const handleBookingSubmit = (duration, question) => {
    setBookingInfo({ date: bookingDate, time: bookingTime, duration, question });
    setBookingOpen(false);
    // PayPal 결제 모달/페이지로 이동 예정
    // ...
  };

  if (loading) return <div style={{padding:40}}>Loading...</div>;
  if (!profile) return <div style={{padding:40}}>존재하지 않는 파트너입니다.</div>;

  // Firestore 기반 내 프로필 렌더링
  const isMine = profile && profile.id && String(profile.id).length > 10; // Firestore uid는 10자 이상
  const name = profile.name || profile.firstName || profile.title || 'Advisor';
  const headline = profile.headline || profile.desc || '';
  const quote = profile.quote || profile.favoriteQuote || '';
  const photo = profile.photoURL || profile.img || '/default-profile.png';
  // 회사명으로 로고 URL 생성 (대소문자 무관)
  const getCompanyLogoUrl = (companyName) => {
    if (!companyName) return '';
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // 특수문자 제거
      .replace(/\s+/g, ''); // 공백 제거
    return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=64`;
  };

  // 대학교명으로 로고 URL 생성 (대소문자 무관)
  const getUniversityLogoUrl = (universityName) => {
    if (!universityName) return '';
    
    // 주요 대학교 도메인 매핑
    const universityDomains = {
      'harvard': 'harvard.edu',
      'harvard university': 'harvard.edu',
      'mit': 'mit.edu',
      'massachusetts institute of technology': 'mit.edu',
      'stanford': 'stanford.edu',
      'stanford university': 'stanford.edu',
      'yale': 'yale.edu',
      'yale university': 'yale.edu',
      'princeton': 'princeton.edu',
      'princeton university': 'princeton.edu',
      'columbia': 'columbia.edu',
      'columbia university': 'columbia.edu',
      'upenn': 'upenn.edu',
      'university of pennsylvania': 'upenn.edu',
      'cornell': 'cornell.edu',
      'cornell university': 'cornell.edu',
      'dartmouth': 'dartmouth.edu',
      'dartmouth college': 'dartmouth.edu',
      'brown': 'brown.edu',
      'brown university': 'brown.edu',
      'ucla': 'ucla.edu',
      'university of california los angeles': 'ucla.edu',
      'uc berkeley': 'berkeley.edu',
      'university of california berkeley': 'berkeley.edu',
      'nyu': 'nyu.edu',
      'new york university': 'nyu.edu',
      'usc': 'usc.edu',
      'university of southern california': 'usc.edu',
      'georgetown': 'georgetown.edu',
      'georgetown university': 'georgetown.edu',
      'duke': 'duke.edu',
      'duke university': 'duke.edu',
      'northwestern': 'northwestern.edu',
      'northwestern university': 'northwestern.edu',
      'vanderbilt': 'vanderbilt.edu',
      'vanderbilt university': 'vanderbilt.edu',
      'emory': 'emory.edu',
      'emory university': 'emory.edu',
      'washington university': 'wustl.edu',
      'washu': 'wustl.edu',
      'rice': 'rice.edu',
      'rice university': 'rice.edu',
      'notre dame': 'nd.edu',
      'university of notre dame': 'nd.edu',
      'carnegie mellon': 'cmu.edu',
      'carnegie mellon university': 'cmu.edu',
      'johns hopkins': 'jhu.edu',
      'johns hopkins university': 'jhu.edu',
      'tufts': 'tufts.edu',
      'tufts university': 'tufts.edu',
      'brandeis': 'brandeis.edu',
      'brandeis university': 'brandeis.edu',
      'boston university': 'bu.edu',
      'bu': 'bu.edu',
      'boston college': 'bc.edu',
      'bc': 'bc.edu',
      'northeastern': 'northeastern.edu',
      'northeastern university': 'northeastern.edu',
      'georgia tech': 'gatech.edu',
      'georgia institute of technology': 'gatech.edu',
      'virginia tech': 'vt.edu',
      'virginia polytechnic institute': 'vt.edu',
      'purdue': 'purdue.edu',
      'purdue university': 'purdue.edu',
      'indiana university': 'iu.edu',
      'iu': 'iu.edu',
      'university of michigan': 'umich.edu',
      'umich': 'umich.edu',
      'michigan state': 'msu.edu',
      'michigan state university': 'msu.edu',
      'ohio state': 'osu.edu',
      'ohio state university': 'osu.edu',
      'university of illinois': 'illinois.edu',
      'uiuc': 'illinois.edu',
      'university of wisconsin': 'wisc.edu',
      'uw madison': 'wisc.edu',
      'university of minnesota': 'umn.edu',
      'umn': 'umn.edu',
      'university of iowa': 'uiowa.edu',
      'uiowa': 'uiowa.edu',
      'university of texas': 'utexas.edu',
      'utexas': 'utexas.edu',
      'texas a&m': 'tamu.edu',
      'texas a&m university': 'tamu.edu',
      'university of florida': 'ufl.edu',
      'ufl': 'ufl.edu',
      'university of miami': 'miami.edu',
      'umiami': 'miami.edu',
      'university of california': 'uc.edu',
      'uc': 'uc.edu',
      'university of washington': 'washington.edu',
      'uw': 'washington.edu',
      'university of oregon': 'uoregon.edu',
      'uoregon': 'uoregon.edu',
      'university of arizona': 'arizona.edu',
      'uarizona': 'arizona.edu',
      'arizona state': 'asu.edu',
      'arizona state university': 'asu.edu',
      'university of colorado': 'colorado.edu',
      'ucolorado': 'colorado.edu',
      'university of utah': 'utah.edu',
      'uutah': 'utah.edu',
      'university of nevada': 'unr.edu',
      'unr': 'unr.edu',
      'university of alaska': 'alaska.edu',
      'ualaska': 'alaska.edu',
      'university of hawaii': 'hawaii.edu',
      'uhawaii': 'hawaii.edu'
    };
    
    const cleanName = universityName.toLowerCase().trim();
    
    // 매핑된 도메인이 있으면 사용
    if (universityDomains[cleanName]) {
      return `https://www.google.com/s2/favicons?domain=${universityDomains[cleanName]}&sz=64`;
    }
    
    // 일반적인 변환 (기존 로직)
    const simpleName = cleanName
      .replace(/[^a-z0-9]/g, '') // 특수문자 제거
      .replace(/\s+/g, ''); // 공백 제거
    return `https://www.google.com/s2/favicons?domain=${simpleName}.edu&sz=64`;
  };

  const jobs = (profile.jobs || []).map(job => ({
    ...job,
    logoUrl: job.logoUrl || getCompanyLogoUrl(job.company)
  }));
  const educations = (profile.educations || []).map(edu => ({
    ...edu,
    logoUrl: edu.logoUrl || getUniversityLogoUrl(edu.school)
  }));
  const languages = profile.languages || [];

  // Available Time 데이터가 있는지 확인
  const hasAvailableTime = availableTime && Object.values(availableTime).some(day => day.length > 0);

  return (
    <div className="partner-detail-page">
      <button className="back-to-explore-btn" onClick={() => navigate('/explore')}>
        <span className="back-arrow-icon">&#x25C0;</span> Back to list
      </button>
      <div className="partner-detail-main">
        {/* LinkedIn 스타일 프로필 카드 */}
        <div className="profile-card-linkedin">
          <div className="profile-bg-linkedin"></div>
          <div className="profile-img-wrap-linkedin">
            <img src={photo} alt={name} className="profile-img-linkedin" />
          </div>
          <div className="profile-info-linkedin">
            <div className="profile-name-linkedin">{name}</div>
            <div className="profile-bio-linkedin">{headline}</div>
            <div className="profile-bio-divider"></div>
            {quote && <div className="profile-desc-linkedin">"{quote}"</div>}
          </div>
        </div>
        {/* 오른쪽: 예약 캘린더 */}
        <div className="partner-detail-right">
          <div className="calendar-card" style={{minWidth:340}}>
            <div className="calendar-header">
              <div className="calendar-title">
                <MdCalendarToday size={20} /> Available Times
              </div>
              <div className="calendar-timezone" style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
                <MdLocationOn size={16} />
                <select value={userTimezone} onChange={e => setUserTimezone(e.target.value)} style={{fontFamily:'NeueHaasDisplayThin',fontSize:15,border:'1.5px solid #ececec',borderRadius:8,padding:'6px 12px',background:'#fafbfa',color:'#23272a',outline:'none',minWidth:180,fontWeight:'normal'}}>
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                  {!TIMEZONES.some(tz => tz.value === userTimezone) && (
                    <option value={userTimezone}>{userTimezone}</option>
                  )}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:24}}>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                includeDates={getAvailableDates()}
                highlightDates={[{ 'custom-available-day': getAvailableDates() }]}
                inline
                dayClassName={date => getAvailableDates().some(d => d.toDateString() === date.toDateString()) ? 'custom-available-day' : undefined}
                calendarStartDay={0}
                locale="en-US"
              />
              <div style={{flex:1,minWidth:180}}>
                {selectedDate ? (
                  <>
                    <div style={{fontWeight:600,marginBottom:8}}>
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                      <span style={{fontSize:14,color:'#888'}}>Times you're available</span>
                    </div>
                    {timeSlots.length > 0 ? (
                      <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:220,overflowY:'auto'}}>
                        {timeSlots.map((slot, idx) => (
                          <button key={idx} onClick={()=>handleTimeSlotClick(selectedDate, slot)} style={{border:'1.5px solid #ffe066',background:'#fff',color:'#23272a',borderRadius:8,padding:'10px 0',fontWeight:600,fontSize:17,cursor:'pointer',display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                            {format(slot.start, 'hh:mm a', { timeZone: userTimezone })}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{color:'#bbb',fontSize:15,marginTop:18}}>No available slots</div>
                    )}
                  </>
                ) : (
                  <div style={{color:'#bbb',fontSize:15,marginTop:18}}>Select a date</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Experience & Education & Languages 세로 배치 */}
      {/* Advisor Categories 표시 영역 */}
      {profile.categories && profile.categories.length > 0 && (
        <div style={{width:'100%',maxWidth:'100%',margin:'48px 0 32px 0',padding:'32px 24px 24px 24px',background:'#fafbfc',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,0.04)',border:'none',borderTop:'6px solid #ffe066',fontFamily:'NeueHaasDisplayThin',transition:'box-shadow 0.18s, border 0.18s'}}>
          <div style={{fontWeight:700,fontSize:'1.3rem',marginBottom:28,color:'#23272a'}}>Advisor Categories</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:14,justifyContent:'flex-start',alignItems:'center'}}>
            {profile.categories.map((cat,i)=>(
              <span key={i} style={{fontSize:16,fontWeight:700,background:'#fffbe6',color:'#23272a',borderRadius:18,padding:'8px 20px',border:'1.5px solid #ffe066',marginRight:6,marginBottom:6,boxShadow:'0 1px 4px #ffe06622',fontFamily:'NeueHaasDisplayThin',letterSpacing:'0.01em',transition:'all 0.13s',cursor:'default'}}>{cat}</span>
            ))}
          </div>
        </div>
      )}
      <div className="partner-detail-career">
        <h3>Experience</h3>
        {isMine && jobs.length === 0 && <div style={{color:'#bbb',margin:'12px 0'}}>No experience added.</div>}
        {jobs.map((job, i) => (
          <div className="career-item" key={i}>
            <div className="career-header">
              <img 
                src={job.logoUrl || `/default-company-logo.png`} 
                alt={job.company} 
                className="career-logo" 
                onError={e => {e.target.onerror=null;e.target.src='/default-company-logo.png'}} 
              />
              <div>
                <div className="career-title">{job.title}</div>
                <div className="career-company">{job.company} {job.department ? `· ${job.department}` : ''}</div>
                <div className="career-period">{job.start} - {job.end || (job.isCurrent ? 'Present' : '')}</div>
                {job.location && <div className="career-location">{job.location}</div>}
              </div>
            </div>
            {job.desc && <div className="career-desc">{job.desc}</div>}
          </div>
        ))}
      </div>
      <div className="partner-detail-education">
        <h3>Education</h3>
        {isMine && educations.length === 0 && <div style={{color:'#bbb',margin:'12px 0'}}>No education added.</div>}
        {educations.map((edu, i) => (
          <div className="education-item" key={i}>
            <div className="education-header">
              <img 
                src={edu.logoUrl || '/default-university-logo.png'} 
                alt={edu.school} 
                className="education-logo" 
                onError={e => {e.target.onerror=null;e.target.src='/default-university-logo.png'}} 
              />
              <div>
                <div className="education-school">{edu.school}</div>
                <div className="education-degree">{edu.degree} {edu.major ? `· ${edu.major}` : ''}</div>
                <div className="education-period">{edu.start} - {edu.end || (edu.isCurrent ? 'Present' : '')}</div>
              </div>
            </div>
            {edu.desc && <div className="education-desc">{edu.desc}</div>}
          </div>
        ))}
      </div>
      <div className="partner-detail-languages">
        <h3>Languages</h3>
        {isMine && languages.length === 0 && <div style={{color:'#bbb',margin:'12px 0'}}>No languages added.</div>}
        {languages.map((lang, i) => (
          <div className="language-item" key={i}>
            <div className="language-name">
              {lang.name || lang.lang || lang.language}
              <span style={{ fontSize: '0.9em', color: '#888', marginLeft: '8px', fontWeight: '400' }}>
                {lang.fluency}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* 예약 모달 렌더링 */}
      <MeetingBookingModal
        open={bookingOpen}
        onClose={()=>setBookingOpen(false)}
        pricing={profile.pricing}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}

export default PartnerDetail; 



