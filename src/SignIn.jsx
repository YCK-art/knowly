import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

function SignIn({ mode = 'signup', onSuccess }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [currentMode, setCurrentMode] = useState(mode); // 내부 상태로 관리

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Google 로그인에 실패했습니다.');
    }
  };

  const handleEmailContinue = (e) => {
    e.preventDefault();
    if (!email) {
      setError('이메일을 입력하세요.');
      return;
    }
    setError('');
    alert((currentMode === 'signup' ? '회원가입' : '로그인') + ' - 이메일: ' + email);
    if (onSuccess) onSuccess();
  };

  // 모달 바깥 클릭 시 닫기
  const handleBgClick = (e) => {
    if (e.target.classList.contains('signin-modal-bg') && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="signin-modal-bg" onClick={handleBgClick}>
      <div className="signin-modal-card" onClick={e => e.stopPropagation()}>
        <div className="signin-title">{currentMode === 'signup' ? 'Create a new account' : 'Sign in to your account'}</div>
        <div className="signin-sub">
          {currentMode === 'signup' ? (
            <>
              Already have an account?{' '}
              <span className="signin-link" onClick={() => setCurrentMode('signin')}>Sign in</span>
            </>
          ) : (
            <>
              New to Curioor?{' '}
              <span className="signin-link" onClick={() => setCurrentMode('signup')}>Create an account</span>
            </>
          )}
        </div>
        <button className="google-btn" onClick={handleGoogleSignIn}>
          <img src="/google-logo.png" alt="Google Logo" className="google-logo" />
          <span>Continue with Google</span>
        </button>
        <button className="email-btn-outline" onClick={() => alert('이메일 회원가입/로그인 폼 구현 필요')}> 
          <span className="email-icon">✉️</span>
          <span>Continue with email</span>
        </button>
        <div className="signin-or-row">
          <div className="signin-or-line" />
          <span className="signin-or-text">OR</span>
          <div className="signin-or-line" />
        </div>
        <div className="signin-social-row">
          <button className="social-btn" onClick={() => alert('Apple 로그인 준비중')}>
            <span className="apple-icon"></span> Apple
          </button>
          <button className="social-btn" onClick={() => alert('Facebook 로그인 준비중')}>
            <span className="facebook-icon">f</span> Facebook
          </button>
        </div>
        {error && <div className="signin-error">{error}</div>}
      </div>
    </div>
  );
}

export default SignIn; 