import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiHeart } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';



function FavoritesPage({ user }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [favoriteAdvisors, setFavoriteAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoriteAdvisors([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        const userFavorites = docSnap.data().favorites || [];
        setFavorites(userFavorites);
        
        // 즐겨찾기한 어드바이저들의 실제 데이터를 가져오기
        const fetchFavoriteAdvisors = async () => {
          const advisors = [];
          for (const advisorId of userFavorites) {
            try {
              const advisorDoc = await getDoc(doc(db, 'users', advisorId));
              if (advisorDoc.exists()) {
                const advisorData = advisorDoc.data();
                // 가격 계산 (15분 단위 기준)
                const unitPrice = advisorData.pricing?.unitPrice || 0;
                const minDuration = advisorData.pricing?.durations?.[0] || 30;
                const calculatedPrice = unitPrice > 0 ? (unitPrice * (minDuration / 15)).toFixed(2) : 0;
                
                advisors.push({
                  id: advisorId,
                  name: advisorData.name || 'Unknown',
                  title: advisorData.name || 'Unknown',
                  desc: advisorData.headline || 'No description available',
                  price: calculatedPrice,
                  duration: `${minDuration}min`,
                  rating: 5.0,
                  reviews: 0,
                  img: advisorData.profileImg || '/default-profile.png',
                });
              }
            } catch (error) {
              console.error('Error fetching advisor:', advisorId, error);
            }
          }
          setFavoriteAdvisors(advisors);
        };
        
        fetchFavoriteAdvisors();
      }
    }).finally(() => setLoading(false));
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
      // 즐겨찾기 제거 시 목록에서도 즉시 제거
      setFavoriteAdvisors(prev => prev.filter(advisor => advisor.id !== partnerId));
    } else {
      updated = [...favorites, partnerId];
    }
    setFavorites(updated);
    await setDoc(doc(db, 'users', user.uid), { favorites: updated }, { merge: true });
  };

  if (!user) return <div style={{padding:40,textAlign:'center',color:'#888'}}>Login required.</div>;
  if (loading) return <div style={{padding:40,textAlign:'center',color:'#888'}}>Loading...</div>;

  return (
    <div className="explore-page">
      <h2 style={{fontWeight:700,fontSize:'1.3rem',margin:'24px 0 28px 0',color:'#23272a'}}>Favorites</h2>
      <div className="explore-partner-grid">
        {favoriteAdvisors.length === 0 ? (
          <div style={{padding:40,textAlign:'center',color:'#bbb',width:'100%'}}>No Favorite Advisors yet.</div>
        ) : favoriteAdvisors.map(partner => (
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
                <span className="partner-price">
                  From ${partner.price} 
                  <span className="partner-duration">({partner.duration})</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoritesPage; 