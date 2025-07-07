import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { FaRocket, FaUserTie, FaBullhorn, FaPiggyBank, FaHandsHelping, FaHeartbeat, FaHeart, FaCog, FaLightbulb, FaGraduationCap } from 'react-icons/fa';
import { FiChevronDown, FiBell, FiMail, FiHeart } from 'react-icons/fi';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Explore from './Explore';
import PartnerDetail from './PartnerDetail';
import SignIn from './SignIn';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import OnboardingRoleSelect from './OnboardingRoleSelect';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Profile from './Profile';

function App() {
  // 추천 태그 상태 관리
  const [activeTag, setActiveTag] = useState(null);
  const tags = [
    "SpaceX Employee",
    "Amazon Employee",
    "Influencer",
    "Harvard Professor"
  ];

  const [showSignIn, setShowSignIn] = useState(false);
  const [signInMode, setSignInMode] = useState('signup');
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [onboardingRole, setOnboardingRole] = useState(null); // null: 체크 전, 'seeker'/'advisor': 완료, 'pending'/'advisor-pending': 온보딩 중
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) setShowSignIn(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setOnboardingRole(null);
      return;
    }
    // Firestore에서 role 체크
    const checkRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data().role : undefined;
        console.log('Firestore role:', role);
        // role이 seeker/advisor가 아니면 무조건 온보딩
        if (role !== 'seeker' && role !== 'advisor') {
          setOnboardingRole('pending');
        } else {
          setOnboardingRole(role);
        }
      } catch (err) {
        console.error('Firestore role check error:', err);
        setOnboardingRole('pending'); // 에러 시에도 온보딩 띄움
      }
    };
    checkRole();
  }, [user]);

  const handleSignOut = () => {
    signOut(auth);
    setShowProfileMenu(false);
  };

  // 프로필 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest('.nav-profile')) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileMenu]);

  // 온보딩 설문 완료 시 Firestore에 저장
  const handleOnboardingRole = async (role) => {
    if (!user) return;
    if (role === 'advisor-pending') {
      setOnboardingRole('advisor-pending');
      return;
    }
    await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
    setOnboardingRole(role);
  };

  return (
    <Router>
      <div className="app-container">
        {/* 네비게이션 바 */}
        <nav className="navbar">
          <div className="logo">
            <a href="/">
              <img src="/curioor.jpg" alt="curioor logo" className="curioor-logo" />
            </a>
          </div>
          <div className="nav-links">
            <a href="/explore" className="nav-link nav-bold">Explore</a>
            {user ? (
              <>
                <span className="nav-icon-btn"><FiBell size={26} /></span>
                <span className="nav-icon-btn"><FiMail size={26} /></span>
                <span className="nav-icon-btn"><FiHeart size={26} /></span>
                <span className="nav-link nav-activity">Activity</span>
                <div className="nav-profile" tabIndex={0} onClick={() => setShowProfileMenu(v => !v)}>
                  <img src={user.photoURL || '/default-profile.png'} alt="profile" className="nav-profile-img" />
                  {showProfileMenu && (
                    <div className="profile-dropdown-menu">
                      <div className="profile-menu-item" onClick={() => { setShowProfileMenu(false); setShowProfile(true); }}>Profile</div>
                      <div className="profile-menu-item">Settings</div>
                      <div className="profile-menu-item">Billing and payments</div>
                      <div className="profile-menu-item">Help & support</div>
                      <hr className="profile-menu-divider" />
                      <div className="profile-menu-item profile-menu-logout" onClick={handleSignOut}>Log out</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="#" className="nav-link nav-yellow-hover" onClick={e => {e.preventDefault(); setSignInMode('signin'); setShowSignIn(true);}}>Sign in</a>
                <button className="join-btn" onClick={() => { setSignInMode('signup'); setShowSignIn(true); }}>Join</button>
              </>
            )}
          </div>
        </nav>
        {showSignIn && <SignIn mode={signInMode} onSuccess={() => setShowSignIn(false)} />}
        {user && (onboardingRole === 'pending' || onboardingRole === 'advisor-pending') && (
          <OnboardingRoleSelect
            userName={user.displayName || user.email}
            onboardingRole={onboardingRole}
            setOnboardingRole={setOnboardingRole}
            onSelect={handleOnboardingRole}
          />
        )}
        {showProfile && <Profile user={user} onClose={() => setShowProfile(false)} />}
        <Routes>
          <Route path="/explore" element={<Explore />} />
          <Route path="/partner/:id" element={<PartnerDetail />} />
          <Route path="/" element={
            <>
              {/* 메인 배너 */}
              <section className="main-banner">
                <div className="banner-content">
                  <div className="banner-title">
                    <span className="block">Fuel Your Curiosity,</span>
                    <span className="block">Where questions find answers.</span>
                  </div>
                  <div className="search-bar modern">
                    <div className="search-icon">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#23272a"/>
                        <g>
                          <circle cx="19" cy="19" r="8" stroke="#fff" strokeWidth="2.5" fill="none"/>
                          <line x1="26.5" y1="26.5" x2="33" y2="33" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                        </g>
                      </svg>
                    </div>
                    <input type="text" placeholder="Search for someone to talk to..." />
                  </div>
                  <div className="suggested-tags">
                    {tags.map((tag, idx) => (
                      <button
                        key={tag}
                        className={activeTag === idx ? "active" : ""}
                        onClick={() => setActiveTag(idx)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
              {/* 실사용 예시 대화 위 문구 */}
              <div className="section-headline">
                <div className="section-headline-sub">THE SPACE TO SHARE AND LEARN</div>
                <div className="section-headline-main">Curioor helps you ask and discover</div>
              </div>
              {/* 말풍선 카드(대화 시퀀스) */}
              <ConversationSequence />
              <div className="service-categories">
                {/* ...카드 10개... */}
              </div>
              <section className="third-section">
                <h2 className="third-title">Click. Connect. Learn.</h2>
                <p className="third-subtitle">
                  Choose your advisor and join the conversation instantly on Google Meet.
                </p>
                <div className="meet-logo-box">
                  <img src="/google-meet-logo.svg" alt="Google Meet" className="meet-logo-full" />
                </div>
              </section>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

// 중앙 집중형 대화 시퀀스 컴포넌트
const conversationData = [
  {
    question: 'How can I get into OpenAI..?',
    answer: "Hi, I'm a senior software engineer at OpenAI. Here's how you can do it.",
    avatar: '/openai-logo.png',
  },
  {
    question: 'I want to launch my own startup. Any advice?',
    answer: "Hey, I've founded 3 startups. Let me tell you what worked for me.",
    avatar: '/ycombinator-logo.png',
  },
  {
    question: "What's the meaning of life to you?",
    answer: "As a philosophy professor, I love this question. Let's talk.",
    avatar: '/harvard-logo.png',
  },
  {
    question: 'How can I gain followers on Instagram?',
    answer: "Hi, I have a few hundred thousand followers. Here's the strategy that worked for me.",
    avatar: '/instagram-logo.png',
  },
];

function ConversationSequence() {
  const [currentPair, setCurrentPair] = useState(0); // 0, 1, 2 (각 쌍의 인덱스)
  const [showAnswer, setShowAnswer] = useState(false); // false: 질문, true: 답변

  // 다음 단계로 이동하는 함수
  const goNext = () => {
    if (!showAnswer) {
      setShowAnswer(true);
    } else if (currentPair < conversationData.length - 1) {
      setCurrentPair(currentPair + 1);
      setShowAnswer(false);
    }
  };

  // 되돌아가기(리셋) 함수
  const goReset = () => {
    setCurrentPair(0);
    setShowAnswer(false);
  };

  // 마지막 단계(마지막 답변)에서는 버튼 숨김
  const isLast = showAnswer && currentPair === conversationData.length - 1;

  // 현재 보여줄 말풍선 정보
  const { question, answer, avatar } = conversationData[currentPair];

  // 카테고리 카드 active 상태 관리
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryList = [
    { icon: <FaRocket size={32} />, title: 'Startups & Entrepreneurship' },
    { icon: <FaUserTie size={32} />, title: 'Career Strategy & Job Change' },
    { icon: <FaBullhorn size={32} />, title: 'Marketing & Social Media' },
    { icon: <FaPiggyBank size={32} />, title: 'Investing & Personal Finance' },
    { icon: <FaHandsHelping size={32} />, title: 'Life & Personal Advice' },
    { icon: <FaHeartbeat size={32} />, title: 'Mental Health & Wellbeing' },
    { icon: <FaHeart size={32} />, title: 'Relationships & Dating' },
    { icon: <FaCog size={32} />, title: 'Tech & Engineering' },
    { icon: <FaLightbulb size={32} />, title: 'Philosophy & Big Questions' },
    { icon: <FaGraduationCap size={32} />, title: 'Education & Learning' },
  ];

  return (
    <div className="conversation-sequence-bg">
      <div className="conversation-sequence">
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            <div className="bubble-row">
              <motion.div
                key={`q${currentPair}`}
                className="cs-bubble cs-question"
                initial={{ opacity: 0, scale: 1.1, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={{ duration: 0.5, ease: [0.4, 0.1, 0.4, 1] }}
              >
                {question}
              </motion.div>
              {!isLast && (
                <button className="next-bubble-btn btn-abs" onClick={goNext} aria-label="다음">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#ffe066"/>
                    <path d="M20 16l10 8-10 8" stroke="#23272a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {isLast && (
                <button className="next-bubble-btn btn-abs" onClick={goReset} aria-label="처음으로">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#ffe066"/>
                    <path d="M28 16l-10 8 10 8" stroke="#23272a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="bubble-row">
              <motion.div
                key={`a${currentPair}`}
                className="cs-bubble cs-answer"
                initial={{ opacity: 0, scale: 1.1, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={{ duration: 0.5, ease: [0.4, 0.1, 0.4, 1] }}
              >
                {answer}
                {avatar && (
                  <span className="cs-avatar"><img src={avatar} alt="avatar" /></span>
                )}
              </motion.div>
              {!isLast && (
                <button className="next-bubble-btn btn-abs" onClick={goNext} aria-label="다음">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#ffe066"/>
                    <path d="M20 16l10 8-10 8" stroke="#23272a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              {isLast && (
                <button className="next-bubble-btn btn-abs" onClick={goReset} aria-label="처음으로">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#ffe066"/>
                    <path d="M28 16l-10 8 10 8" stroke="#23272a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
        <div className="service-categories">
          {categoryList.map((cat, idx) => (
            <div
              key={cat.title}
              className={`service-card${activeCategory === idx ? ' active' : ''}`}
              onClick={() => setActiveCategory(idx)}
            >
              <span className="service-icon">{cat.icon}</span>
              <div className="service-title">{cat.title.split(' & ').map((line, i, arr) => arr.length > 1 && i === 0 ? line + ' &' : line).map((line, i) => (
                <span key={i}>{i === 1 ? <br /> : null}{line}</span>
              ))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;