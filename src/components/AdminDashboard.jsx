import React, { useState } from 'react';
import EmployeeProfileForm from './EmployeeProfileForm';
import {
  Users, UserPlus, Search, ShieldCheck, LogOut, CheckCircle2,
  Briefcase, Mail, Building2, UserCheck
} from 'lucide-react';
import { CONFIG } from '../config';

export default function AdminDashboard({ currentUser, employeesData, onRefresh, onLogout }) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');
  const [successToast, setSuccessToast] = useState('');

  // สถิติบุคลากรในระบบ
  const totalUsers = employeesData.length;
  const adminCount = employeesData.filter(e => e.role === 'admin').length;
  const execCount = employeesData.filter(e => e.role === 'executive').length;
  const empCount = employeesData.filter(e => e.role !== 'admin' && e.role !== 'executive').length;

  // กรองรายชื่อบุคลากร
  const filteredEmployees = employeesData.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === 'ทั้งหมด' || e.department === selectedDept;
    return matchSearch && matchDept;
  });

  const handleRegisterSuccess = (msg) => {
    setShowRegisterModal(false);
    setSuccessToast(msg || 'ลงทะเบียนพนักงานสำเร็จแล้ว');
    onRefresh();
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div>
      {/* Toast แจ้งเตือนความสำเร็จ */}
      {successToast && (
        <div className="alert-toast">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* แถบหัวข้อผู้ดูแลระบบ */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6' }} />
            แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            จัดการรายชื่อบุคลากร ลงทะเบียนเพิ่มบุคคลใหม่ในระบบ และกำหนดสิทธิ์การใช้งาน
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#8b5cf6' }}>
            <UserPlus size={16} />
            ลงทะเบียนบุคคลใหม่
          </button>
          <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* สถิติสรุปภาพรวมบุคลากร */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="stat-label">👥 บุคลากรทั้งหมดในระบบ</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{totalUsers} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-label">💼 พนักงานทั่วไป (Employee)</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{empCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">🤵 ผู้บริหาร (Executive)</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{execCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">🛡️ ผู้ดูแลระบบ (Admin)</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{adminCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div>
        </div>
      </div>

      {/* การค้นหาและกรองฝ่าย */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="ค้นหาตามรหัส, ชื่อ, ตำแหน่ง หรืออีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>กรองตามฝ่าย:</span>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ทั้งหมด">ทั้งหมดทุกฝ่าย</option>
              {CONFIG.DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ตารางรายชื่อบุคลากรทั้งหมด */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
            รายชื่อบุคลากรในระบบ ({filteredEmployees.length} คน)
          </h3>
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            ไม่พบบุคลากรที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>บุคลากร</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>รหัส (ID)</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>ตำแหน่ง</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>สังกัด / ฝ่าย</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>อีเมลล็อกอิน</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>ระดับสิทธิ์ (Role)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={emp.image_url}
                          alt={emp.name}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                          }}
                        />
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{emp.id}</td>
                    <td style={{ padding: '12px', color: 'var(--text-main)' }}>{emp.position}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {emp.department}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{emp.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: emp.role === 'admin' ? '#f3e8ff' : emp.role === 'executive' ? '#fef3c7' : '#e0f2fe',
                        color: emp.role === 'admin' ? '#7e22ce' : emp.role === 'executive' ? '#b45309' : '#0369a1'
                      }}>
                        {emp.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : emp.role === 'executive' ? '🤵 ผู้บริหาร' : '👤 พนักงานทั่วไป'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* โมดัลสำหรับลงทะเบียนบุคคลใหม่ */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: 0, color: 'var(--text-main)' }}>
                <UserPlus size={20} style={{ color: '#8b5cf6' }} />
                ลงทะเบียนบุคลากรใหม่เข้าสู่ระบบ
              </h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }}
                onClick={() => setShowRegisterModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ padding: '0 4px' }}>
              <EmployeeProfileForm onSuccess={handleRegisterSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
