import React, { useState } from 'react';
import Select from 'react-select';

function OnboardingRoleSelect({ userName, onSelect, setOnboardingRole }) {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1);
  const [advisorReasons, setAdvisorReasons] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [done, setDone] = useState(false);
  const [country, setCountry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const countryOptions = [
    { value: '', label: 'Select a country' },
    { value: 'US', label: 'United States' },
    { value: 'KR', label: 'South Korea' },
    { value: 'JP', label: 'Japan' },
    { value: 'CN', label: 'China' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IN', label: 'India' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'SG', label: 'Singapore' },
    { value: 'BR', label: 'Brazil' },
    { value: 'RU', label: 'Russia' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    // ... 필요시 더 추가
  ];

  // Advisor 동기 선택지
  const advisorOptions = [
    'Help people with my expertise',
    'Meet and connect with curious minds',
    'Mentor people starting their journey',
    'Test and improve my teaching skills',
    'Other',
  ];

  // 1단계: 역할 선택
  if (step === 1) {
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card">
          <div className="onboarding-title">{userName}, welcome to Curioor!<br/>How would you like to be part of it?</div>
          <div className="onboarding-sub">We'll tailor your experience to your choice.</div>
          <div className="onboarding-role-row">
            <div
              className={`onboarding-role-box${selected === 'user' ? ' selected' : ''}`}
              onClick={() => setSelected('user')}
              style={{ backgroundImage: "url('/seeker-logo.png')", backgroundSize: '120% auto', backgroundPosition: 'center' }}
            >
              {/*<img src="/seeker-logo.png" alt="Seeker" className="onboarding-role-img" />*/}
              <div className="onboarding-role-label">Seeker</div>
              <div className="onboarding-role-check">{selected === 'user' ? '✔️' : ''}</div>
            </div>
            <div
              className={`onboarding-role-box${selected === 'advisor' ? ' selected' : ''}`}
              onClick={() => setSelected('advisor')}
              style={{ backgroundImage: "url('/advisor-logo.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/*<img src="/onboarding-freelancer.png" alt="Advisor" className="onboarding-role-img" />*/}
              <div className="onboarding-role-label">Advisor</div>
              <div className="onboarding-role-check">{selected === 'advisor' ? '✔️' : ''}</div>
            </div>
          </div>
          <button
            className="onboarding-next-btn"
            disabled={!selected}
            onClick={() => {
              if (selected === 'advisor') {
                setStep(2);
              } else {
                onSelect('seeker');
              }
            }}
          >Next</button>
        </div>
      </div>
    );
  }

  // 2단계: Advisor 동기 설문 (최대 3개 중복 선택)
  if (step === 2) {
    const handleSelect = (opt) => {
      if (advisorReasons.includes(opt)) {
        setAdvisorReasons(advisorReasons.filter(r => r !== opt));
        if (opt === 'Other') setOtherText('');
      } else if (advisorReasons.length < 3) {
        setAdvisorReasons([...advisorReasons, opt]);
      }
    };
    const isSelected = (opt) => advisorReasons.includes(opt);
    const isDisabled = (opt) => !isSelected(opt) && advisorReasons.length >= 3;
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card">
          <div className="onboarding-title">What inspires you to join Curioor as an Advisor?</div>
          <div style={{ color: '#888', fontSize: '0.98rem', textAlign: 'center', marginTop: 6, marginBottom: 2, fontWeight: 400 }}>
            You can select up to 3.
          </div>
          <div style={{ height: 24 }} />
          <div className="onboarding-role-row" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch', marginBottom: 24 }}>
            {advisorOptions.map((opt, idx) => (
              <div
                key={opt}
                className={`advisor-reason-box${isSelected(opt) ? ' selected' : ''}${isDisabled(opt) ? ' disabled' : ''}`}
                onClick={() => !isDisabled(opt) && handleSelect(opt)}
                style={{ minHeight: 40, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 12, border: '2px solid #ececec', background: isDisabled(opt) ? '#f7f7f7' : '#fff', cursor: isDisabled(opt) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, transition: 'border 0.18s, box-shadow 0.18s', position: 'relative', opacity: isDisabled(opt) ? 0.6 : 1 }}
              >
                {opt === 'Other' ? (
                  <>
                    Other <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.98em', marginLeft: 2 }}>(short text)</span>
                    {isSelected('Other') && (
                      <input
                        type="text"
                        value={otherText}
                        onChange={e => setOtherText(e.target.value)}
                        placeholder="Please specify"
                        style={{ marginLeft: 12, flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '1rem', background: 'transparent' }}
                        maxLength={40}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                  </>
                ) : opt}
                {isSelected(opt) && (
                  <span style={{ position: 'absolute', right: 18, color: '#ffe066', fontSize: 22 }}>✔️</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button
              className="onboarding-next-btn"
              disabled={advisorReasons.length === 0 || (advisorReasons.includes('Other') && !otherText.trim())}
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3단계: 국가 선택
  if (step === 3) {
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card">
          <div className="onboarding-title" style={{marginBottom: 38}}>Which country are you based in?</div>
          <div style={{ width: '100%', marginBottom: 32 }}>
            <Select
              options={countryOptions}
              value={countryOptions.find(c => c.value === country) || countryOptions[0]}
              onChange={opt => setCountry(opt.value)}
              placeholder="Select a country"
              isSearchable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 48,
                  borderRadius: 10,
                  borderColor: '#ececec',
                  fontSize: '1.08rem',
                  boxShadow: 'none',
                  paddingLeft: 2,
                }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button
              className="onboarding-next-btn"
              disabled={!country}
              onClick={() => setStep(4)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 완료 창 (done이 true일 때 먼저 체크)
  if (done) {
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card" style={{ alignItems: 'center', textAlign: 'center', padding: '38px 24px 32px 24px', maxWidth: '420px', width: '90%', position: 'relative' }}>
          <button
            onClick={() => setOnboardingRole(null)}
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
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
          <div className="onboarding-title" style={{ marginBottom: 16, fontSize: '2rem', fontWeight: 700 }}>
            🎉 Congratulations! Your onboarding is now complete.
          </div>
          <div className="onboarding-sub" style={{ marginBottom: 32, fontSize: '1.13rem', color: '#444', fontWeight: 500 }}>
            Complete your profile so Seekers can discover you and know what you can help them with.
          </div>
          <img src="/congrats.png" alt="Congratulations" style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 16, marginBottom: 32 }} />
          <button
            className="onboarding-next-btn"
            onClick={() => onSelect('advisor')}
            style={{ marginTop: 0, fontSize: '1.13rem', padding: '14px 0', width: 220, borderRadius: 12 }}
          >Go to My Profile</button>
        </div>
      </div>
    );
  }

  // 4단계: 이름 입력
  if (step === 4) {
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card">
          <div className="onboarding-title" style={{marginBottom: 38}}>Lastly, Please tell us your name</div>
          <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 32 }}>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First Name"
              style={{ flex: 1, padding: '14px 12px', fontSize: '1.08rem', borderRadius: 10, border: '2px solid #ececec' }}
              autoComplete="given-name"
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last Name"
              style={{ flex: 1, padding: '14px 12px', fontSize: '1.08rem', borderRadius: 10, border: '2px solid #ececec' }}
              autoComplete="family-name"
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button
              className="onboarding-next-btn"
              disabled={!firstName || !lastName}
              onClick={() => { setDone(true); }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default OnboardingRoleSelect; 