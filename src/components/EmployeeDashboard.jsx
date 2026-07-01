import React, { useState } from 'react';
import PerformanceForm from './PerformanceForm';
import { Award, Briefcase, FileText, CheckCircle2, Clock, AlertTriangle, Link as LinkIcon, Edit, LogOut } from 'lucide-react';
import { CONFIG } from '../config';

export default function EmployeeDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [editingPerf, setEditingPerf] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterMonth, setFilterMonth] = useState('ทั้งหมด');

  // กรองผลงานเฉพาะของตัวเองตามปีและเดือนที่เลือก
  const myPerformance = performanceData.filter(perf => {
    const isMe = perf.employee_id === currentUser.id;
    const matchYear = perf.year === filterYear;
    const matchMonth = filterMonth === 'ทั้งหมด' || perf.month === filterMonth;
    return isMe && matchYear && matchMonth;
  });

  // คำนวณสถิติส่วนบุคคล
  const totalSubmissions = myPerformance.length;
  const doneSubmissions = myPerformance.filter(p => p.status === 'Done').length;
  const progressSubmissions = myPerformance.filter(p => p.status === 'In Progress').length;
  const delayedSubmissions = myPerformance.filter(p => p.status === 'Delayed').length;
  
  const avgCompletionRate = totalSubmissions > 0
    ? Math.round(myPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / totalSubmissions)
    : 0;

  const handleActionSuccess = (msg) => {
    setSuccessToast(msg);
    setEditingPerf(null);
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

      {/* ส่วนต้อนรับและโปรไฟล์ */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={currentUser.image_url}
            alt={currentUser.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
            }}
          />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ยินดีต้อนรับคุณ {currentUser.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ตำแหน่ง {currentUser.position} • ฝ่าย{currentUser.department} • รหัสพนักงาน {currentUser.id}
            </p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <LogOut size={16} />
          ออกจากระบบ
        </button>
      </div>

      {/* บล็อกสถิติรายบุคคล */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>ผลงานที่รายงานทั้งหมด</h3>
            <p>{totalSubmissions} งาน</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>ความคืบหน้าเฉลี่ย</h3>
            <p>{avgCompletionRate}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>งานกำลังดำเนินการ</h3>
            <p>{progressSubmissions} งาน</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-delayed-bg)', color: 'var(--status-delayed)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>งานล่าช้ากว่ากำหนด</h3>
            <p>{delayedSubmissions} งาน</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* คอลัมน์ซ้าย: รายงานผลงานย้อนหลัง */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title" style={{ margin: 0, paddingBottom: '16px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} />
                <span>ประวัติรายงานผลงานของฉัน</span>
              </span>
              
              {/* คอนโทรลกรองข้อมูล */}
              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <select
                  className="form-select"
                  style={{ width: '100px', padding: '6px 12px' }}
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <select
                  className="form-select"
                  style={{ width: '130px', padding: '6px 12px' }}
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="ทั้งหมด">ทุกเดือน</option>
                  {CONFIG.MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px' }} className="perf-list">
              {myPerformance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p>ไม่พบประวัติผลงานในเดือนที่เลือก</p>
                  <p style={{ fontSize: '13px' }}>คุณสามารถเพิ่มข้อมูลใหม่ได้ที่ฟอร์มด้านขวามือ</p>
                </div>
              ) : (
                myPerformance.map(perf => (
                  <div key={perf.id} className="perf-item">
                    <div className="perf-header">
                      <div>
                        <span className="perf-time-badge">{perf.month} {perf.year}</span>
                        <h4 className="perf-title" style={{ marginTop: '8px' }}>{perf.title}</h4>
                      </div>
                      
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
                        onClick={() => setEditingPerf(perf)}
                      >
                        <Edit size={12} />
                        แก้ไข
                      </button>
                    </div>

                    <p className="perf-body">{perf.details}</p>

                    <div className="perf-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <span className="completion-progress-bar">
                            <span className="progress-fill" style={{ width: `${perf.completion_rate}%` }}></span>
                          </span>
                          <span style={{ fontWeight: '600' }}>{perf.completion_rate}%</span>
                        </div>
                        
                        <span className={`badge ${
                          perf.status === 'Done' ? 'badge-done' :
                          perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                        }`}>
                          {perf.status === 'Done' ? 'Done' :
                           perf.status === 'In Progress' ? 'In Progress' : 'Delayed'}
                        </span>
                      </div>

                      {perf.ref_link && (
                        <a
                          href={perf.ref_link}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}
                        >
                          <LinkIcon size={14} />
                          ลิงก์อ้างอิงงาน
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: ฟอร์มเพิ่มข้อมูลใหม่ */}
        <div>
          <PerformanceForm
            currentUser={currentUser}
            onSuccess={handleActionSuccess}
          />
        </div>
      </div>

      {/* โมดัลสำหรับแก้ไขข้อมูล (Modal) */}
      {editingPerf && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Edit size={20} />
                แก้ไขรายงานผลงานประจำเดือน
              </h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }}
                onClick={() => setEditingPerf(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <PerformanceForm
                currentUser={currentUser}
                editingData={editingPerf}
                onSuccess={handleActionSuccess}
                onCancel={() => setEditingPerf(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
