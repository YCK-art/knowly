import React from 'react';
import { useNavigate } from 'react-router-dom';

function OnboardingCongrats({ role, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card" style={{ alignItems: 'center', textAlign: 'center', padding: '38px 24px 32px 24px', maxWidth: '420px', width: '90%', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#888',
            padding: '4px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
        <div className="onboarding-title" style={{ marginBottom: 16, fontSize: '2rem', fontWeight: 700 }}>
          🎉 Congratulations! Your onboarding is now complete.
        </div>
        <div className="onboarding-sub" style={{ marginBottom: 32, fontSize: '1.13rem', color: '#444', fontWeight: 500 }}>
          {role === 'seeker'
            ? "Now start exploring Advisors and make meaningful connections!"
            : "Complete your profile so Seekers can discover you and know what you can help them with."}
        </div>
        <img src="/congrats.png" alt="Congratulations" style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 16, marginBottom: 32 }} />
        <button
          className="onboarding-next-btn"
          onClick={() => {
            onClose();
            if (role === 'seeker') {
              navigate('/explore');
            } else {
              navigate('/profile');
            }
          }}
          style={{ marginTop: 0, fontSize: '1.13rem', padding: '14px 0', width: 220, borderRadius: 12 }}
        >
          {role === 'seeker' ? 'Go Explore' : 'Go to My Profile'}
        </button>
      </div>
    </div>
  );
}

export default OnboardingCongrats; 