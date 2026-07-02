import React, { useState } from 'react';
import {
  Users, BarChart3, TrendingUp, Search, FolderKanban,
  FileText, CheckCircle2, Clock, AlertTriangle, Link as LinkIcon,
  LogOut, ArrowRight, KeyRound, Edit, Trash2, Award, Briefcase, Plus
} from 'lucide-react';
import { CONFIG, formatDept, isSameDept } from '../config';
import ChangePasswordModal from './ChangePasswordModal';
import PerformanceForm from './PerformanceForm';
import { deletePerformance } from '../utils/api';

export default function DepartmentHeadDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, individual, my_perf
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingPerf, setEditingPerf] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [deleteError, setDeleteError] = useState('');

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

  const currentMonth = CONFIG.MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const submittedThisMonth = new Set(
    deptPerformance
      .filter(p => String(p.month || '').trim() === currentMonth && String(p.year || '').trim() === currentYear)
      .map(p => p.employee_id)
  ).size;

  // ข้อมูลเจ้าหน้าที่ที่เลือกในแท็บตรวจสอบรายบุคคล
  const selectedEmployee = deptEmployees.find(e => e.id === selectedEmpId) || currentUser;
  const selectedEmpPerformance = (performanceData || []).filter(p => p.employee_id === selectedEmployee.id);
  
  const empDone = selectedEmpPerformance.filter(p => p.status === 'Done').length;
  const empProgress = selectedEmpPerformance.filter(p => p.status === 'In Progress').length;
  const empDelayed = selectedEmpPerformance.filter(p => p.status === 'Delayed').length;
  const empAvgRate = selectedEmpPerformance.length > 0
    ? Math.round(selectedEmpPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / selectedEmpPerformance.length)
    : 0;

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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <KeyRound size={16} style={{ color: 'var(--primary)' }} />
            เปลี่ยนรหัสผ่าน
          </button>
          <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <LogOut size={16} />
            ออกจากระบบ
          </button>
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
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>เจ้าหน้าที่ใน{formatDept(currentUser.department)}</h3>
                <p>{deptEmployees.length} คน</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <FolderKanban size={24} />
              </div>
              <div className="stat-info">
                <h3>ผลงานที่รายงานรวม</h3>
                <p>{deptPerformance.length} ชิ้นงาน</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress)' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h3>ความคืบหน้าเฉลี่ยในฝ่าย</h3>
                <p>{deptAvgRate}%</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <h3>ส่งผลงานเดือน{currentMonth}</h3>
                <p>{submittedThisMonth} / {deptEmployees.length} คน</p>
              </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* ค้นหาและเลือกเจ้าหน้าที่ */}
          <div className="card">
            <h3 className="card-title">🔍 เลือกเจ้าหน้าที่ใน{formatDept(currentUser.department)}ที่ต้องการตรวจสอบ</h3>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="ค้นหาชื่อ, ตำแหน่ง หรือรหัสพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', maxHeight: '280px', overflowY: 'auto', padding: '4px' }}>
              {filteredDeptEmployees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedEmpId === emp.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: selectedEmpId === emp.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={emp.image_url} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: selectedEmpId === emp.id ? 'var(--primary-hover)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.id} • {emp.position}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* รายละเอียดโปรไฟล์และผลงานของเจ้าหน้าที่ที่เลือก */}
          {selectedEmployee && (
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="employee-detail-card">
                  <img
                    src={selectedEmployee.image_url}
                    alt={selectedEmployee.name}
                    className="employee-large-avatar"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }}
                  />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <span className="badge badge-progress" style={{ marginBottom: '10px' }}>
                      {selectedEmployee.role === 'head' ? '👨‍💼 หัวหน้าฝ่าย' : '👤 เจ้าหน้าที่ในฝ่าย'}
                    </span>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{selectedEmployee.name}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>ตำแหน่ง: {selectedEmployee.position}</p>
                    
                    <div className="employee-meta-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>รหัสพนักงาน</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{selectedEmployee.id}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ฝ่าย / แผนก</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>{formatDept(selectedEmployee.department)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เลขบัตรประชาชน</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                          {selectedEmployee.citizen_id ? `${selectedEmployee.citizen_id.slice(0, 4)}XXXXX${selectedEmployee.citizen_id.slice(-4)}` : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* สถิติผลงานส่วนตัวของเจ้าหน้าที่คนนั้น */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-label">📁 ส่งผลงานแล้ว</div>
                  <div className="stat-value">{selectedEmpPerformance.length} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">📈 ความสำเร็จเฉลี่ย</div>
                  <div className="stat-value" style={{ color: '#10b981' }}>{empAvgRate}%</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">✅ เสร็จสิ้น</div>
                  <div className="stat-value" style={{ color: 'var(--status-done)' }}>{empDone} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">⏳ กำลังทำ / ล่าช้า</div>
                  <div className="stat-value" style={{ color: 'var(--status-progress)' }}>{empProgress + empDelayed} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>ชิ้นงาน</span></div>
                </div>
              </div>

              {/* ประวัติผลงานรายเดือนของเจ้าหน้าที่ */}
              <div className="card">
                <h3 className="card-title">📅 ประวัติรายงานผลงานของ {selectedEmployee.name} ({selectedEmpPerformance.length} รายการ)</h3>
                <div className="perf-list">
                  {selectedEmpPerformance.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      เจ้าหน้าที่ท่านนี้ยังไม่มีประวัติการบันทึกผลงานในระบบ
                    </div>
                  ) : (
                    selectedEmpPerformance.map(perf => (
                      <div key={perf.id} className="perf-item">
                        <div className="perf-header">
                          <span className="perf-time-badge" style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '700', padding: '4px 10px', borderRadius: '6px' }}>
                            {perf.month} {perf.year}
                          </span>
                          <span className={`badge ${
                            perf.status === 'Done' ? 'badge-done' : perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                          }`}>
                            {perf.status === 'Done' ? 'เสร็จสิ้น' : perf.status === 'In Progress' ? 'กำลังดำเนินการ' : 'ล่าช้า'}
                          </span>
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

      {/* โมดัลเปลี่ยนรหัสผ่าน */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        currentUser={currentUser}
        onSuccess={() => {}}
      />
    </div>
  );
}
