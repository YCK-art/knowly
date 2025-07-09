import React, { useState, useRef, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { FiHeart } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';

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
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [myAdvisor, setMyAdvisor] = useState(null);
  const [allAdvisors, setAllAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  // 검색어 상태 추가
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
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
  const [budgetRange, setBudgetRange] = useState([budgetMin, budgetMax]);
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

  // location.state.selectedCategory로 진입 시 필터 자동 설정
  useEffect(() => {
    if (location.state && location.state.selectedCategory) {
      setSelectedServices([location.state.selectedCategory]);
    }
    // 검색어 state로 진입 시
    if (location.state && location.state.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

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
            categories: data.categories || [],
            languages: data.languages || [],
            pricing: data.pricing || {}
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

  // 모든 어드바이저 데이터 가져오기
  useEffect(() => {
    async function fetchAllAdvisors() {
      if (!user) return;
      
      setLoading(true);
      try {
        const advisors = [];
        
        // Firestore에서 모든 사용자 가져오기
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const userId = userDoc.id;
          
          // 어드바이저 데이터가 있는 경우만 추가
          if (userData.name && userData.headline) {
            // Pricing 정보 계산
            let minDuration = 15;
            let minPrice = 0;
            if (userData.pricing && userData.pricing.unitPrice && userData.pricing.durations && userData.pricing.durations.length > 0) {
              minDuration = Math.min(...userData.pricing.durations);
              minPrice = parseFloat(userData.pricing.unitPrice) * (minDuration / 15);
            }
            
            advisors.push({
              id: userId,
              name: userData.name,
              desc: userData.headline || '',
              img: userData.profileImg || userData.photoURL || '/default-profile.png',
              price: minPrice.toFixed(2),
              duration: minDuration === 15 ? '15min' : minDuration === 30 ? '30min' : minDuration === 60 ? '1hr' : minDuration === 90 ? '1.5hr' : minDuration === 120 ? '2hr' : `${minDuration}min`,
              categories: userData.categories || [],
              languages: userData.languages || [],
              education: userData.education || [],
              experience: userData.experience || [],
              introduction: userData.introduction || '',
              pricing: userData.pricing || {}
            });
          }
        });
        
        setAllAdvisors(advisors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching advisors:', error);
        setLoading(false);
      }
    }
    
    fetchAllAdvisors();
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
      alert('Login required!');
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

  // 통합 검색 + 기존 필터링
  const filteredAdvisors = allAdvisors.filter(advisor => {
    const keyword = searchTerm.trim().toLowerCase();
    // 통합 검색: 이름, desc, introduction, 카테고리, 언어, 학력, 경력
    const nameMatch = advisor.name?.toLowerCase().includes(keyword);
    const descMatch = advisor.desc?.toLowerCase().includes(keyword);
    const introMatch = advisor.introduction?.toLowerCase().includes(keyword);
    const categoryMatch = advisor.categories?.some(cat => cat.toLowerCase().includes(keyword));
    const languageMatch = advisor.languages?.some(lang => typeof lang === 'string' && lang.toLowerCase().includes(keyword));
    const educationMatch = Array.isArray(advisor.education) ? advisor.education.some(edu => typeof edu === 'string' && edu.toLowerCase().includes(keyword)) : false;
    const experienceMatch = Array.isArray(advisor.experience) ? advisor.experience.some(exp => typeof exp === 'string' && exp.toLowerCase().includes(keyword)) : false;
    // 하나라도 true면 통과
    const searchPass = !keyword || nameMatch || descMatch || introMatch || categoryMatch || languageMatch || educationMatch || experienceMatch;
    if (!searchPass) return false;
    // 기존 필터
    if (selectedServices.length > 0) {
      const hasSelectedService = selectedServices.some(service => 
        advisor.categories && advisor.categories.includes(service)
      );
      if (!hasSelectedService) return false;
    }
    if (selectedLanguages.length > 0) {
      const hasSelectedLanguage = selectedLanguages.some(language => 
        advisor.languages && advisor.languages.some(advisorLang => {
          if (typeof advisorLang !== 'string' || typeof language !== 'string') {
            return false;
          }
          return advisorLang.includes(language) || language.includes(advisorLang);
        })
      );
      if (!hasSelectedLanguage) return false;
    }
    if (budgetRange[0] !== budgetMin || budgetRange[1] !== budgetMax) {
      if (advisor.pricing && advisor.pricing.unitPrice) {
        const minDuration = advisor.pricing.durations?.[0] || 30;
        const calculatedPrice = parseFloat(advisor.pricing.unitPrice) * (minDuration / 15);
        if (calculatedPrice < budgetRange[0] || calculatedPrice > budgetRange[1]) {
          return false;
        }
      }
    }
    return true;
  });

  // 실제 데이터만 표시 (더미 데이터 제거)
  let displayPartners = filteredAdvisors;

  return (
    <div className="explore-page">
      {/* 검색창: 왼쪽 정렬, 아이콘 포함 */}
      <div className="explore-search-bar" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 400 }}>
          <span style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#23272a',
            fontSize: 22,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="#23272a" strokeWidth="2" fill="none"/>
              <line x1="17.2" y1="17.2" x2="21" y2="21" stroke="#23272a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search for someone to talk to..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSearchTerm(e.target.value);
              }
            }}
            style={{
              width: '100%',
              padding: '14px 22px 14px 48px',
              borderRadius: 24,
              border: '1.5px solid #ececec',
              fontSize: 17,
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
            }}
          />
        </div>
      </div>
      {/* 모듈형 필터 */}
      <div className="explore-categories" style={{ marginBottom: 18 }}>
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
      {/* 드롭다운 필터 */}
      <div className="explore-options" style={{ marginBottom: 18 }}>
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
      <div className="explore-results-count">
        {loading ? 'Loading...' : `${displayPartners.length} results`}
      </div>
      {!loading && (
        <div className="explore-partner-grid">
          {displayPartners.map(partner => (
            <div className="partner-card" key={partner.id} onClick={() => navigate(`/partner/${partner.id}`)} style={{cursor:'pointer',position:'relative'}}>
              {/* 하트 아이콘 */}
              <span
                style={{position:'absolute',top:14,right:16,zIndex:2,cursor:'pointer',padding:4,transition:'opacity 0.13s'}}
                onClick={e => toggleFavorite(e, partner.id)}
                title={favorites.includes(partner.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(partner.id)
                  ? <AiFillHeart size={20} color="#ffe066" />
                  : <FiHeart size={20} color="#bbb" />
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
      )}
    </div>
  );
}

export default Explore; 