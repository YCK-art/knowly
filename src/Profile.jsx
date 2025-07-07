import React, { useState, useRef } from 'react';

const categories = [
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

const fluencyLevels = [
  'Native or bilingual',
  'Full professional',
  'Professional working',
  'Limited working',
  'Elementary',
];

const defaultCover = '/default-cover.jpg'; // public 폴더에 기본 배너 이미지 추가 필요
const defaultProfile = '/default-profile.png';

function Profile({ user }) {
  // 이미지 상태
  const [coverImg, setCoverImg] = useState(defaultCover);
  const [profileImg, setProfileImg] = useState(user?.photoURL || defaultProfile);
  const coverInputRef = useRef();
  const profileInputRef = useRef();

  // 상태
  const [name, setName] = useState(user?.displayName || '');
  const [headline, setHeadline] = useState('');
  const [quote, setQuote] = useState('');
  const [jobs, setJobs] = useState([
    { title: '', position: '', period: '', desc: '' }
  ]);
  const [educations, setEducations] = useState([
    { degree: '', period: '' }
  ]);
  const [languages, setLanguages] = useState([
    { name: '', fluency: fluencyLevels[0] }
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 핸들러
  const handleCategoryToggle = cat => {
    setSelectedCategories(selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]);
  };

  // 이미지 업로드 핸들러
  const handleCoverChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCoverImg(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleProfileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setProfileImg(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // LinkedIn 스타일 레이아웃
  return (
    <div className="profile-page-bg">
      <div className="profile-page-card">
        {/* 커버/프로필 이미지 영역 */}
        <div className="profile-cover-wrap">
          <img src={coverImg} alt="cover" className="profile-cover-img" />
          <button className="profile-cover-edit" onClick={() => coverInputRef.current.click()}>
            <span role="img" aria-label="edit">📷</span>
          </button>
          <input type="file" accept="image/*" style={{ display: 'none' }} ref={coverInputRef} onChange={handleCoverChange} />
          <div className="profile-avatar-wrap">
            <img src={profileImg} alt="profile" className="profile-avatar-img" />
            <button className="profile-avatar-edit" onClick={() => profileInputRef.current.click()}>
              <span role="img" aria-label="edit">＋</span>
            </button>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={profileInputRef} onChange={handleProfileChange} />
          </div>
        </div>
        {/* 폼 영역 */}
        <div className="profile-form-wrap">
          <h2 className="profile-title">Advisor Profile</h2>
          <div className="profile-section">
            <label>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="profile-section">
            <label>Headline</label>
            <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Product Manager at Google" />
          </div>
          <div className="profile-section">
            <label>Favorite Quote</label>
            <input value={quote} onChange={e => setQuote(e.target.value)} placeholder="Your favorite quote or motto" />
          </div>
          <div className="profile-section">
            <label>Career</label>
            {jobs.map((job, i) => (
              <div key={i} className="profile-career-row">
                <input value={job.title} onChange={e => {
                  const arr = [...jobs]; arr[i].title = e.target.value; setJobs(arr);
                }} placeholder="Job Title" />
                <input value={job.position} onChange={e => {
                  const arr = [...jobs]; arr[i].position = e.target.value; setJobs(arr);
                }} placeholder="Position" />
                <input value={job.period} onChange={e => {
                  const arr = [...jobs]; arr[i].period = e.target.value; setJobs(arr);
                }} placeholder="Period (e.g. 2020-2023)" />
                <input value={job.desc} onChange={e => {
                  const arr = [...jobs]; arr[i].desc = e.target.value; setJobs(arr);
                }} placeholder="Description" />
                {jobs.length > 1 && <button onClick={() => setJobs(jobs.filter((_, idx) => idx !== i))}>-</button>}
              </div>
            ))}
            <button className="profile-add-btn" onClick={() => setJobs([...jobs, { title: '', position: '', period: '', desc: '' }])}>+ Add Career</button>
          </div>
          <div className="profile-section">
            <label>Education</label>
            {educations.map((edu, i) => (
              <div key={i} className="profile-edu-row">
                <input value={edu.degree} onChange={e => {
                  const arr = [...educations]; arr[i].degree = e.target.value; setEducations(arr);
                }} placeholder="Degree / School" />
                <input value={edu.period} onChange={e => {
                  const arr = [...educations]; arr[i].period = e.target.value; setEducations(arr);
                }} placeholder="Period (e.g. 2015-2019)" />
                {educations.length > 1 && <button onClick={() => setEducations(educations.filter((_, idx) => idx !== i))}>-</button>}
              </div>
            ))}
            <button className="profile-add-btn" onClick={() => setEducations([...educations, { degree: '', period: '' }])}>+ Add Education</button>
          </div>
          <div className="profile-section">
            <label>Languages</label>
            {languages.map((lang, i) => (
              <div key={i} className="profile-lang-row">
                <input value={lang.name} onChange={e => {
                  const arr = [...languages]; arr[i].name = e.target.value; setLanguages(arr);
                }} placeholder="Language (e.g. English)" />
                <select value={lang.fluency} onChange={e => {
                  const arr = [...languages]; arr[i].fluency = e.target.value; setLanguages(arr);
                }}>
                  {fluencyLevels.map(lv => <option key={lv}>{lv}</option>)}
                </select>
                {languages.length > 1 && <button onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}>-</button>}
              </div>
            ))}
            <button className="profile-add-btn" onClick={() => setLanguages([...languages, { name: '', fluency: fluencyLevels[0] }])}>+ Add Language</button>
          </div>
          <div className="profile-section">
            <label>Advisor Categories (select all that apply)</label>
            <div className="profile-cat-list">
              {categories.map(cat => (
                <label key={cat} className="profile-cat-item">
                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="profile-btn-row">
            <button className="profile-save-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 