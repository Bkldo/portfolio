import React, { useState } from 'react';
import { login } from '../utils/api';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
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
            <label className="form-label">อีเมลผู้ใช้งาน (Email)</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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

        <div style={{ marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
          <p>บัญชีทดสอบในระบบจำลอง (LocalStorage):</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
              <strong>CEO:</strong> ceo@company.com / password123
            </span>
            <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
              <strong>พนักงาน:</strong> somchai@company.com / password123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
