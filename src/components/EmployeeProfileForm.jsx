import React, { useState } from 'react';
import { addEmployee } from '../utils/api';
import { CONFIG } from '../config';
import { UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EmployeeProfileForm({ onSuccess }) {
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState(CONFIG.DEPARTMENTS[1]); // ค่าตั้งต้นคือไอที
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('123456'); // รหัสตั้งต้นใช้งานง่าย
  const [role, setRole] = useState('employee');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!empId.trim() || !name.trim() || !position.trim() || !citizenId.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (เลขที่ตำแหน่ง, ชื่อ, ตำแหน่ง, เลขบัตรประชาชน)');
      return;
    }

    if (citizenId.trim().length !== 13) {
      setError('เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก');
      return;
    }

    setLoading(true);

    const employeePayload = {
      id: empId.trim().toUpperCase(),
      name: name.trim(),
      position: position.trim(),
      department,
      citizen_id: citizenId.trim(),
      password: password.trim(),
      role,
      image_url: imageUrl.trim() || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150` // รูปคนดีฟอลต์
    };

    try {
      await addEmployee(employeePayload);
      setSuccessMsg(`ลงทะเบียนบุคลากร ${name} สำเร็จแล้ว!`);
      // ล้างข้อมูลฟอร์ม
      setEmpId('');
      setName('');
      setPosition('');
      setCitizenId('');
      setPassword('123456');
      setImageUrl('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">👤 ลงทะเบียนและจัดการบัญชีบุคลากรใหม่</h3>
      
      {error && (
        <div style={{
          backgroundColor: '#fff1f2',
          color: '#e11d48',
          border: '1px solid #ffe4e6',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          color: '#10b981',
          border: '1px solid #a7f3d0',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">เลขที่ตำแหน่ง *</label>
            <input
              type="text"
              className="form-input"
              placeholder="ระบุเลขที่ตำแหน่ง..."
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อ-นามสกุล *</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น สมนึก มีมานะ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">ตำแหน่งงาน *</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น UI/UX Designer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ฝ่าย / สังกัด *</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              {CONFIG.DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">เลขบัตรประจำตัวประชาชน (สำหรับล็อกอิน) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น 1234567890123"
              value={citizenId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                setCitizenId(val);
              }}
              maxLength={13}
              inputMode="numeric"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่านเบื้องต้น *</label>
            <input
              type="text"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">ระดับสิทธิ์การใช้งาน (Role)</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employee">พนักงานทั่วไป (บันทึกและดูผลงานตนเอง)</option>
              <option value="head">หัวหน้าฝ่าย (ดูสถิติและผลงานเจ้าหน้าที่ในฝ่ายของตน)</option>
              <option value="executive">ผู้บริหาร (ดูสถิติภาพรวมและพนักงานทุกคน)</option>
              <option value="admin">ผู้ดูแลระบบ (จัดการเพิ่มรายชื่อบุคคล)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ลิงก์รูปโปรไฟล์ (URL รูปภาพ)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนบุคลากร'}
          </button>
        </div>
      </form>
    </div>
  );
}
