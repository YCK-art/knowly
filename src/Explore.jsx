import React, { useState, useRef } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const samplePartners = [
  {
    id: 1,
    name: 'James B',
    title: 'Webflow Expert',
    desc: 'I will design and develop a modern webflow website',
    price: 1995,
    rating: 5.0,
    reviews: 50,
    img: '/openai-logo.png',
  },
  {
    id: 2,
    name: 'Fillinx Sol',
    title: 'Shopify Agency',
    desc: 'Our agency will build shopify ecommerce website, redesign online store',
    price: 195,
    rating: 5.0,
    reviews: 970,
    img: '/instagram-logo.png',
  },
  {
    id: 3,
    name: 'Rank Harvest',
    title: 'Wordpress Pro',
    desc: 'Our agency will design and develop your custom wordpress website',
    price: 500,
    rating: 4.9,
    reviews: 66,
    img: '/harvard-logo.png',
  },
  {
    id: 4,
    name: 'Dinos',
    title: 'Modern Web Designer',
    desc: 'I will web design and build a responsive modern wordpress website',
    price: 1000,
    rating: 5.0,
    reviews: 456,
    img: '/ycombinator-logo.png',
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
      <div className="explore-results-count">4 results</div>
      <div className="explore-partner-grid">
        {samplePartners.map(partner => (
          <div className="partner-card" key={partner.id}>
            <div className="partner-thumb">
              <img src={partner.img} alt={partner.name} />
            </div>
            <div className="partner-info">
              <div className="partner-title">{partner.title}</div>
              <div className="partner-desc">{partner.desc}</div>
              <div className="partner-meta">
                <span className="partner-price">From ${partner.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Explore; 