import React, { useState } from 'react';
import {
  Users, BarChart3, TrendingUp, Search, FolderKanban,
  FileText, CheckCircle2, Clock, AlertTriangle, Link as LinkIcon,
  Share2, Mail, Calendar, Building2
} from 'lucide-react';
import { CONFIG, formatDept, isSameDept, calcMonthComparison } from '../config';
import PerformanceForm from './PerformanceForm';
import { deletePerformance } from '../utils/api';

export default function DepartmentHeadDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, individual, my_perf
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPerf, setEditingPerf] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [filterYear, setFilterYear] = useState('ทั้งหมด');
  const [filterMonth, setFilterMonth] = useState('ทั้งหมด');

  // กรองรายชื่อเจ้าหน้าที่ทั้งหมดในฝ่ายของหัวหน้าฝ่าย
  const deptEmployees = employeesData.filter(e => isSameDept(e.department, currentUser.department));
  const deptEmpIds = deptEmployees.map(e => e.id);
  
  // กรองผลงานทั้งหมดของเจ้าหน้าที่ในฝ่าย
  const deptPerformance = (performanceData || []).filter(p => deptEmpIds.includes(p.employee_id));

  // ตั้งค่าดีฟอลต์สำหรับแท็บตรวจสอบรายบุคคล
  const [selectedEmpId, setSelectedEmpId] = useState(() => {
    return deptEmployees.length > 0 ? deptEmployees[0].id : currentUser.id;
  });

  // คำนวณสถิติของฝ่าย
  const deptDone = deptPerformance.filter(p => p.status === 'Done').length;
  const deptProgress = deptPerformance.filter(p => p.status === 'In Progress').length;
  const deptDelayed = deptPerformance.filter(p => p.status === 'Delayed').length;

  const deptAvgRate = deptPerformance.length > 0
    ? Math.round(deptPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / deptPerformance.length)
    : 0;
  const deptComparison = calcMonthComparison(deptPerformance);

  const currentMonth = CONFIG.MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const submittedThisMonth = new Set(
    deptPerformance
      .filter(p => String(p.month || '').trim() === currentMonth && String(p.year || '').trim() === currentYear)
      .map(p => p.employee_id)
  ).size;

  // ข้อมูลเจ้าหน้าที่ที่เลือกในแท็บตรวจสอบรายบุคคล
  const selectedEmployee = deptEmployees.find(e => e.id === selectedEmpId) || currentUser;
  const selectedEmpPerformance = (performanceData || []).filter(p => {
    if (p.employee_id !== selectedEmployee.id) return false;
    if (filterYear !== 'ทั้งหมด' && String(p.year || '').trim() !== String(filterYear)) return false;
    if (filterMonth !== 'ทั้งหมด' && String(p.month || '').trim() !== String(filterMonth)) return false;
    return true;
  });
  
  const empDone = selectedEmpPerformance.filter(p => p.status === 'Done').length;
  const empProgress = selectedEmpPerformance.filter(p => p.status === 'In Progress').length;
  const empDelayed = selectedEmpPerformance.filter(p => p.status === 'Delayed').length;
  const empAvgRate = selectedEmpPerformance.length > 0
    ? Math.round(selectedEmpPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / selectedEmpPerformance.length)
    : 0;
  const empComparison = calcMonthComparison(selectedEmpPerformance);

  // ข้อมูลผลงานของตัวหัวหน้าฝ่ายเอง (สำหรับแท็บบันทึกผลงานตนเอง)
  const myPerformance = (performanceData || []).filter(p => p.employee_id === currentUser.id);

  // ฟังก์ชันลบผลงานของตนเอง
  const handleDeleteMyPerf = async (id) => {
    if (window.confirm('คุณต้องการลบรายงานผลงานนี้ใช่หรือไม่?')) {
      setDeleteError('');
      try {
        await deletePerformance(id);
        setSuccessToast('ลบผลงานเรียบร้อยแล้ว');
        setTimeout(() => setSuccessToast(''), 3000);
        onRefresh();
      } catch (err) {
        setDeleteError(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // รายชื่อเจ้าหน้าที่ที่ผ่านการค้นหา
  const filteredDeptEmployees = deptEmployees.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) ||
           e.position.toLowerCase().includes(q) ||
           e.id.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* ส่วนหัวแสดงโปรไฟล์หัวหน้าฝ่าย */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={currentUser.image_url}
            alt={currentUser.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-progress" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
                👨‍💼 หัวหน้า{formatDept(currentUser.department)}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>ยินดีต้อนรับ คุณ{currentUser.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ตำแหน่ง {currentUser.position} • {formatDept(currentUser.department)} • รหัสพนักงาน {currentUser.id}
            </p>
          </div>
        </div>
      </div>

      {/* เมนูนำทาง แท็บเลือกมุมมอง */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <BarChart3 size={18} />
          <span>📊 สถิติและภาพรวมในฝ่าย</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={18} />
          <span>👤 ตรวจสอบเจ้าหน้าที่ในฝ่าย</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'my_perf' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_perf')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText size={18} />
          <span>📝 บันทึกผลงานของตนเอง</span>
        </button>
      </div>

      {/* ==================== แท็บที่ 1: สถิติและภาพรวมในฝ่าย ==================== */}
      {activeTab === 'overview' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card-left-border accent-blue">
              <div className="stat-card-header">
                <span className="stat-card-title">เจ้าหน้าที่ในฝ่าย</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}><Users size={18} /></div>
              </div>
              <div className="stat-card-value">{deptEmployees.length}</div>
              <div className="stat-card-subtitle"><span>บุคลากรในสังกัด</span><span>คน</span></div>
            </div>

            <div className="stat-card-left-border accent-purple">
              <div className="stat-card-header">
                <span className="stat-card-title">ผลงานที่รายงานรวม</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}><FolderKanban size={18} /></div>
              </div>
              <div className="stat-card-value">{deptPerformance.length}</div>
              <div className="stat-card-subtitle"><span>รายการสะสมในฝ่าย</span><span>ชิ้นงาน</span></div>
            </div>

            <div className="stat-card-left-border accent-green">
              <div className="stat-card-header">
                <span className="stat-card-title">ความคืบหน้าเฉลี่ย</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={18} /></div>
              </div>
              <div className="stat-card-value">{deptAvgRate}%</div>
              <div className="stat-card-subtitle">
                <span>ภาพรวมความสำเร็จ</span>
                <span className={`badge ${deptComparison.badgeClass}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{deptComparison.text}</span>
              </div>
              <div className="completion-progress-bar" style={{ width: '100%', height: '6px', marginTop: '10px' }}>
                <div className="progress-fill" style={{ width: `${deptAvgRate}%`, backgroundColor: '#10b981' }}></div>
              </div>
            </div>

            <div className="stat-card-left-border accent-orange">
              <div className="stat-card-header">
                <span className="stat-card-title">ส่งงานเดือน{currentMonth}</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><TrendingUp size={18} /></div>
              </div>
              <div className="stat-card-value">{submittedThisMonth}</div>
              <div className="stat-card-subtitle"><span>จากทั้งหมด {deptEmployees.length} คน</span><span>{Math.round((submittedThisMonth / (deptEmployees.length || 1)) * 100)}%</span></div>
            </div>
          </div>

          <div className="stats-grid" style={{ marginTop: '20px', marginBottom: '24px' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--status-done)' }}>
              <div className="stat-label">✅ ผลงานเสร็จสิ้น</div>
              <div className="stat-value" style={{ color: 'var(--status-done)' }}>{deptDone} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--status-progress)' }}>
              <div className="stat-label">⏳ กำลังดำเนินการ</div>
              <div className="stat-value" style={{ color: 'var(--status-progress)' }}>{deptProgress} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--status-delayed)' }}>
              <div className="stat-label">⚠️ ล่าช้ากว่าแผน</div>
              <div className="stat-value" style={{ color: 'var(--status-delayed)' }}>{deptDelayed} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
            </div>
          </div>

          {/* ตารางแสดงรายชื่อเจ้าหน้าที่และความคืบหน้าของแต่ละคน */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 className="card-title">👥 สถานะผลงานของเจ้าหน้าที่ใน{formatDept(currentUser.department)}</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>เจ้าหน้าที่</th>
                    <th>ตำแหน่ง</th>
                    <th>ผลงานทั้งหมด</th>
                    <th>ความสำเร็จเฉลี่ย</th>
                    <th>สถานะงาน</th>
                    <th style={{ textAlign: 'right' }}>ตรวจสอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {deptEmployees.map(emp => {
                    const empPerfs = deptPerformance.filter(p => p.employee_id === emp.id);
                    const eDone = empPerfs.filter(p => p.status === 'Done').length;
                    const eProg = empPerfs.filter(p => p.status === 'In Progress').length;
                    const eDel = empPerfs.filter(p => p.status === 'Delayed').length;
                    const eAvg = empPerfs.length > 0
                      ? Math.round(empPerfs.reduce((a, c) => a + parseInt(c.completion_rate || 0, 10), 0) / empPerfs.length)
                      : 0;

                    return (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={emp.image_url}
                              alt={emp.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{emp.position}</td>
                        <td>{empPerfs.length} ชิ้นงาน</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="completion-progress-bar" style={{ width: '80px' }}>
                              <span className="progress-fill" style={{ width: `${eAvg}%`, backgroundColor: '#10b981' }}></span>
                            </span>
                            <strong>{eAvg}%</strong>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-done" style={{ marginRight: '6px' }}>{eDone} เสร็จ</span>
                          <span className="badge badge-progress" style={{ marginRight: '6px' }}>{eProg} ทำอยู่</span>
                          <span className="badge badge-delayed">{eDel} ล่าช้า</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setSelectedEmpId(emp.id);
                              setActiveTab('individual');
                            }}
                          >
                            <span>ดูผลงาน</span>
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* รายการผลงานทั้งหมดในฝ่าย */}
          <div className="card">
            <h3 className="card-title">📁 รายงานผลงานทั้งหมดของเจ้าหน้าที่ใน{formatDept(currentUser.department)} ({deptPerformance.length} รายการ)</h3>
            <div className="perf-list">
              {deptPerformance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  ยังไม่มีรายงานผลงานในฝ่ายนี้
                </div>
              ) : (
                deptPerformance.map(perf => {
                  const emp = employeesData.find(e => e.id === perf.employee_id) || { name: 'ไม่ทราบชื่อ', image_url: '' };
                  return (
                    <div key={perf.id} className="perf-item">
                      <div className="perf-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={emp.image_url}
                            alt={emp.name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
                          />
                          <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--primary)' }}>{emp.name}</span>
                          <span className="perf-time-badge">
                            {perf.month} {perf.year}
                          </span>
                        </div>
                        <span className={`badge ${
                          perf.status === 'Done' ? 'badge-done' : perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                        }`}>
                          {perf.status === 'Done' && <CheckCircle2 size={12} style={{ marginRight: '4px' }} />}
                          {perf.status === 'In Progress' && <Clock size={12} style={{ marginRight: '4px' }} />}
                          {perf.status === 'Delayed' && <AlertTriangle size={12} style={{ marginRight: '4px' }} />}
                          {perf.status === 'Done' ? 'เสร็จสิ้น' : perf.status === 'In Progress' ? 'กำลังดำเนินการ' : 'ล่าช้า'}
                        </span>
                      </div>
                      
                      <div className="perf-title">{perf.title}</div>
                      <div className="perf-body">{perf.details}</div>
                      
                      <div className="perf-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ความสำเร็จ:</span>
                          <span className="completion-progress-bar">
                            <span
                              className="progress-fill"
                              style={{
                                width: `${perf.completion_rate}%`,
                                backgroundColor: perf.completion_rate == 100 ? '#10b981' : '#3b82f6'
                              }}
                            ></span>
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {perf.completion_rate}%
                          </span>
                        </div>

                        {perf.ref_link && (
                          <a
                            href={perf.ref_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                          >
                            <LinkIcon size={14} style={{ marginRight: '4px' }} />
                            เอกสารอ้างอิง
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== แท็บที่ 2: ตรวจสอบเจ้าหน้าที่ในฝ่าย ==================== */}
      {activeTab === 'individual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* ค้นหาและเลือกเจ้าหน้าที่ */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>รายชื่อพนักงานในฝ่าย</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>สังกัด{formatDept(currentUser.department)} ({filteredDeptEmployees.length} คน)</p>
            </div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input search-pill-input"
                placeholder="ค้นหาชื่อ, ตำแหน่ง หรือรหัส..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '500px', overflowY: 'auto' }}>
              {filteredDeptEmployees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`emp-sidebar-item ${selectedEmpId === emp.id ? 'active' : 'inactive'}`}
                >
                  <img src={emp.image_url} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }} />
                  <div style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '11px', opacity: selectedEmpId === emp.id ? 0.9 : 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.position || formatDept(emp.department)}
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ opacity: selectedEmpId === emp.id ? 1 : 0.3 }} />
                </div>
              ))}
            </div>
          </div>

          {/* รายละเอียดโปรไฟล์และผลงานของเจ้าหน้าที่ที่เลือก */}
          {selectedEmployee && (
            <div>
              {/* ข้อมูลโปรไฟล์พนักงาน (Performance Insights Style) */}
              <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                    <div className="profile-avatar-wrapper">
                      <img
                        src={selectedEmployee.image_url}
                        alt={selectedEmployee.name}
                        className="profile-avatar-ring"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
                      />
                      <div className="profile-avatar-badge">★</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{selectedEmployee.name}</h2>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: '600', padding: '3px 12px', borderRadius: '20px' }}>
                          {selectedEmployee.position || formatDept(selectedEmployee.department)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} style={{ color: '#94a3b8' }} />
                          {formatDept(selectedEmployee.department)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="แก้ไขข้อมูล">
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="แชร์โปรไฟล์">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* สถิติผลงานส่วนตัวของเจ้าหน้าที่คนนั้น (4 Left-Bordered Cards) */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card-left-border accent-blue">
                  <div className="stat-card-header">
                    <span className="stat-card-title">งานทั้งหมด</span>
                    <div className="stat-card-icon-sm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><FileText size={18} /></div>
                  </div>
                  <div className="stat-card-value">{selectedEmpPerformance.length}</div>
                  <div className="stat-card-subtitle"><span>รายการสะสม</span><span>งาน</span></div>
                </div>

                <div className="stat-card-left-border accent-green">
                  <div className="stat-card-header">
                    <span className="stat-card-title">เสร็จสมบูรณ์</span>
                    <div className="stat-card-icon-sm" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="stat-card-value">{empDone}</div>
                  <div className="stat-card-subtitle"><span>ความสำเร็จ</span><span>{empAvgRate}%</span></div>
                </div>

                <div className="stat-card-left-border accent-purple">
                  <div className="stat-card-header">
                    <span className="stat-card-title">กำลังดำเนินการ</span>
                    <div className="stat-card-icon-sm" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}><Clock size={18} /></div>
                  </div>
                  <div className="stat-card-value">{empProgress}</div>
                  <div className="stat-card-subtitle"><span>รอดำเนินการต่อ</span><span>งาน</span></div>
                </div>

                <div className="stat-card-left-border accent-orange">
                  <div className="stat-card-header">
                    <span className="stat-card-title">ความก้าวหน้าเฉลี่ย</span>
                    <div className="stat-card-icon-sm" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><TrendingUp size={18} /></div>
                  </div>
                  <div className="stat-card-value">{empAvgRate}%</div>
                  <div className="stat-card-subtitle">
                    <span>ภาพรวม</span>
                    <span className={`badge ${empComparison.badgeClass}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{empComparison.text}</span>
                  </div>
                  <div className="completion-progress-bar" style={{ width: '100%', height: '6px', marginTop: '10px' }}>
                    <div className="progress-fill" style={{ width: `${empAvgRate}%`, backgroundColor: '#f97316' }}></div>
                  </div>
                </div>
              </div>

              {/* ประวัติผลงานรายเดือนของเจ้าหน้าที่ (Timeline View) */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Clock size={18} style={{ color: '#6366f1' }} />
                    <span>ประวัติการทำงาน (Performance History)</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      className="form-select"
                      style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="ทั้งหมด">ทุกปี</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                    <select
                      className="form-select"
                      style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
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

                <div className="timeline-container">
                  {selectedEmpPerformance.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      เจ้าหน้าที่ท่านนี้ยังไม่มีประวัติการบันทึกผลงานในระบบ
                    </div>
                  ) : (
                    selectedEmpPerformance.map(perf => (
                      <div key={perf.id} className="timeline-item">
                        <div className={`timeline-node ${perf.status === 'Done' ? '' : perf.status === 'In Progress' ? 'progress' : 'delayed'}`}></div>
                        <div className="perf-header" style={{ marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{perf.title}</h4>
                            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px', marginBottom: 0 }}>{perf.details}</p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                            <span className={`badge ${
                              perf.status === 'Done' ? 'badge-done' :
                              perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                            }`} style={{ fontWeight: '600', padding: '4px 12px' }}>
                              {perf.status === 'Done' ? 'สำเร็จแล้ว' :
                               perf.status === 'In Progress' ? 'กำลังดำเนินการ' : 'ล่าช้า'}
                            </span>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                              {perf.month} {perf.year}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginRight: '16px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>ความคืบหน้า</span>
                            <div className="completion-progress-bar" style={{ flex: 1, maxWidth: '280px', height: '8px', margin: 0, backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${perf.completion_rate}%`,
                                  backgroundColor: perf.status === 'Done' ? '#10b981' : perf.status === 'In Progress' ? '#6366f1' : '#f59e0b',
                                  borderRadius: '4px'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{perf.completion_rate}%</span>
                          </div>

                          {perf.ref_link && (
                            <a
                              href={perf.ref_link}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#4f46e5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                            >
                              <LinkIcon size={14} />
                              ดูไฟล์อ้างอิง
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== แท็บที่ 3: บันทึกผลงานของตนเอง ==================== */}
      {activeTab === 'my_perf' && (
        <div>
          {successToast && (
            <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{successToast}</span>
            </div>
          )}

          {deleteError && (
            <div style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              {deleteError}
            </div>
          )}

          {/* ฟอร์มบันทึก / แก้ไขผลงานของหัวหน้าฝ่าย */}
          <div style={{ marginBottom: '24px' }}>
            <PerformanceForm
              currentUser={currentUser}
              editingData={editingPerf}
              onSuccess={(msg) => {
                setSuccessToast(msg || 'บันทึกข้อมูลเรียบร้อยแล้ว');
                setEditingPerf(null);
                setTimeout(() => setSuccessToast(''), 3000);
                onRefresh();
              }}
              onCancel={() => setEditingPerf(null)}
            />
          </div>

          {/* รายการผลงานทั้งหมดของหัวหน้าฝ่าย */}
          <div className="card">
            <h3 className="card-title">📋 ประวัติรายงานผลงานของฉัน ({myPerformance.length} รายการ)</h3>
            <div className="perf-list">
              {myPerformance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  คุณยังไม่ได้บันทึกผลงานใดๆ ในระบบ
                </div>
              ) : (
                myPerformance.map(perf => (
                  <div key={perf.id} className="perf-item">
                    <div className="perf-header">
                      <span className="perf-time-badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>
                        {perf.month} {perf.year}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${
                          perf.status === 'Done' ? 'badge-done' : perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                        }`}>
                          {perf.status === 'Done' ? 'เสร็จสิ้น' : perf.status === 'In Progress' ? 'กำลังดำเนินการ' : 'ล่าช้า'}
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => {
                            setEditingPerf(perf);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Edit size={14} />
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px', color: '#e11d48', borderColor: '#ffe4e6', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeleteMyPerf(perf.id)}
                        >
                          <Trash2 size={14} />
                          ลบ
                        </button>
                      </div>
                    </div>
                    <div className="perf-title" style={{ marginTop: '8px' }}>{perf.title}</div>
                    <div className="perf-body">{perf.details}</div>
                    <div className="perf-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ความคืบหน้า:</span>
                        <span className="completion-progress-bar">
                          <span className="progress-fill" style={{ width: `${perf.completion_rate}%`, backgroundColor: perf.completion_rate == 100 ? '#10b981' : '#3b82f6' }}></span>
                        </span>
                        <strong style={{ fontSize: '13px' }}>{perf.completion_rate}%</strong>
                      </div>
                      {perf.ref_link && (
                        <a href={perf.ref_link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}>
                          <LinkIcon size={14} style={{ marginRight: '4px' }} />
                          เอกสารอ้างอิง
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
