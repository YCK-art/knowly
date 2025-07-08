import React, { useState, useRef } from 'react';
import Select from 'react-select';

function OnboardingRoleSelect({ userName, onComplete, setOnboardingRole, showOnboardingDone, setShowOnboardingDone, isLoadingRole }) {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1);
  const [advisorReasons, setAdvisorReasons] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [done, setDone] = useState(false);
  const [country, setCountry] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const lastNameRef = useRef(null);
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

  // Seeker 동기 선택지 추가
  const seekerOptions = [
    "I'm looking for guidance and advice from experienced people",
    "I want to learn from real-life stories and perspectives",
    "I'm exploring ideas and figuring out my next steps",
    "I'm looking for meaningful conversations about big questions",
    "I just want to connect and get inspired by others",
    "Others (short text)"
  ];

  const [seekerReasons, setSeekerReasons] = useState([]);
  const [seekerOtherText, setSeekerOtherText] = useState('');

  // 로딩 중일 때는 1단계 표시
  if (isLoadingRole) {
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
              <div className="onboarding-role-label">Seeker</div>
              <div className="onboarding-role-check">{selected === 'user' ? '✔️' : ''}</div>
            </div>
            <div
              className={`onboarding-role-box${selected === 'advisor' ? ' selected' : ''}`}
              onClick={() => setSelected('advisor')}
              style={{ backgroundImage: "url('/advisor-logo.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="onboarding-role-label">Advisor</div>
              <div className="onboarding-role-check">{selected === 'advisor' ? '✔️' : ''}</div>
            </div>
          </div>
          <button
            className="onboarding-next-btn"
            disabled={!selected}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // 2단계: Seeker 동기 설문 (최대 3개 중복 선택)
  if (step === 2 && selected === 'user') {
    const handleSelect = (opt) => {
      if (seekerReasons.includes(opt)) {
        setSeekerReasons(seekerReasons.filter(r => r !== opt));
        if (opt === 'Others (short text)') setSeekerOtherText('');
      } else if (seekerReasons.length < 3) {
        setSeekerReasons([...seekerReasons, opt]);
      }
    };
    const isSelected = (opt) => seekerReasons.includes(opt);
    const isDisabled = (opt) => !isSelected(opt) && seekerReasons.length >= 3;
    return (
      <div className="onboarding-bg">
        <div className="onboarding-card">
          <div className="onboarding-title">What inspires you to join Curioor as a Seeker?</div>
          <div style={{ color: '#888', fontSize: '0.98rem', textAlign: 'center', marginTop: 6, marginBottom: 2, fontWeight: 400 }}>
            You can select up to 3.
          </div>
          <div style={{ height: 24 }} />
          <div className="onboarding-role-row" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch', marginBottom: 24 }}>
            {seekerOptions.map((opt, idx) => (
              <div
                key={opt}
                className={`advisor-reason-box${isSelected(opt) ? ' selected' : ''}${isDisabled(opt) ? ' disabled' : ''}`}
                onClick={() => !isDisabled(opt) && handleSelect(opt)}
                style={{ minHeight: 40, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 12, border: '2px solid #ececec', background: isDisabled(opt) ? '#f7f7f7' : '#fff', cursor: isDisabled(opt) ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 500, transition: 'border 0.18s, box-shadow 0.18s', position: 'relative', opacity: isDisabled(opt) ? 0.6 : 1 }}
              >
                {opt === 'Others (short text)' ? (
                  <>
                    Others <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.98em', marginLeft: 2 }}>(short text)</span>
                    {isSelected('Others (short text)') && (
                      <input
                        type="text"
                        value={seekerOtherText}
                        onChange={e => setSeekerOtherText(e.target.value)}
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
              disabled={seekerReasons.length === 0 || (seekerReasons.includes('Others (short text)') && !seekerOtherText.trim())}
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2단계: Advisor 동기 설문 (최대 3개 중복 선택)
  if (step === 2 && selected === 'advisor') {
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
                    Other
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

  // 3단계: 국가 선택 (Seeker/Advisor 공통)
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

  // 4단계: 이름 입력 (Seeker/Advisor 공통)
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
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  lastNameRef.current && lastNameRef.current.focus();
                }
              }}
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last Name"
              style={{ flex: 1, padding: '14px 12px', fontSize: '1.08rem', borderRadius: 10, border: '2px solid #ececec' }}
              autoComplete="family-name"
              ref={lastNameRef}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button
              className="onboarding-next-btn"
              disabled={!firstName || !lastName}
              onClick={() => {
                onComplete({
                  role: selected === 'user' ? 'seeker' : 'advisor',
                  motivation: selected === 'user' ? seekerReasons : advisorReasons,
                  motivationOther: selected === 'user' ? seekerOtherText : otherText,
                  country,
                  firstName,
                  lastName
                });
              }}
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