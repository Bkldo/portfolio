import React, { useState } from 'react';
import { changePassword } from '../utils/api';
import { KeyRound, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose, currentUser, onSuccess }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 4) {
      setError('รหัสผ่านใหม่ควรมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(currentUser.id, oldPassword, newPassword);
      setSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'รหัสผ่านเดิมไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <KeyRound size={20} style={{ color: 'var(--primary)' }} />
            เปลี่ยนรหัสผ่านส่วนบุคคล
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)', padding: 0 }}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px', color: '#10b981', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '13px' }}>รหัสผ่านปัจจุบัน</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="ระบุรหัสผ่านเดิม..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '13px' }}>รหัสผ่านใหม่</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="ระบุรหัสผ่านใหม่..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '13px' }}>ยืนยันรหัสผ่านใหม่</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading || !!success}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !!success}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
