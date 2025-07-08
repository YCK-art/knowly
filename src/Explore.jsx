import React, { useState, useRef, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiHeart } from 'react-icons/fi';

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

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'featured', label: 'Featured' },
  { key: 'mostBooked', label: 'Most Booked' },
  { key: 'newArrivals', label: 'New Arrivals' },
];

const serviceCategories = [
  'Startups & Entrepreneurship',
  'Career Strategy & Job Change',
  'Marketing & Social Media',
  'Investing & Personal Finance',
  'Life & Personal Advice',
  'Mental Health & Wellbeing',
  'Relationships & Dating',
  'Tech & Engineering',
  'Philosophy & Big Questions',
  'Education & Learning',
];

const languageOptions = [
  'English',
  'Spanish',
  'Korean',
  'Japanese',
  'Chinese',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Arabic',
  'Hindi',
  'Turkish',
  'Dutch',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Polish',
  'Swedish',
  'Danish',
  'Norwegian',
  'Finnish',
  'Greek',
  'Hebrew',
];

// 샘플 가격 분포 데이터 (히스토그램용)
const budgetHistogram = [2, 5, 8, 12, 7, 3, 1]; // 예시: 7구간
const budgetMin = 0;
const budgetMax = 2000;
const budgetStep = (budgetMax - budgetMin) / (budgetHistogram.length - 1);

function Explore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myAdvisor, setMyAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  // 모듈형 필터 상태
  const [activeFilters, setActiveFilters] = useState(['all']);
  // Services 드롭다운 상태
  const [serviceOpen, setServiceOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const serviceRef = useRef();
  // Language 드롭다운 상태
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const languageRef = useRef();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetRange, setBudgetRange] = useState([200, 1500]);
  const budgetRef = useRef();
  // 즐겨찾기 상태
  const [favorites, setFavorites] = useState([]);

  const handleFilterToggle = (key) => {
    if (activeFilters.includes(key)) {
      setActiveFilters(activeFilters.filter(f => f !== key));
    } else {
      setActiveFilters([...activeFilters, key]);
    }
  };

  const handleServiceToggle = (cat) => {
    if (selectedServices.includes(cat)) {
      setSelectedServices(selectedServices.filter(c => c !== cat));
    } else {
      setSelectedServices([...selectedServices, cat]);
    }
  };

  // All 체크박스 핸들러
  const handleServiceAllToggle = () => {
    if (selectedServices.length === serviceCategories.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices([...serviceCategories]);
    }
  };

  // All 체크박스 상태
  const isAllChecked = selectedServices.length === serviceCategories.length;

  // Language 체크박스 핸들러
  const handleLanguageToggle = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // Language All 체크박스 핸들러
  const handleLanguageAllToggle = () => {
    if (selectedLanguages.length === languageOptions.length) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages([...languageOptions]);
    }
  };

  // Language All 체크박스 상태
  const isLanguageAllChecked = selectedLanguages.length === languageOptions.length;

  // 드롭다운 외부 클릭 시 닫힘
  React.useEffect(() => {
    function handleClick(e) {
      if (serviceRef.current && !serviceRef.current.contains(e.target)) setServiceOpen(false);
      if (languageRef.current && !languageRef.current.contains(e.target)) setLanguageOpen(false);
      if (budgetRef.current && !budgetRef.current.contains(e.target)) setBudgetOpen(false);
    }
    if (serviceOpen || languageOpen || budgetOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [serviceOpen, languageOpen, budgetOpen]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchAdvisor() {
      if (!user) {
        setMyAdvisor(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Pricing 정보: 최소 duration, 가격
          let minDuration = 15;
          let minPrice = '';
          if (data.pricing && data.pricing.unitPrice && data.pricing.durations && data.pricing.durations.length > 0) {
            minDuration = Math.min(...data.pricing.durations);
            minPrice = (parseFloat(data.pricing.unitPrice) * (minDuration / 15)).toFixed(2);
          }
          setMyAdvisor({
            id: user.uid,
            name: data.name || user.displayName || user.email || 'Advisor',
            desc: data.headline || '',
            img: data.photoURL || user.photoURL || '/default-profile.png',
            price: minPrice,
            duration: minDuration === 15 ? '15min' : minDuration === 30 ? '30min' : minDuration === 60 ? '1hr' : minDuration === 90 ? '1.5hr' : minDuration === 120 ? '2hr' : `${minDuration}min`,
          });
        } else {
          setMyAdvisor(null);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAdvisor();
  }, [user]);

  useEffect(() => {
    if (!user) return setFavorites([]);
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      }
    });
  }, [user]);

  const toggleFavorite = async (e, partnerId) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다!');
      return;
    }
    let updated;
    if (favorites.includes(partnerId)) {
      updated = favorites.filter(id => id !== partnerId);
    } else {
      updated = [...favorites, partnerId];
    }
    setFavorites(updated);
    await setDoc(doc(db, 'users', user.uid), { favorites: updated }, { merge: true });
  };

  // samplePartners 복사본에 내 어드바이저 정보 삽입(중복 방지)
  let displayPartners = [...samplePartners];
  if (myAdvisor) {
    // 내 정보가 이미 samplePartners에 있으면(중복 방지)
    const exists = displayPartners.find(p => p.id === myAdvisor.id);
    if (!exists) {
      displayPartners[0] = myAdvisor; // 첫 번째 카드에 내 정보 삽입
    }
  }

  return (
    <div className="explore-page">
      <div className="explore-filters">
        <div className="explore-categories">
          {filterOptions.map(opt => (
            <label key={opt.key} className={`explore-cat-btn${activeFilters.includes(opt.key) ? ' active' : ''}`}>
              <input
                type="checkbox"
                checked={activeFilters.includes(opt.key)}
                onChange={() => handleFilterToggle(opt.key)}
                style={{ display: 'none' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
        <div className="explore-options">
          <div className="services-dropdown" ref={serviceRef}>
            <button
              className="services-dropdown-btn"
              type="button"
              onClick={() => setServiceOpen(v => !v)}
            >
              {selectedServices.length === 0 ? 'Services' : `Services (${selectedServices.length})`}
              <span className="dropdown-arrow">▼</span>
            </button>
            {serviceOpen && (
              <div className="services-dropdown-list">
                <label className="services-dropdown-item">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleServiceAllToggle}
                  />
                  <span>All</span>
                </label>
                {serviceCategories.map(cat => (
                  <label key={cat} className="services-dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(cat)}
                      onChange={() => handleServiceToggle(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="services-dropdown" ref={languageRef}>
            <button
              className="services-dropdown-btn"
              type="button"
              onClick={() => setLanguageOpen(v => !v)}
            >
              {selectedLanguages.length === 0 ? 'Language' : `Language (${selectedLanguages.length})`}
              <span className="dropdown-arrow">▼</span>
            </button>
            {languageOpen && (
              <div className="services-dropdown-list">
                <label className="services-dropdown-item">
                  <input
                    type="checkbox"
                    checked={isLanguageAllChecked}
                    onChange={handleLanguageAllToggle}
                  />
                  <span>All</span>
                </label>
                {languageOptions.map(lang => (
                  <label key={lang} className="services-dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="services-dropdown" ref={budgetRef}>
            <button
              className="services-dropdown-btn"
              type="button"
              onClick={() => setBudgetOpen(v => !v)}
            >
              {`Budget ($${budgetRange[0]} - $${budgetRange[1]})`}
              <span className="dropdown-arrow">▼</span>
            </button>
            {budgetOpen && (
              <div className="services-dropdown-list budget-dropdown-list">
                <div className="budget-histogram">
                  {budgetHistogram.map((val, i) => (
                    <div
                      key={i}
                      className="budget-bar"
                      style={{ height: `${val * 12 + 8}px` }}
                    />
                  ))}
                </div>
                <div className="budget-slider-wrap">
                  <Slider
                    range
                    min={budgetMin}
                    max={budgetMax}
                    step={50}
                    value={budgetRange}
                    onChange={setBudgetRange}
                    allowCross={false}
                    trackStyle={[{ background: '#ffe066' }]}
                    handleStyle={[
                      { borderColor: '#ffe066', background: '#fff' },
                      { borderColor: '#ffe066', background: '#fff' },
                    ]}
                    railStyle={{ background: '#ececec' }}
                  />
                  <div className="budget-slider-labels">
                    <span>${budgetMin}</span>
                    <span>${budgetMax}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <select>
            <option>Advisor details</option>
          </select>
        </div>
      </div>
      <div className="explore-results-count">{displayPartners.length} results</div>
      <div className="explore-partner-grid">
        {displayPartners.map(partner => (
          <div className="partner-card" key={partner.id} onClick={() => navigate(`/partner/${partner.id}`)} style={{cursor:'pointer',position:'relative'}}>
            {/* 하트 아이콘 */}
            <span
              style={{position:'absolute',top:14,right:16,zIndex:2,cursor:'pointer',background:'#fff',borderRadius:'50%',boxShadow:'0 1px 4px #0001',padding:4,transition:'box-shadow 0.13s'}}
              onClick={e => toggleFavorite(e, partner.id)}
              title={favorites.includes(partner.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {favorites.includes(partner.id)
                ? <svg width="26" height="24" viewBox="0 0 26 24" fill="#ffe066" stroke="#ffe066" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.998 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-9.55 11.54l-1.45 1.31z"/></svg>
                : <svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.998 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-9.55 11.54l-1.45 1.31z"/></svg>
              }
            </span>
            <div className="partner-thumb">
              <img src={partner.img} alt={partner.name} />
            </div>
            <div className="partner-info">
              <div className="partner-title">{partner.name}</div>
              <div className="partner-desc">{partner.desc}</div>
              <div className="partner-meta">
                <span className="partner-price">From ${partner.price} <span className="partner-duration">({partner.duration})</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Explore; 