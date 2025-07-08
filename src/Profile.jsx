import React, { useState, useEffect, useRef } from 'react';
import { storage, db } from './firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AvailableTimeSection from './components/AvailableTimeSection';
import PricingSection from './PricingSection';

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

const defaultCover = '/default-cover.jpg';
const defaultProfile = '/default-profile.png';

// 회사명으로 로고 URL 생성 (대소문자 무관)
const getCompanyLogoUrl = (companyName) => {
  if (!companyName) return '';
  const cleanName = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // 특수문자 제거
    .replace(/\s+/g, ''); // 공백 제거
  return `https://www.google.com/s2/favicons?domain=${cleanName}.com&sz=64`;
};

// 대학교명으로 로고 URL 생성 (대소문자 무관)
const getUniversityLogoUrl = (universityName) => {
  if (!universityName) return '';
  
  // 주요 대학교 도메인 매핑
  const universityDomains = {
    'harvard': 'harvard.edu',
    'harvard university': 'harvard.edu',
    'mit': 'mit.edu',
    'massachusetts institute of technology': 'mit.edu',
    'stanford': 'stanford.edu',
    'stanford university': 'stanford.edu',
    'yale': 'yale.edu',
    'yale university': 'yale.edu',
    'princeton': 'princeton.edu',
    'princeton university': 'princeton.edu',
    'columbia': 'columbia.edu',
    'columbia university': 'columbia.edu',
    'upenn': 'upenn.edu',
    'university of pennsylvania': 'upenn.edu',
    'cornell': 'cornell.edu',
    'cornell university': 'cornell.edu',
    'dartmouth': 'dartmouth.edu',
    'dartmouth college': 'dartmouth.edu',
    'brown': 'brown.edu',
    'brown university': 'brown.edu',
    'ucla': 'ucla.edu',
    'university of california los angeles': 'ucla.edu',
    'uc berkeley': 'berkeley.edu',
    'university of california berkeley': 'berkeley.edu',
    'nyu': 'nyu.edu',
    'new york university': 'nyu.edu',
    'usc': 'usc.edu',
    'university of southern california': 'usc.edu',
    'georgetown': 'georgetown.edu',
    'georgetown university': 'georgetown.edu',
    'duke': 'duke.edu',
    'duke university': 'duke.edu',
    'northwestern': 'northwestern.edu',
    'northwestern university': 'northwestern.edu',
    'vanderbilt': 'vanderbilt.edu',
    'vanderbilt university': 'vanderbilt.edu',
    'emory': 'emory.edu',
    'emory university': 'emory.edu',
    'washington university': 'wustl.edu',
    'washu': 'wustl.edu',
    'rice': 'rice.edu',
    'rice university': 'rice.edu',
    'notre dame': 'nd.edu',
    'university of notre dame': 'nd.edu',
    'carnegie mellon': 'cmu.edu',
    'carnegie mellon university': 'cmu.edu',
    'johns hopkins': 'jhu.edu',
    'johns hopkins university': 'jhu.edu',
    'tufts': 'tufts.edu',
    'tufts university': 'tufts.edu',
    'brandeis': 'brandeis.edu',
    'brandeis university': 'brandeis.edu',
    'boston university': 'bu.edu',
    'bu': 'bu.edu',
    'boston college': 'bc.edu',
    'bc': 'bc.edu',
    'northeastern': 'northeastern.edu',
    'northeastern university': 'northeastern.edu',
    'georgia tech': 'gatech.edu',
    'georgia institute of technology': 'gatech.edu',
    'virginia tech': 'vt.edu',
    'virginia polytechnic institute': 'vt.edu',
    'purdue': 'purdue.edu',
    'purdue university': 'purdue.edu',
    'indiana university': 'iu.edu',
    'iu': 'iu.edu',
    'university of michigan': 'umich.edu',
    'umich': 'umich.edu',
    'michigan state': 'msu.edu',
    'michigan state university': 'msu.edu',
    'ohio state': 'osu.edu',
    'ohio state university': 'osu.edu',
    'university of illinois': 'illinois.edu',
    'uiuc': 'illinois.edu',
    'university of wisconsin': 'wisc.edu',
    'uw madison': 'wisc.edu',
    'university of minnesota': 'umn.edu',
    'umn': 'umn.edu',
    'university of iowa': 'uiowa.edu',
    'uiowa': 'uiowa.edu',
    'university of texas': 'utexas.edu',
    'utexas': 'utexas.edu',
    'texas a&m': 'tamu.edu',
    'texas a&m university': 'tamu.edu',
    'university of florida': 'ufl.edu',
    'ufl': 'ufl.edu',
    'university of miami': 'miami.edu',
    'umiami': 'miami.edu',
    'university of california': 'uc.edu',
    'uc': 'uc.edu',
    'university of washington': 'washington.edu',
    'uw': 'washington.edu',
    'university of oregon': 'uoregon.edu',
    'uoregon': 'uoregon.edu',
    'university of arizona': 'arizona.edu',
    'uarizona': 'arizona.edu',
    'arizona state': 'asu.edu',
    'arizona state university': 'asu.edu',
    'university of colorado': 'colorado.edu',
    'ucolorado': 'colorado.edu',
    'university of utah': 'utah.edu',
    'uutah': 'utah.edu',
    'university of nevada': 'unr.edu',
    'unr': 'unr.edu',
    'university of alaska': 'alaska.edu',
    'ualaska': 'alaska.edu',
    'university of hawaii': 'hawaii.edu',
    'uhawaii': 'hawaii.edu'
  };
  
  const cleanName = universityName.toLowerCase().trim();
  
  // 매핑된 도메인이 있으면 사용
  if (universityDomains[cleanName]) {
    return `https://www.google.com/s2/favicons?domain=${universityDomains[cleanName]}&sz=64`;
  }
  
  // 일반적인 변환 (기존 로직)
  const simpleName = cleanName
    .replace(/[^a-z0-9]/g, '') // 특수문자 제거
    .replace(/\s+/g, ''); // 공백 제거
  return `https://www.google.com/s2/favicons?domain=${simpleName}.edu&sz=64`;
};

function Profile({ user }) {
  // State for sidebar selection
  const [selected, setSelected] = useState('about');

  // Profile data states
  const [profileImg, setProfileImg] = useState(user?.photoURL || defaultProfile);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [headline, setHeadline] = useState('');
  const [quote, setQuote] = useState('');
  const [jobs, setJobs] = useState([]);
  const [educations, setEducations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const nameRef = useRef();

  useEffect(() => {
    setIsFetched(false);
  }, [user]);

  useEffect(() => {
    if (!user || isFetched) return;
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || user.displayName || '');
        setHeadline(data.headline || '');
        setQuote(data.quote || '');
        
        // 프로필 사진 설정 (Firestore에서 불러온 사진 우선)
        if (data.photoURL) {
          setProfileImg(data.photoURL);
        } else if (user.photoURL) {
          setProfileImg(user.photoURL);
        }
        
        // 기존 jobs에 로고 URL 추가
        const jobsWithLogos = (data.jobs || []).map(job => ({
          ...job,
          logoUrl: job.logoUrl || getCompanyLogoUrl(job.company)
        }));
        setJobs(jobsWithLogos);
        
        // 로고 URL이 없는 기존 데이터가 있으면 Firestore에 업데이트
        const hasJobsWithoutLogos = (data.jobs || []).some(job => !job.logoUrl);
        if (hasJobsWithoutLogos) {
          const updatedJobs = jobsWithLogos.map(job => ({
            ...job,
            logoUrl: job.logoUrl || getCompanyLogoUrl(job.company)
          }));
          await saveField({ jobs: updatedJobs });
          console.log('Updated existing jobs with logos:', updatedJobs);
        }
        
        // 기존 educations에 로고 URL 추가
        const educationsWithLogos = (data.educations || []).map(edu => ({
          ...edu,
          logoUrl: edu.logoUrl || getUniversityLogoUrl(edu.school)
        }));
        setEducations(educationsWithLogos);
        
        // 로고 URL이 없는 기존 데이터가 있으면 Firestore에 업데이트
        const hasEducationsWithoutLogos = (data.educations || []).some(edu => !edu.logoUrl);
        if (hasEducationsWithoutLogos) {
          const updatedEducations = educationsWithLogos.map(edu => ({
            ...edu,
            logoUrl: edu.logoUrl || getUniversityLogoUrl(edu.school)
          }));
          await saveField({ educations: updatedEducations });
        }
        setLanguages(data.languages || []);
        setSelectedCategories(data.categories || []);
      }
      setIsFetched(true);
    };
    fetchProfile();
  }, [user, isFetched]);

  // Firestore save helpers
  const saveField = async (fields) => {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, fields);
      } else {
        await setDoc(ref, fields, { merge: true });
      }
    } catch (err) {
      alert('Failed to save.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Profile image upload
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }
    setUploading(true);
    try {
      const fileRef = storageRef(storage, `profile_photos/${user.uid}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      await updateProfile(user, { photoURL: url });
      setProfileImg(url);
    } catch (err) {
      alert('Failed to upload profile photo.');
    } finally {
      setUploading(false);
    }
  };

  // Section save handlers
  const handleSaveAbout = async () => {
    await saveField({ name, headline, quote });
    alert('Saved!');
  };
  const handleSaveExperience = async () => {
    try {
      // jobs에 로고 URL 추가
      const jobsWithLogos = jobs.map(job => ({
        ...job,
        logoUrl: job.logoUrl || getCompanyLogoUrl(job.company)
      }));
      await saveField({ jobs: jobsWithLogos });
      console.log('Experience saved successfully:', jobsWithLogos);
    } catch (error) {
      console.error('Failed to save experience:', error);
      alert('Failed to save experience. Please try again.');
    }
  };
  const handleSaveEducation = async () => {
    try {
      // educations에 로고 URL 추가
      const educationsWithLogos = educations.map(edu => ({
        ...edu,
        logoUrl: edu.logoUrl || getUniversityLogoUrl(edu.school)
      }));
      await saveField({ educations: educationsWithLogos });
      console.log('Education saved successfully:', educationsWithLogos);
    } catch (error) {
      console.error('Failed to save education:', error);
      alert('Failed to save education. Please try again.');
    }
  };
  const handleSaveLanguages = async () => {
    await saveField({ languages });
    alert('Saved!');
  };
  const handleSaveCategories = async () => {
    await saveField({ categories: selectedCategories });
    alert('Saved!');
  };

  // Category toggle
  const handleCategoryToggle = cat => {
    setSelectedCategories(selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]);
  };

  // Input style
  const inputStyle = { width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ececec', fontSize: 16, fontFamily: 'NeueHaasDisplayThin' };

  // Experience Section (완전 흰색 카드, 동적 Company Info, +버튼)
  const ExperienceSection = () => {
    const [forms, setForms] = useState([
      { company: '', department: '', title: '', start: '', end: '', isCurrent: false, desc: '', editIdx: null, startDate: null, endDate: null, logoUrl: '' }
    ]);
    const [editIdx, setEditIdx] = useState(null);

    // 기존 jobs 배열과 forms 동기화 (수정/삭제/추가 시)
    useEffect(() => {
      if (jobs.length > 0) {
        setForms(jobs.map(j => ({
          ...j,
          editIdx: null,
          startDate: /^\d{4}\.\d{2}$/.test(j.start) ? new Date(j.start.replace('.', '-') + '-01') : null,
          endDate: /^\d{4}\.\d{2}$/.test(j.end) ? new Date(j.end.replace('.', '-') + '-01') : null,
          logoUrl: j.logoUrl || getCompanyLogoUrl(j.company)
        })));
      }
    }, [jobs]);

    // + 버튼 클릭 시 입력란 추가
    const handleAddForm = () => {
      setForms([...forms, { company: '', department: '', title: '', start: '', end: '', isCurrent: false, desc: '', editIdx: null, startDate: null, endDate: null, logoUrl: '' }]);
    };

    // 입력값 변경
    const handleChange = (idx, field, value) => {
      setForms(forms.map((f, i) => {
        if (i === idx) {
          const updatedForm = { ...f, [field]: value };
          // 회사명이 변경되면 로고 URL 자동 생성
          if (field === 'company') {
            updatedForm.logoUrl = getCompanyLogoUrl(value);
          }
          return updatedForm;
        }
        return f;
      }));
    };

    // 날짜 변경
    const handleDateChange = (idx, field, date) => {
      setForms(forms.map((f, i) => i === idx ? { ...f, [field + 'Date']: date, [field]: date ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '' } : f));
    };

    // Add/Update 버튼
    const handleSave = idx => {
      const newJobs = forms.map(f => {
        const { editIdx, ...rest } = f;
        return rest;
      });
      setJobs(newJobs);
      setEditIdx(null);
      // Firestore 저장
      handleSaveExperience();
    };

    // 삭제
    const handleDelete = idx => {
      const newForms = forms.filter((_, i) => i !== idx);
      setForms(newForms);
      setJobs(newForms.map(f => {
        const { editIdx, ...rest } = f;
        return rest;
      }));
      handleSaveExperience();
    };

    // 구분선 스타일
    const divider = <div style={{ borderTop: '1.5px solid #ececec', margin: '28px 0' }} />;

    return (
      <div style={{ maxWidth: 540, margin: '0 auto', padding: 32, background: '#fff', borderRadius: 16, color: '#23272a', boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1.5px solid #ececec', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'NeueHaasDisplayThin', fontWeight: 700, fontSize: 22, margin: 0 }}>Work Experience</h2>
          <button onClick={handleAddForm} style={{ background: '#23272a', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Add Experience">+</button>
        </div>
        <div style={{ background: '#f7f7f7', borderRadius: 10, padding: '14px 18px', marginBottom: 18, color: '#23272a', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span role="img" aria-label="tip" style={{ fontSize: 18 }}>💡</span>
          <span>It's okay not to fill in every field. Write more details to make your profile stand out!</span>
        </div>
        {forms.map((form, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1.5px solid #ececec', borderRadius: 12, padding: 20, marginBottom: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Company Info</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  value={form.company} 
                  onChange={e => handleChange(idx, 'company', e.target.value)} 
                  placeholder="Company Name" 
                  style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1, paddingLeft: form.logoUrl ? '50px' : '12px' }} 
                />
                {form.logoUrl && (
                  <img 
                    src={form.logoUrl} 
                    alt="Company logo" 
                    style={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: 24, 
                      height: 24, 
                      borderRadius: 4,
                      objectFit: 'contain'
                    }} 
                    onError={(e) => {
                      e.target.src = '/default-company-logo.png';
                    }}
                  />
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input value={form.department} onChange={e => handleChange(idx, 'department', e.target.value)} placeholder="Department" style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }} />
              <input value={form.title} onChange={e => handleChange(idx, 'title', e.target.value)} placeholder="Position/Title" style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <DatePicker
                selected={form.startDate}
                onChange={date => handleDateChange(idx, 'start', date)}
                dateFormat="yyyy.MM"
                showMonthYearPicker
                placeholderText="Start (YYYY.MM)"
                className="react-datepicker__input-text"
                customInput={<input style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', borderRadius: 8, width: 140 }} />}
              />
              <DatePicker
                selected={form.endDate}
                onChange={date => handleDateChange(idx, 'end', date)}
                dateFormat="yyyy.MM"
                showMonthYearPicker
                placeholderText="End (YYYY.MM)"
                className="react-datepicker__input-text"
                customInput={<input style={{ ...inputStyle, background: form.isCurrent ? '#ececec' : '#f7f7f7', color: form.isCurrent ? '#bbb' : '#23272a', border: '1.5px solid #ececec', borderRadius: 8, width: 140 }} disabled={form.isCurrent} />}
                disabled={form.isCurrent}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <input type="checkbox" checked={form.isCurrent} onChange={e => handleChange(idx, 'isCurrent', e.target.checked)} style={{ marginRight: 8, accentColor: form.isCurrent ? '#ffe066' : '#ececec', width: 18, height: 18 }} />
              <span style={{ fontSize: 15 }}>Currently working here</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <textarea
                value={form.desc}
                onChange={e => handleChange(idx, 'desc', e.target.value)}
                placeholder="Describe your role, achievements, and responsibilities. Use numbers and specifics for more impact."
                style={{
                  ...inputStyle,
                  background: '#f7f7f7',
                  color: '#23272a',
                  border: '1.5px solid #ececec',
                  minHeight: 80,
                  resize: 'vertical',
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'block',
                  borderRadius: 8,
                  marginRight: 0
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => handleSave(idx)} style={{ fontSize: 15, border: 'none', background: '#23272a', color: '#fff', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', fontWeight: 700 }}>Save</button>
              {forms.length > 1 && (
                <button onClick={() => handleDelete(idx)} style={{ fontSize: 15, border: 'none', background: '#f66', color: '#fff', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', fontWeight: 700 }}>Delete</button>
              )}
            </div>
            {idx < forms.length - 1 && divider}
          </div>
        ))}
      </div>
    );
  };

  // Education Section (Degree 드롭다운, 연월 date picker)
  const DEGREE_OPTIONS = [
    'Bachelor', 'Master', 'Doctorate', 'Associate', 'Diploma', 'Certificate', 'Other'
  ];
  const EducationSection = () => {
    const [forms, setForms] = useState([
      { school: '', degree: '', major: '', start: '', end: '', isCurrent: false, desc: '', editIdx: null, suggestions: [], showDropdown: false, loading: false, startDate: null, endDate: null, logoUrl: '' }
    ]);


    const [editIdx, setEditIdx] = useState(null);
    const inputRefs = useRef([]);

    // 기존 educations 배열과 forms 동기화
    useEffect(() => {
      if (educations.length > 0) {
        setForms(educations.map(e => ({
          ...e,
          editIdx: null,
          suggestions: [],
          showDropdown: false,
          loading: false,
          startDate: /^\d{4}\.\d{2}$/.test(e.start) ? new Date(e.start.replace('.', '-') + '-01') : null,
          endDate: /^\d{4}\.\d{2}$/.test(e.end) ? new Date(e.end.replace('.', '-') + '-01') : null,
          logoUrl: e.logoUrl || getUniversityLogoUrl(e.school)
        })));
      }
    }, [educations]);

    // + 버튼 클릭 시 입력란 추가
    const handleAddForm = () => {
      setForms([...forms, { school: '', degree: '', major: '', start: '', end: '', isCurrent: false, desc: '', editIdx: null, suggestions: [], showDropdown: false, loading: false, startDate: null, endDate: null, logoUrl: '' }]);
    };

    // 대학명 자동완성 API 호출
    const fetchUniversitySuggestions = async (idx, value) => {
      if (!value) {
        setForms(forms => forms.map((f, i) => i === idx ? { ...f, suggestions: [], showDropdown: false, loading: false } : f));
        return;
      }
      setForms(forms => forms.map((f, i) => i === idx ? { ...f, loading: true } : f));
      try {
        const res = await fetch(`https://universitiesapi.herokuapp.com/search?name=${encodeURIComponent(value)}`);
        const data = await res.json();
        setForms(forms => forms.map((f, i) => i === idx ? { ...f, suggestions: data.slice(0, 8), showDropdown: true, loading: false } : f));
      } catch {
        setForms(forms => forms.map((f, i) => i === idx ? { ...f, suggestions: [], showDropdown: false, loading: false } : f));
      }
    };

    // 입력값 변경
    const handleChange = (idx, field, value) => {
      setForms(forms.map((f, i) => {
        if (i === idx) {
          const updatedForm = { ...f, [field]: value };
          // 대학교명이 변경되면 로고 URL 자동 생성
          if (field === 'school') {
            updatedForm.logoUrl = getUniversityLogoUrl(value);
            fetchUniversitySuggestions(idx, value);
          }
          return updatedForm;
        }
        return f;
      }));
    };

    // DatePicker 연월 선택
    const handleDateChange = (idx, field, date) => {
      setForms(forms.map((f, i) => i === idx ? { ...f, [field + 'Date']: date, [field]: date ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '' } : f));
    };

    // 자동완성 선택
    const handleSelectSuggestion = (idx, suggestion) => {
      setForms(forms.map((f, i) => i === idx ? { ...f, school: suggestion.name, suggestions: [], showDropdown: false } : f));
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
      const handleClick = (e) => {
        if (!inputRefs.current) return;
        let clicked = false;
        inputRefs.current.forEach(ref => {
          if (ref && ref.contains(e.target)) clicked = true;
        });
        if (!clicked) {
          setForms(forms => forms.map(f => ({ ...f, showDropdown: false })));
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // 저장
    const handleSave = async (idx) => {
      try {
        const newEducations = forms.map(f => {
          const { editIdx, suggestions, showDropdown, loading, startDate, endDate, ...rest } = f;
          return rest;
        });
        setEducations(newEducations);
        setEditIdx(null);
        await handleSaveEducation();
      } catch (error) {
        console.error('Error saving education:', error);
        alert('Failed to save education. Please try again.');
      }
    };

    // 삭제
    const handleDelete = async (idx) => {
      try {
        const newForms = forms.filter((_, i) => i !== idx);
        setForms(newForms);
        const newEducations = newForms.map(f => {
          const { editIdx, suggestions, showDropdown, loading, startDate, endDate, ...rest } = f;
          return rest;
        });
        setEducations(newEducations);
        await handleSaveEducation();
      } catch (error) {
        console.error('Error deleting education:', error);
        alert('Failed to delete education. Please try again.');
      }
    };

    // 구분선
    const divider = <div style={{ borderTop: '1.5px solid #ececec', margin: '28px 0' }} />;

    return (
      <div style={{ maxWidth: 540, margin: '0 auto', padding: 0 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1.5px solid #ececec', padding: '32px 32px 28px 32px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 20, fontFamily: 'NeueHaasDisplayThin' }}>Education</div>
            <button onClick={handleAddForm} style={{ background: '#23272a', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Add Education">+</button>
          </div>
          <div style={{ borderTop: '1.5px solid #ececec', margin: '18px 0 24px 0' }} />
          {forms.map((form, idx) => (
            <div key={idx} style={{ background: '#fff', border: '1.5px solid #ececec', borderRadius: 12, padding: 20, marginBottom: 0, position: 'relative' }} ref={el => inputRefs.current[idx] = el}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>University Info</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, position: 'relative' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    value={form.school}
                    onChange={e => handleChange(idx, 'school', e.target.value)}
                    placeholder="University Name"
                    style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1, paddingLeft: form.logoUrl ? '50px' : '12px' }}
                    autoComplete="off"
                    onFocus={() => form.suggestions.length > 0 && setForms(forms.map((f, i) => i === idx ? { ...f, showDropdown: true } : f))}
                  />
                  {form.logoUrl && (
                    <img 
                      src={form.logoUrl} 
                      alt="University logo" 
                      style={{ 
                        position: 'absolute', 
                        left: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        width: 24, 
                        height: 24, 
                        borderRadius: 4,
                        objectFit: 'contain'
                      }} 
                      onError={(e) => {
                        e.target.src = '/default-university-logo.png';
                      }}
                    />
                  )}
                </div>
                {/* 자동완성 드롭다운 */}
                {form.showDropdown && form.suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: '#fff', border: '1.5px solid #ececec', borderRadius: 8, zIndex: 10, boxShadow: '0 2px 12px #0002', maxHeight: 220, overflowY: 'auto' }}>
                    {form.suggestions.map((s, i) => (
                      <div key={i} onClick={() => handleSelectSuggestion(idx, s)} style={{ padding: '10px 16px', cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', color: '#23272a', borderBottom: i !== form.suggestions.length - 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: '#888' }}>{s.country}{s.domains && s.domains.length > 0 ? ` · ${s.domains[0]}` : ''}</span>
                        {/* 대학 로고는 API에서 제공하지 않으므로 미지원 */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <select value={form.degree} onChange={e => handleChange(idx, 'degree', e.target.value)} style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }}>
                  <option value="">Select Degree</option>
                  {DEGREE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input value={form.major} onChange={e => handleChange(idx, 'major', e.target.value)} placeholder="Major" style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <DatePicker
                  selected={form.startDate}
                  onChange={date => handleDateChange(idx, 'start', date)}
                  dateFormat="yyyy.MM"
                  showMonthYearPicker
                  placeholderText="Start (YYYY.MM)"
                  className="react-datepicker__input-text"
                  customInput={<input style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', borderRadius: 8, width: 140 }} />}
                />
                <DatePicker
                  selected={form.endDate}
                  onChange={date => handleDateChange(idx, 'end', date)}
                  dateFormat="yyyy.MM"
                  showMonthYearPicker
                  placeholderText="End (YYYY.MM)"
                  className="react-datepicker__input-text"
                  customInput={<input style={{ ...inputStyle, background: form.isCurrent ? '#ececec' : '#f7f7f7', color: form.isCurrent ? '#bbb' : '#23272a', border: '1.5px solid #ececec', borderRadius: 8, width: 140 }} disabled={form.isCurrent} />}
                  disabled={form.isCurrent}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <input type="checkbox" checked={form.isCurrent} onChange={e => handleChange(idx, 'isCurrent', e.target.checked)} style={{ marginRight: 8, accentColor: form.isCurrent ? '#ffe066' : '#ececec', width: 18, height: 18 }} />
                <span style={{ fontSize: 15 }}>Currently enrolled</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <textarea
                  value={form.desc}
                  onChange={e => handleChange(idx, 'desc', e.target.value)}
                  placeholder="Additional details (optional)"
                  style={{
                    ...inputStyle,
                    background: '#f7f7f7',
                    color: '#23272a',
                    border: '1.5px solid #ececec',
                    minHeight: 60,
                    resize: 'vertical',
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'block',
                    borderRadius: 8,
                    marginRight: 0
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => handleSave(idx)} style={{ fontSize: 15, border: 'none', background: '#23272a', color: '#fff', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', fontWeight: 700 }}>Save</button>
                {forms.length > 1 && (
                  <button onClick={() => handleDelete(idx)} style={{ fontSize: 15, border: 'none', background: '#f66', color: '#fff', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', fontWeight: 700 }}>Delete</button>
                )}
              </div>
              {idx < forms.length - 1 && divider}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Languages Section (참고사진 스타일, 흰색 카드, 드롭다운, +추가)
  const LANGUAGE_OPTIONS = [
    'English', 'Korean', 'Japanese', 'Chinese', 'French', 'German', 'Spanish', 'Russian', 'Hindi', 'Portuguese', 'Italian', 'Arabic', 'Other'
  ];
  const FLUENCY_OPTIONS = [
    'Native', 'Fluent', 'Professional', 'Conversational', 'Basic'
  ];
  const LanguagesSection = () => {
    const [form, setForm] = useState({ name: '', fluency: '' });
    const [editIdx, setEditIdx] = useState(null);

    // 추가
    const handleAdd = () => {
      if (!form.name || !form.fluency) return;
      setLanguages([...languages, form]);
      setForm({ name: '', fluency: '' });
    };
    // 수정
    const handleEdit = idx => {
      setEditIdx(idx);
      setForm(languages[idx]);
    };
    // 업데이트
    const handleUpdate = () => {
      if (editIdx === null) return;
      const updated = languages.map((l, i) => (i === editIdx ? form : l));
      setLanguages(updated);
      setEditIdx(null);
      setForm({ name: '', fluency: '' });
    };
    // 삭제
    const handleDelete = idx => {
      setLanguages(languages.filter((_, i) => i !== idx));
    };
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 0 }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1.5px solid #ececec', padding: '32px 32px 28px 32px' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, fontFamily: 'NeueHaasDisplayThin' }}>Languages</div>
          <div style={{ borderTop: '1.5px solid #ececec', margin: '18px 0 24px 0' }} />
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18, fontFamily: 'NeueHaasDisplayThin', color: '#23272a' }}>Language</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }}
            >
              <option value="">Select Language</option>
              {LANGUAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select
              value={form.fluency}
              onChange={e => setForm({ ...form, fluency: e.target.value })}
              style={{ ...inputStyle, background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', flex: 1 }}
            >
              <option value="">Select Fluency</option>
              {FLUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <button
            onClick={async () => {
              if (editIdx === null) {
                if (!form.name || !form.fluency) return;
                const newLanguages = [...languages, form];
                setLanguages(newLanguages);
                setForm({ name: '', fluency: '' });
                await saveField({ languages: newLanguages });
              } else {
                if (!form.name || !form.fluency) return;
                const updated = languages.map((l, i) => (i === editIdx ? form : l));
                setLanguages(updated);
                setEditIdx(null);
                setForm({ name: '', fluency: '' });
                await saveField({ languages: updated });
              }
            }}
            style={{ background: 'none', border: 'none', color: '#23272a', fontWeight: 600, fontSize: 16, marginBottom: 18, marginLeft: 2, cursor: 'pointer', padding: 0, fontFamily: 'NeueHaasDisplayThin' }}
          >
            + Add
          </button>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 10 }}>
            {languages.map((lang, idx) => (
              <li key={idx} style={{ background: '#f7f7f7', borderRadius: 8, padding: '10px 18px', marginBottom: 10, boxShadow: '0 1px 6px #0001', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{lang.name}</span>
                  <span style={{ color: '#888', fontSize: 15, marginLeft: 12 }}>{lang.fluency}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(idx)} style={{ fontSize: 15, border: 'none', background: '#ececec', color: '#23272a', borderRadius: 6, padding: '4px 14px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(idx)} style={{ fontSize: 15, border: 'none', background: '#f66', color: '#fff', borderRadius: 6, padding: '4px 14px', cursor: 'pointer' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Categories Section
  const CategoriesSection = () => (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 0 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1.5px solid #ececec', padding: '32px 32px 28px 32px', position: 'relative' }}>
        <div style={{ fontWeight: 700, fontSize: 20, fontFamily: 'NeueHaasDisplayThin', marginBottom: 8 }}>Advisor Categories</div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f7f7f7', borderRadius: 10, padding: '14px 18px', marginBottom: 18, color: '#23272a', fontSize: 15, gap: 8 }}>
          <span role="img" aria-label="tip" style={{ fontSize: 18 }}>💡</span>
          <span>Your selected categories will be shown on the platform as your areas of expertise.</span>
        </div>
        <div className="profile-cat-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {categories.map(cat => (
            <label key={cat} className="profile-cat-item" style={{ fontFamily: 'NeueHaasDisplayThin', fontSize: 16, background: selectedCategories.includes(cat) ? '#23272a' : '#f7f7f7', color: selectedCategories.includes(cat) ? '#fff' : '#23272a', border: selectedCategories.includes(cat) ? '2px solid #23272a' : '2px solid #ececec', borderRadius: 20, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} style={{ marginRight: 8 }} />
              {cat}
            </label>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: 18 }}>
          <button onClick={handleSaveCategories} style={{ fontFamily: 'NeueHaasDisplayThin', fontSize: 17, border: 'none', background: '#23272a', color: '#fff', borderRadius: 8, padding: '10px 32px', cursor: 'pointer' }} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );

  // About Me Section (ExperienceSection과 동일한 구조)
  const AboutMeSection = () => {
    const [form, setForm] = useState({ name: '', quote: '', headline: '' });

    // Firestore fetch → form 동기화
    useEffect(() => {
      if (!user) return;
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setForm({
            name: data.name || user.displayName || '',
            quote: data.quote || '',
            headline: data.headline || ''
          });
        }
      };
      fetchProfile();
    }, [user]);

    return (
      <div style={{ maxWidth: 420, margin: '0 auto', padding: 0 }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1.5px solid #ececec', padding: '36px 32px 32px 32px', color: '#23272a' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, fontFamily: 'NeueHaasDisplayThin', color: '#23272a' }}>Basic Info</div>
          <div style={{ borderTop: '1.5px solid #ececec', margin: '18px 0 28px 0' }} />
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 18, fontFamily: 'NeueHaasDisplayThin', color: '#23272a' }}>My Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ marginBottom: 12, width: 180, height: 180, borderRadius: 18, background: '#205080', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <img src={profileImg} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18, background: '#205080', display: profileImg ? 'block' : 'none' }} />
              {!profileImg && <span style={{ fontSize: 54, color: '#fff', fontWeight: 700, fontFamily: 'NeueHaasDisplayThin' }}>Photo</span>}
              <input id="profile-photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileChange} disabled={uploading} />
              <button onClick={() => document.getElementById('profile-photo-input').click()} disabled={uploading} style={{ position: 'absolute', bottom: 10, right: 10, background: '#23272a', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'NeueHaasDisplayThin', opacity: 0.92 }}>Change Photo</button>
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontFamily: 'NeueHaasDisplayThin', fontWeight: 500, marginBottom: 6, color: '#888', display: 'block', fontSize: 15 }}>Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your name"
              style={{ width: '100%', background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', borderRadius: 12, padding: '14px 16px', fontSize: 17, fontFamily: 'NeueHaasDisplayThin', marginBottom: 0, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontFamily: 'NeueHaasDisplayThin', fontWeight: 500, marginBottom: 6, color: '#888', display: 'block', fontSize: 15 }}>Headline</label>
            <input
              value={form.headline}
              onChange={e => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Product Manager at Google"
              style={{ width: '100%', background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', borderRadius: 12, padding: '14px 16px', fontSize: 17, fontFamily: 'NeueHaasDisplayThin', marginBottom: 0, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontFamily: 'NeueHaasDisplayThin', fontWeight: 500, marginBottom: 6, color: '#888', display: 'block', fontSize: 15 }}>Favorite Quote</label>
            <input
              value={form.quote}
              onChange={e => setForm({ ...form, quote: e.target.value })}
              placeholder="Your favorite quote or motto"
              style={{ width: '100%', background: '#f7f7f7', color: '#23272a', border: '1.5px solid #ececec', borderRadius: 12, padding: '14px 16px', fontSize: 17, fontFamily: 'NeueHaasDisplayThin', marginBottom: 0, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ textAlign: 'left', marginTop: 18 }}>
            <button onClick={async () => { await saveField({ name: form.name, quote: form.quote, headline: form.headline }); }} style={{ fontFamily: 'NeueHaasDisplayThin', fontSize: 17, border: 'none', background: '#23272a', color: '#fff', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontWeight: 700 }} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar
  const sidebarStyle = {
    width: 220,
    background: '#fff',
    borderRight: '1.5px solid #ececec',
    minHeight: '100vh',
    padding: '36px 0',
    fontFamily: 'NeueHaasDisplayThin',
    position: 'sticky',
    top: 0
  };
  const sidebarItemStyle = isActive => ({
    padding: '16px 32px',
    fontWeight: 600,
    fontSize: 17,
    color: isActive ? '#23272a' : '#888',
    background: isActive ? '#fffbe6' : 'transparent',
    border: isActive ? 'none' : 'none',
    borderLeft: isActive ? '4px solid #ffe066' : '4px solid transparent',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'NeueHaasDisplayThin',
    transition: 'background 0.13s, color 0.13s, border 0.13s'
  });

  // Main layout
  return (
    <div style={{ display: 'flex', background: '#fff', minHeight: '100vh', fontFamily: 'NeueHaasDisplayThin' }}>
      <aside style={sidebarStyle}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32, textAlign: 'center', letterSpacing: 1 }}>Profile</div>
        <button style={sidebarItemStyle(selected === 'about')} onClick={() => setSelected('about')}>About Me</button>
        <button style={sidebarItemStyle(selected === 'experience')} onClick={() => setSelected('experience')}>Experience</button>
        <button style={sidebarItemStyle(selected === 'education')} onClick={() => setSelected('education')}>Education</button>
        <button style={sidebarItemStyle(selected === 'languages')} onClick={() => setSelected('languages')}>Languages</button>
        <button style={sidebarItemStyle(selected === 'categories')} onClick={() => setSelected('categories')}>Advisor Categories</button>
        <button style={sidebarItemStyle(selected === 'availability')} onClick={() => setSelected('availability')}>Available Time</button>
        <button style={sidebarItemStyle(selected === 'pricing')} onClick={() => setSelected('pricing')}>Pricing</button>
      </aside>
      <main style={{ flex: 1, background: '#fff', minHeight: '100vh', fontFamily: 'NeueHaasDisplayThin' }}>
        {selected === 'about' && <AboutMeSection />}
        {selected === 'experience' && <ExperienceSection />}
        {selected === 'education' && <EducationSection />}
        {selected === 'languages' && <LanguagesSection />}
        {selected === 'categories' && <CategoriesSection />}
        {selected === 'availability' && <AvailableTimeSection user={user} />}
        {selected === 'pricing' && <PricingSection />}
      </main>
    </div>
  );
}

export default Profile; 