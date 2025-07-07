import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const partner = samplePartners.find(p => String(p.id) === String(id));

  if (!partner) return <div style={{padding:40}}>존재하지 않는 파트너입니다.</div>;

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
            <img src={partner.img} alt={partner.name} className="profile-img-linkedin" />
          </div>
          <div className="profile-info-linkedin">
            <div className="profile-name-linkedin">{partner.name}</div>
            <div className="profile-bio-linkedin">Senior Engineer at OpenAI</div>
            <div className="profile-bio-divider"></div>
            <div className="profile-desc-linkedin">"I like coding and AI so much"</div>
          </div>
        </div>
        {/* 오른쪽: 캘린더 API 연동 예정 */}
        <div className="partner-detail-right">
          <div className="calendar-placeholder">
            <div className="calendar-title">예약 가능한 시간</div>
            <div className="calendar-box">(캘린더 API 연동 예정)</div>
          </div>
        </div>
      </div>
      {/* Experience & Education 나란히 배치 */}
      <div className="partner-detail-bottom-row">
        <div className="partner-detail-career">
          <h3>Experience</h3>
          {/* 경력 예시 데이터 하드코딩 */}
          <div className="career-item">
            <div className="career-header">
              <img src="/hyundai-logo.png" alt="Hyundai AutoEver" className="career-logo" onError={e => {e.target.onerror=null;e.target.src='/openai-logo.png'}} />
              <div>
                <div className="career-title">Head of EX Platform Development</div>
                <div className="career-company">Hyundai AutoEver · Full-time</div>
                <div className="career-period">Jul 2024 – Present · 1 yr 1 mo</div>
                <div className="career-location">Seoul, South Korea · On-site</div>
              </div>
            </div>
            <div className="career-desc">DX / AX</div>
          </div>
          <div className="career-item">
            <div className="career-header">
              <img src="/flydoctor-logo.png" alt="FlyDoctor" className="career-logo" onError={e => {e.target.onerror=null;e.target.src='/openai-logo.png'}} />
              <div>
                <div className="career-title">Chief Technology Officer</div>
                <div className="career-company">FlyDoctor · Full-time</div>
                <div className="career-period">Dec 2023 – Jul 2024 · 8 mos</div>
                <div className="career-location">Seoul, South Korea</div>
              </div>
            </div>
            <div className="career-desc">Platform Development Lead</div>
          </div>
          <div className="career-item">
            <div className="career-header">
              <img src="/storelink-logo.png" alt="storelink" className="career-logo" onError={e => {e.target.onerror=null;e.target.src='/openai-logo.png'}} />
              <div>
                <div className="career-title">Chief Technology Officer</div>
                <div className="career-company">Storelink · Full-time</div>
                <div className="career-period">Dec 2021 – Nov 2023 · 2 yrs</div>
                <div className="career-location">Seoul, South Korea</div>
              </div>
            </div>
            <div className="career-desc">Head of Marketing Platform Development</div>
          </div>
        </div>
        <div className="partner-detail-education">
          <h3>Education</h3>
          <div className="education-item">
            <div className="education-header">
              <img src="/harvard-logo.png" alt="Bauman Moscow State Technical University" className="education-logo" onError={e => {e.target.onerror=null;e.target.src='/openai-logo.png'}} />
              <div>
                <div className="education-school">Bauman Moscow State Technical University</div>
                <div className="education-degree">Master's degree, Engineering</div>
                <div className="education-period">2004 - 2010</div>
              </div>
            </div>
          </div>
          <div className="education-item">
            <div className="education-header">
              <img src="/harvard-logo.png" alt="Institute of Business Studies (IBS-Moscow)" className="education-logo" onError={e => {e.target.onerror=null;e.target.src='/openai-logo.png'}} />
              <div>
                <div className="education-school">Institute of Business Studies (IBS-Moscow)</div>
                <div className="education-degree">Master's degree, Management</div>
                <div className="education-period">2019 - 2021</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Languages 영역 추가 */}
      <div className="partner-detail-languages">
        <h3>Languages</h3>
        <div className="language-item">
          <div className="language-name">English</div>
          <div className="language-level">Professional working proficiency</div>
        </div>
        <hr className="language-divider" />
        <div className="language-item">
          <div className="language-name">Russian</div>
          <div className="language-level">Native or bilingual proficiency</div>
        </div>
      </div>
    </div>
  );
}

export default PartnerDetail; 