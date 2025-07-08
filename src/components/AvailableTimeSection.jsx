import React, { useState, useEffect } from 'react';
import { MdDelete, MdAdd, MdCalendarToday } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './AvailableTimeSection.module.css';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const weekdayLabels = [
  { key: 'sun', label: 'Sun' },
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
];

const timezones = [
  { value: 'Asia/Seoul', label: 'Korea (Asia/Seoul)' },
  { value: 'America/New_York', label: 'USA East (New York)' },
  { value: 'America/Los_Angeles', label: 'USA West (LA)' },
  { value: 'Europe/London', label: 'UK (London)' },
  { value: 'Europe/Paris', label: 'France (Paris)' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Australia/Sydney', label: 'Australia (Sydney)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Bangkok', label: 'Thailand (Bangkok)' },
  { value: 'Europe/Berlin', label: 'Germany (Berlin)' },
  { value: 'America/Sao_Paulo', label: 'Brazil (Sao Paulo)' },
  { value: 'America/Vancouver', label: 'Canada (Vancouver)' },
  { value: 'Asia/Shanghai', label: 'China (Shanghai)' },
  { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
];

const defaultTimeRange = { start: '09:00', end: '18:00' };

const getDefaultTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Seoul';
  }
};

const AvailableTimeSection = ({ user }) => {
  const [weekTimes, setWeekTimes] = useState(() => {
    const obj = {};
    weekdayLabels.forEach(({ key }) => {
      obj[key] = [{ ...defaultTimeRange }];
    });
    return obj;
  });
  const [timezone, setTimezone] = useState(getDefaultTimezone());
  const [exceptionDates, setExceptionDates] = useState([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Firestore에서 불러오기
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDoc(doc(db, 'users', user.uid)).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.availableTime) setWeekTimes(data.availableTime);
        if (data.availableTimezone) setTimezone(data.availableTimezone);
        if (data.availableExceptions) {
          setExceptionDates(data.availableExceptions.map(ts => new Date(ts)));
        }
      }
    }).finally(() => setLoading(false));
  }, [user]);

  // 저장
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        availableTime: weekTimes,
        availableTimezone: timezone,
        availableExceptions: exceptionDates.map(d => d.toISOString().slice(0, 10)),
      });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 1200);
    } catch (e) {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // 요일별 시간대 추가
  const handleAddTime = (dayKey) => {
    setWeekTimes({
      ...weekTimes,
      [dayKey]: [...weekTimes[dayKey], { ...defaultTimeRange }],
    });
  };
  // 요일별 시간대 삭제
  const handleDeleteTime = (dayKey, idx) => {
    const arr = weekTimes[dayKey].filter((_, i) => i !== idx);
    setWeekTimes({ ...weekTimes, [dayKey]: arr.length ? arr : [] });
  };
  // 시간 변경
  const handleTimeChange = (dayKey, idx, field, value) => {
    setWeekTimes({
      ...weekTimes,
      [dayKey]: weekTimes[dayKey].map((t, i) =>
        i === idx ? { ...t, [field]: value } : t
      ),
    });
  };
  // 예외 날짜 추가
  const handleAddException = (date) => {
    if (!exceptionDates.find(d => d.getTime() === date.getTime())) {
      setExceptionDates([...exceptionDates, date]);
    }
    setDatePickerOpen(false);
  };
  // 예외 날짜 삭제
  const handleDeleteException = (idx) => {
    setExceptionDates(exceptionDates.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div className={styles.title}>Available Time by Weekday</div>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            style={{ fontSize: 15, border: '1.5px solid #ececec', borderRadius: 8, padding: '8px 16px', background: '#fafbfa', fontWeight: 600, color: '#23272a', outline: 'none', minWidth: 180 }}
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {weekdayLabels.map(({ key, label }) => (
            <div key={key} className={styles.weekRow}>
              <div className={styles.weekLabel}>{label}</div>
              <div className={styles.timeRanges}>
                {weekTimes[key].length === 0 ? (
                  <div className={styles.noTime}>No available time</div>
                ) : (
                  weekTimes[key].map((time, idx) => (
                    <div key={idx} className={styles.timeRangeRow}>
                      <input
                        type="time"
                        value={time.start}
                        onChange={e => handleTimeChange(key, idx, 'start', e.target.value)}
                        className={styles.timeInput}
                      />
                      <span className={styles.tilde}>~</span>
                      <input
                        type="time"
                        value={time.end}
                        onChange={e => handleTimeChange(key, idx, 'end', e.target.value)}
                        className={styles.timeInput}
                      />
                      <button onClick={() => handleDeleteTime(key, idx)} className={styles.deleteBtn} title="Delete"><MdDelete size={20} /></button>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.addBtnWrap}>
                <button
                  onClick={() => handleAddTime(key)}
                  className={styles.addBtn}
                  title="Add time range"
                >
                  <MdAdd size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{ marginTop: 32, width: '100%', background: '#FFD600', color: '#23272a', border: 'none', borderRadius: 8, padding: '15px 0', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(255,214,0,0.08)' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {saveMsg && <div style={{ color: '#888', fontSize: 15, marginTop: 10, textAlign: 'center' }}>{saveMsg}</div>}
      </div>
      {/* 우측: 예외 날짜 */}
      <div className={styles.exceptionCard}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
          Exception Dates
          <span style={{ marginLeft: 6, color: '#888', fontSize: 16 }}><MdCalendarToday /></span>
        </div>
        <div style={{ color: '#888', fontSize: 15, marginBottom: 18 }}>
          On these dates, you are <b>not available</b> for booking.
        </div>
        <button
          onClick={() => setDatePickerOpen(true)}
          style={{ width: '100%', padding: 12, border: '1.5px solid #FFD600', borderRadius: 8, background: '#fff', color: '#FFD600', fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(255,214,0,0.08)' }}
        >
          <MdAdd size={20} /> Add Exception Date
        </button>
        {datePickerOpen && (
          <DatePicker
            inline
            selected={null}
            onChange={handleAddException}
            minDate={new Date()}
            highlightDates={exceptionDates}
            onClickOutside={() => setDatePickerOpen(false)}
          />
        )}
        <div style={{ marginTop: 8 }}>
          {exceptionDates.length === 0 ? (
            <div style={{ color: '#bbb', fontSize: 15 }}>No exception dates</div>
          ) : (
            exceptionDates.map((date, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, background: '#fff', borderRadius: 6, padding: '8px 12px', border: '1.5px solid #ececec' }}>
                <span style={{ flex: 1 }}>{date.toLocaleDateString()}</span>
                <button onClick={() => handleDeleteException(idx)} style={{ background: 'none', border: 'none', color: '#23272a', cursor: 'pointer' }} title="Delete"><MdDelete size={18} /></button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableTimeSection; 