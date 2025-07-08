import React, { useEffect, useState, useRef } from 'react';
import { db, storage } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiCamera } from 'react-icons/fi';
import { updateProfile } from 'firebase/auth';

const COUNTRY_MAP = {
  KR: 'South Korea',
  US: 'United States',
  JP: 'Japan',
  CN: 'China',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  BR: 'Brazil',
  RU: 'Russia',
  IT: 'Italy',
  ES: 'Spain',
};

const LANGUAGE_OPTIONS = [
  'English', 'Korean', 'Japanese', 'Chinese', 'French', 'German', 'Spanish', 'Russian', 'Hindi', 'Portuguese', 'Italian', 'Arabic', 'Other'
];
const FLUENCY_OPTIONS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Basic'];
const INTEREST_CATEGORIES = [
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

function SeekerProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [languages, setLanguages] = useState([]); // [{lang: 'English', fluency: 'Fluent'}]
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedFluency, setSelectedFluency] = useState('');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [interests, setInterests] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          setLanguages(data.languages || []);
          setInterests(data.interests || []);
          if (data.photoURL) {
            setPhotoURL(data.photoURL);
          }
        } else {
          // 사용자 문서가 없으면 기본값으로 설정
          setProfile({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            country: 'US',
            languages: [],
            interests: []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // 에러가 발생해도 기본값으로 설정
        setProfile({
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          country: 'US',
          languages: [],
          interests: []
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleAddLanguage = async () => {
    if (!selectedLang || !selectedFluency) return;
    if (languages.some(l => l.lang === selectedLang)) return;
    const updated = [...languages, { lang: selectedLang, fluency: selectedFluency }];
    setLanguages(updated);
    setSelectedLang('');
    setSelectedFluency('');
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { languages: updated });
      } catch (error) {
        console.error('Error updating languages:', error);
      }
    }
  };

  const handleRemoveLanguage = async (lang) => {
    const updated = languages.filter(l => l.lang !== lang);
    setLanguages(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { languages: updated });
      } catch (error) {
        console.error('Error removing language:', error);
      }
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) {
      console.log('No file selected or user not authenticated');
      return;
    }

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting upload for user:', user.uid);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      // Storage 참조 생성
      const fileRef = storageRef(storage, `profile_photos/${user.uid}_${Date.now()}`);
      console.log('Storage reference created:', fileRef.fullPath);

      // 파일 업로드
      console.log('Uploading file to Firebase Storage...');
      const uploadTask = uploadBytes(fileRef, file);
      
      // 업로드 완료 대기
      const snapshot = await uploadTask;
      console.log('Upload completed, bytes transferred:', snapshot.bytesTransferred);

      // 다운로드 URL 가져오기
      console.log('Getting download URL...');
      const url = await getDownloadURL(fileRef);
      console.log('Download URL obtained:', url);

      // Firestore 업데이트
      console.log('Updating Firestore document...');
      await updateDoc(doc(db, 'users', user.uid), { 
        photoURL: url,
        photoUpdatedAt: new Date().toISOString()
      });

      // Auth 프로필 업데이트
      console.log('Updating Auth profile...');
      await updateProfile(user, { photoURL: url });

      // 상태 업데이트
      setPhotoURL(url);
      setUploadProgress(100);
      
      console.log('Profile photo update completed successfully');
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // 구체적인 에러 메시지
      let errorMessage = 'Failed to upload photo. ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'You do not have permission to upload files.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Storage quota exceeded.';
      } else if (error.code === 'storage/unauthenticated') {
        errorMessage += 'Please sign in again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleInterest = async (cat) => {
    let updated;
    if (interests.includes(cat)) {
      updated = interests.filter(i => i !== cat);
    } else {
      updated = [...interests, cat];
    }
    setInterests(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { interests: updated });
      } catch (error) {
        console.error('Error updating interests:', error);
      }
    }
  };

  // 프로필 사진 제거 함수
  const handleRemovePhoto = async () => {
    if (!user) return;
    setUploading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { photoURL: '' });
      await updateProfile(user, { photoURL: '' });
      setPhotoURL('');
    } catch (err) {
      alert('Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 40, 
        fontFamily: 'NeueHaasDisplayThin, sans-serif',
        textAlign: 'center',
        color: '#666'
      }}>
        Loading profile...
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div style={{ 
        padding: 40, 
        fontFamily: 'NeueHaasDisplayThin, sans-serif',
        textAlign: 'center',
        color: '#666'
      }}>
        Profile not found
      </div>
    );
  }

  const countryName = COUNTRY_MAP[profile.country] || profile.country || 'Unknown';
  const joinedDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString('en-US', { year: 'numeric', month: 'long' })
    : '';

  // 이름 표시에 Firestore의 firstName/lastName 우선
  const displayName = (profile.firstName || profile.lastName)
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : (user.displayName || user.email || 'Your Name');

  return (
    <div style={{
      maxWidth: 540, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', fontFamily: 'NeueHaasDisplayThin, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '36px 36px 18px 36px', borderBottom: '1px solid #eee' }}>
        <div style={{ position: 'relative', width: 96, height: 96, marginRight: 32 }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handlePhotoChange}
            disabled={uploading}
          />
          <div
            style={{
              width: 96, height: 96, borderRadius: '50%', background: photoURL ? '#b39ddb' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', overflow: 'visible', position: 'relative', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            onClick={() => !uploading && fileInputRef.current.click()}
            onMouseEnter={() => setShowCamera(true)}
            onMouseLeave={() => setShowCamera(false)}
          >
            {photoURL
              ? <img src={photoURL} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : null
            }
            {uploading && (
              <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, fontSize: 14, color: '#666', textAlign: 'center', padding: '0 4px' }}>
                {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
              </div>
            )}
            {(!photoURL || showCamera) && !uploading && (
              <div style={{
                position: 'absolute',
                bottom: -10, right: -10,
                background: '#fff', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.10)', border: '2px solid #eee', cursor: 'pointer', transition: 'background 0.18s', zIndex: 10
              }}
              onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
              title="Change profile photo"
              >
                <FiCamera size={22} color="#888" />
              </div>
            )}
            {/* 사진이 있을 때만 삭제 버튼 노출 */}
            {photoURL && !uploading && (
              <button
                style={{
                  position: 'absolute',
                  top: -10, left: -10,
                  background: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.10)', border: '2px solid #eee', cursor: 'pointer', zIndex: 11, borderColor: '#f66', color: '#f66', fontWeight: 700, fontSize: 18
                }}
                onClick={e => { e.stopPropagation(); handleRemovePhoto(); }}
                title="Remove profile photo"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 2, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
            {displayName}
          </div>
          <div style={{ color: '#888', fontSize: 17, marginBottom: 8, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
            @{user.email?.split('@')[0]}
          </div>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
            <span role="img" aria-label="location">📍</span> {countryName}
          </div>
          <div style={{ color: '#444', fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
            <span role="img" aria-label="joined">👤</span> Joined in {joinedDate}
          </div>
        </div>
      </div>
      <div style={{ padding: '28px 36px 32px 36px', textAlign: 'left' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>Languages</div>
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
          {languages.map(langObj => (
            <li key={langObj.lang} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, fontSize: 16 }}>
              {langObj.lang} <span style={{ color: '#888', fontSize: 15, marginLeft: 8 }}>({langObj.fluency})</span>
              <button onClick={() => handleRemoveLanguage(langObj.lang)} style={{ marginLeft: 10, color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
          <select
            value={selectedLang}
            onChange={e => setSelectedLang(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}
          >
            <option value="">Select language</option>
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={selectedFluency}
            onChange={e => setSelectedFluency(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}
          >
            <option value="">Select fluency</option>
            {FLUENCY_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button onClick={handleAddLanguage} style={{ padding: '8px 20px', borderRadius: 6, background: '#23272a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>Add</button>
        </div>
        <div style={{ fontWeight: 600, fontSize: 18, margin: '32px 0 10px 0', fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>Interests</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontFamily: 'NeueHaasDisplayThin, sans-serif' }}>
          {INTEREST_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleToggleInterest(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: interests.includes(cat) ? '2px solid #23272a' : '2px solid #ececec',
                background: interests.includes(cat) ? '#23272a' : '#f7f7f7',
                color: interests.includes(cat) ? '#fff' : '#23272a',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'NeueHaasDisplayThin, sans-serif',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeekerProfile; 