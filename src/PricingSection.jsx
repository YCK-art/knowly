import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const cardStyle = {
  background: '#fff',
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  border: '1.5px solid #f2f2f2',
  padding: '40px 40px 32px 40px',
  minWidth: 340,
  maxWidth: 480,
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: 120,
  padding: '12px 14px',
  border: '1.5px solid #ececec',
  borderRadius: 8,
  fontSize: 16,
  background: '#fafbfa',
  marginRight: 10,
};

const saveBtnStyle = {
  background: '#FFD600',
  color: '#23272a',
  border: 'none',
  borderRadius: 8,
  padding: '13px 0',
  fontWeight: 700,
  fontSize: 16,
  width: '100%',
  marginTop: 32,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(255,214,0,0.08)',
  transition: 'background 0.18s, box-shadow 0.18s',
};

function PricingSection() {
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedDurations, setSelectedDurations] = useState([30, 60]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Firestore에서 불러오기
  useEffect(() => {
    const fetchPricing = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.pricing) {
          if (data.pricing.unitPrice) setUnitPrice(String(data.pricing.unitPrice));
          if (data.pricing.durations) setSelectedDurations(data.pricing.durations);
        }
      }
    };
    fetchPricing();
  }, []);

  const handleDurationToggle = (val) => {
    setSelectedDurations(selectedDurations.includes(val)
      ? selectedDurations.filter(d => d !== val)
      : [...selectedDurations, val].sort((a, b) => a - b)
    );
  };

  const getPrice = (duration) => {
    const price = parseFloat(unitPrice);
    if (!price || isNaN(price)) return '';
    return (price * (duration / 15)).toFixed(2);
  };

  const handleSave = async () => {
    setSaving(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setSaving(false);
      setSaveMsg('Not logged in');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pricing: {
          unitPrice: parseFloat(unitPrice),
          durations: selectedDurations,
        }
      });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 1200);
    } catch (e) {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 28, color: '#23272a' }}>Set Your Pricing Policy</div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, fontSize: 16, marginRight: 12 }}>Price per 15 min</label>
        <input
          type="number"
          min={1}
          step={1}
          value={unitPrice}
          onChange={e => setUnitPrice(e.target.value.replace(/[^0-9.]/g, ''))}
          style={inputStyle}
          placeholder="e.g. 20"
        />
        <span style={{ fontWeight: 600, fontSize: 16 }}>USD</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Select available meeting durations:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DURATIONS.map(d => (
          <label key={d.value} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={selectedDurations.includes(d.value)}
              onChange={() => handleDurationToggle(d.value)}
              style={{ width: 18, height: 18, accentColor: '#FFD600' }}
            />
            <span>{d.label}</span>
            <span style={{ color: '#bbb', fontWeight: 400, marginLeft: 8 }}>
              {getPrice(d.value) ? `($${getPrice(d.value)})` : ''}
            </span>
          </label>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: 14, marginTop: 18, marginBottom: 0 }}>
        Set your price per 15 minutes. Only the selected durations will be available for booking.<br />
        The price for each duration is automatically calculated.
      </div>
      <button style={saveBtnStyle} onClick={handleSave} disabled={saving || !unitPrice || selectedDurations.length === 0}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {saveMsg && <div style={{ color: '#888', fontSize: 15, marginTop: 10, textAlign: 'center' }}>{saveMsg}</div>}
    </div>
  );
}

export default PricingSection; 