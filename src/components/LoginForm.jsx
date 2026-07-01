import React, { useState } from 'react';
import { login } from '../utils/api';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function LoginForm({ onLoginSuccess }) {
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citizenId || !password) {
      setError('กรุณากรอกเลขบัตรประจำตัวประชาชนและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(citizenId, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon">
          <LogIn size={32} />
        </div>
        <div className="login-title">
          <h2>เข้าสู่ระบบ Portfolio</h2>
          <p>บันทึกผลงานรายเดือนและรายงานผลสำหรับผู้บริหาร</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            border: '1px solid #ffe4e6',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">เลขบัตรประจำตัวประชาชน</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น 1234567890123"
              value={citizenId}
              onChange={(e) => {
                // อนุญาตเฉพาะตัวเลขและจำกัดความยาว 13 หลัก
                const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                setCitizenId(val);
              }}
              disabled={loading}
              maxLength={13}
              inputMode="numeric"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน (Passcode)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
