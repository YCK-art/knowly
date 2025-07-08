import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const samplePartners = [
  // Explore.jsx와 동일한 샘플 데이터 (실제 서비스에서는 Firestore에서 파트너 목록 fetch)
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

function FavoritesPage({ user }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return setFavorites([]);
    setLoading(true);
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      }
    }).finally(()=>setLoading(false));
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

  // 즐겨찾기한 파트너만 필터링
  const favoritePartners = samplePartners.filter(p => favorites.includes(p.id));

  if (!user) return <div style={{padding:40,textAlign:'center',color:'#888'}}>로그인이 필요합니다.</div>;
  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>로딩 중...</div>;

  return (
    <div className="explore-page">
      <h2 style={{fontWeight:700,fontSize:'1.3rem',margin:'24px 0 28px 0',color:'#23272a'}}>즐겨찾기</h2>
      <div className="explore-partner-grid">
        {favoritePartners.length === 0 ? (
          <div style={{padding:40,textAlign:'center',color:'#bbb',width:'100%'}}>즐겨찾기한 파트너가 없습니다.</div>
        ) : favoritePartners.map(partner => (
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

export default FavoritesPage; 