import React, { useState } from 'react';
import {
  Users, BarChart3, TrendingUp, ShieldAlert,
  Search, FolderKanban, FileText, CheckCircle2,
  Clock, AlertTriangle, Link as LinkIcon, LogOut, ArrowRight, KeyRound
} from 'lucide-react';
import { CONFIG, formatDept, isSameDept } from '../config';
import ChangePasswordModal from './ChangePasswordModal';

export default function ExecutiveDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [activeSubTab, setActiveSubTab] = useState('overall'); // overall, department, individual
  const [selectedDept, setSelectedDept] = useState(CONFIG.DEPARTMENTS[1]); // ไอที เป็นดีฟอลต์
  const [selectedEmpId, setSelectedEmpId] = useState(employeesData[1]?.id || ''); // พนักงานคนแรกที่ไม่ใช่ CEO เป็นดีฟอลต์
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- การคำนวณและเตรียมข้อมูลสำหรับแต่ละส่วน ---

  // 1. ภาพรวม (Overall)
  const totalEmployees = employeesData.filter(e => e.role !== 'executive').length;
  const totalSubmissions = performanceData.length;
  
  const doneCount = performanceData.filter(p => p.status === 'Done').length;
  const progressCount = performanceData.filter(p => p.status === 'In Progress').length;
  const delayedCount = performanceData.filter(p => p.status === 'Delayed').length;

  const avgCompletionRate = totalSubmissions > 0
    ? Math.round(performanceData.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / totalSubmissions)
    : 0;

  // จำนวนพนักงานที่ส่งรายงานแล้วในเดือนปัจจุบัน (เช่น กรกฎาคม 2026)
  const currentMonth = CONFIG.MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const submittedThisMonth = new Set(
    performanceData
      .filter(p => p.month === currentMonth && p.year === currentYear)
      .map(p => p.employee_id)
  ).size;

  // กราฟ 1: เปรียบเทียบจำนวนการส่งผลงานแยกตามฝ่าย
  const deptStats = CONFIG.DEPARTMENTS.filter(d => d !== 'ผู้บริหาร').map(dept => {
    const deptEmployees = employeesData.filter(e => isSameDept(e.department, dept));
    const deptEmpIds = deptEmployees.map(e => e.id);
    const deptSubmissions = performanceData.filter(p => deptEmpIds.includes(p.employee_id));
    
    // คำนวณความสำเร็จเฉลี่ยของฝ่าย
    const deptAvg = deptSubmissions.length > 0
      ? Math.round(deptSubmissions.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / deptSubmissions.length)
      : 0;

    return {
      name: dept,
      submissions: deptSubmissions.length,
      avgRate: deptAvg,
      staffCount: deptEmployees.length
    };
  });

  // ค้นหาค่าสูงสุดของกราฟเพื่อสเกลรูปภาพ SVG
  const maxSubmissions = Math.max(...deptStats.map(d => d.submissions), 1);
  const maxAvgRate = Math.max(...deptStats.map(d => d.avgRate), 1);

  // 2. ข้อมูลฝ่าย (Department View)
  const deptEmployees = employeesData.filter(e => isSameDept(e.department, selectedDept));
  const deptEmpIds = deptEmployees.map(e => e.id);
  const deptPerformance = performanceData.filter(p => deptEmpIds.includes(p.employee_id));
  
  const deptDone = deptPerformance.filter(p => p.status === 'Done').length;
  const deptProgress = deptPerformance.filter(p => p.status === 'In Progress').length;
  const deptDelayed = deptPerformance.filter(p => p.status === 'Delayed').length;
  
  const deptAvgRate = deptPerformance.length > 0
    ? Math.round(deptPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / deptPerformance.length)
    : 0;

  // 3. ข้อมูลรายบุคคล (Individual View)
  const selectedEmployee = employeesData.find(e => e.id === selectedEmpId);
  const empPerformance = performanceData.filter(p => p.employee_id === selectedEmpId);
  
  const empDone = empPerformance.filter(p => p.status === 'Done').length;
  const empProgress = empPerformance.filter(p => p.status === 'In Progress').length;
  const empDelayed = empPerformance.filter(p => p.status === 'Delayed').length;
  const empAvgRate = empPerformance.length > 0
    ? Math.round(empPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / empPerformance.length)
    : 0;

  // กรองรายชื่อพนักงานสำหรับค้นหาในโหมดรายบุคคล
  const filteredEmployees = employeesData.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.id.toLowerCase().includes(searchQuery.toLowerCase());
    return e.role !== 'executive' && matchSearch;
  });

  return (
    <div>
      {/* แถบหัวข้อต้อนรับผู้บริหาร */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>🤵 แผงควบคุมผู้บริหาร (Executive Dashboard)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            ดูภาพรวมผลการดำเนินงานของพนักงานทุกฝ่ายในองค์กรย้อนหลังและข้อมูลการปฏิบัติงานจริง
          </p>
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

      {/* เมนูย่อยในการเข้าถึง Dashboard */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeSubTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overall')}
        >
          📊 ภาพรวมองค์กร
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'department' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('department')}
        >
          🏢 แยกตามฝ่ายงาน
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('individual')}
        >
          👤 ตรวจสอบรายบุคคล
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. หน้าจอภาพรวม (Overall Dashboard) */}
      {/* ======================================================== */}
      {activeSubTab === 'overall' && (
        <div>
          {/* แผงแสดงตัวเลขสำคัญ */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>พนักงานทั้งหมด</h3>
                <p>{totalEmployees} คน</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}>
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <h3>รายงานผลงานรวม</h3>
                <p>{totalSubmissions} ครั้ง</p>
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
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h3>ส่งผลงานในเดือนนี้ ({currentMonth})</h3>
                <p>{submittedThisMonth} / {totalEmployees} คน</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* กราฟจำนวนชิ้นงานแยกตามฝ่าย */}
            <div className="card">
              <h3 className="card-title">📁 จำนวนชิ้นงานที่รายงานแยกตามฝ่าย (งาน)</h3>
              <div className="chart-container">
                <div className="bar-chart-flex">
                  {deptStats.map(dept => {
                    const heightPercent = (dept.submissions / maxSubmissions) * 80; // จำกัดความสูงที่ 80%
                    return (
                      <div key={dept.name} className="bar-column">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 5)}%`,
                            backgroundColor: 'var(--primary)',
                            width: '32px'
                          }}
                        >
                          <div className="bar-tooltip">{dept.submissions} งาน</div>
                        </div>
                        <span className="bar-label">{dept.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* กราฟความคืบหน้าการทำงานเฉลี่ยตามฝ่าย */}
            <div className="card">
              <h3 className="card-title">📈 เปอร์เซ็นต์ความคืบหน้าเฉลี่ยตามฝ่าย (%)</h3>
              <div className="chart-container">
                <div className="bar-chart-flex">
                  {deptStats.map(dept => {
                    const heightPercent = dept.avgRate; // สเกล 0-100% โดยตรง
                    return (
                      <div key={dept.name} className="bar-column">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 5)}%`,
                            backgroundColor: '#10b981',
                            width: '32px'
                          }}
                        >
                          <div className="bar-tooltip">{dept.avgRate}%</div>
                        </div>
                        <span className="bar-label">{dept.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ตารางแสดงภาพรวมสถานะตามฝ่ายงาน */}
          <div className="card">
            <h3 className="card-title">🏢 สรุปสถานะประสิทธิภาพตามฝ่ายงาน</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ฝ่ายงาน</th>
                    <th>จำนวนบุคลากร</th>
                    <th>ผลงานที่บันทึกรวม</th>
                    <th>ความคืบหน้าเฉลี่ย</th>
                    <th>สถานะ (Done / Progress / Delayed)</th>
                  </tr>
                </thead>
                <tbody>
                  {deptStats.map(dept => {
                    // ดึงจำนวนสถานะ
                    const deptEmployees = employeesData.filter(e => isSameDept(e.department, dept.name));
                    const deptEmpIds = deptEmployees.map(e => e.id);
                    const deptPerfs = performanceData.filter(p => deptEmpIds.includes(p.employee_id));
                    
                    const dDone = deptPerfs.filter(p => p.status === 'Done').length;
                    const dProg = deptPerfs.filter(p => p.status === 'In Progress').length;
                    const dDel = deptPerfs.filter(p => p.status === 'Delayed').length;

                    return (
                      <tr key={dept.name}>
                        <td><strong>{formatDept(dept.name)}</strong></td>
                        <td>{dept.staffCount} คน</td>
                        <td>{dept.submissions} ชิ้นงาน</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="completion-progress-bar" style={{ width: '80px' }}>
                              <span className="progress-fill" style={{ width: `${dept.avgRate}%`, backgroundColor: '#10b981' }}></span>
                            </span>
                            <strong>{dept.avgRate}%</strong>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-done" style={{ marginRight: '6px' }}>{dDone} เสร็จ</span>
                          <span className="badge badge-progress" style={{ marginRight: '6px' }}>{dProg} ทำอยู่</span>
                          <span className="badge badge-delayed">{dDel} ล่าช้า</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. หน้าแยกตามฝ่ายงาน (Department View) */}
      {/* ======================================================== */}
      {activeSubTab === 'department' && (
        <div>
          {/* ตัวเลือกฝ่ายงาน */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="form-group" style={{ margin: 0, maxWidth: '300px' }}>
              <label className="form-label">เลือกฝ่ายงานที่ต้องการตรวจสอบ</label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {CONFIG.DEPARTMENTS.filter(d => d !== 'ผู้บริหาร').map(d => (
                  <option key={d} value={d}>{formatDept(d)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* สถิติของฝ่ายที่เลือก */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>พนักงานใน{formatDept(selectedDept)}</h3>
                <p>{deptEmployees.length} คน</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <h3>ความคืบหน้าเฉลี่ย</h3>
                <p>{deptAvgRate}%</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress)' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h3>งานดำเนินการอยู่</h3>
                <p>{deptProgress} งาน</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-delayed-bg)', color: 'var(--status-delayed)' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>งานล่าช้ากว่ากำหนด</h3>
                <p>{deptDelayed} งาน</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
            {/* รายชื่อพนักงานในฝ่าย */}
            <div className="card">
              <h3 className="card-title">👤 บุคลากรสังกัดฝ่าย</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {deptEmployees.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ไม่พบพนักงานในฝ่ายนี้</p>
                ) : (
                  deptEmployees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmpId(emp.id);
                        setActiveSubTab('individual');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <img src={emp.image_url} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.position}</div>
                      </div>
                      <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-light)' }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ผลงานทั้งหมดของฝ่าย */}
            <div className="card">
              <h3 className="card-title">📁 รายงานผลงานของ{formatDept(selectedDept)} ({deptPerformance.length} ชิ้นงาน)</h3>
              <div className="perf-list">
                {deptPerformance.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    ยังไม่มีข้อมูลรายงานผลงานของฝ่ายนี้ในระบบ
                  </div>
                ) : (
                  deptPerformance.map(perf => {
                    const emp = employeesData.find(e => e.id === perf.employee_id);
                    return (
                      <div key={perf.id} className="perf-item">
                        <div className="perf-header">
                          <div>
                            <span className="perf-time-badge">{perf.month} {perf.year}</span>
                            <h4 className="perf-title" style={{ marginTop: '8px' }}>{perf.title}</h4>
                          </div>
                          <span className={`badge ${
                            perf.status === 'Done' ? 'badge-done' :
                            perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                          }`}>
                            {perf.status === 'Done' ? 'Done' :
                             perf.status === 'In Progress' ? 'In Progress' : 'Delayed'}
                          </span>
                        </div>
                        <p className="perf-body">{perf.details}</p>
                        <div className="perf-footer">
                          <div className="perf-reporter">
                            <img src={emp?.image_url} alt={emp?.name} className="avatar-xs" onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} />
                            <span style={{ fontWeight: '500' }}>{emp?.name} ({emp?.position})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div>
                              <span className="completion-progress-bar" style={{ width: '80px' }}>
                                <span className="progress-fill" style={{ width: `${perf.completion_rate}%` }}></span>
                              </span>
                              <span>{perf.completion_rate}%</span>
                            </div>
                            {perf.ref_link && (
                              <a href={perf.ref_link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}><LinkIcon size={14} /></a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. หน้าตรวจสอบรายบุคคล (Individual View) */}
      {/* ======================================================== */}
      {activeSubTab === 'individual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* ตัวเลือกและแถบค้นหาพนักงาน */}
          <div className="card">
            <h3 className="card-title">🔎 ค้นหาบุคลากร</h3>
            <div className="form-group" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-light)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="ชื่อ รหัสพนักงาน หรือฝ่ายงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', marginTop: '16px' }}>
              {filteredEmployees.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูล</p>
              ) : (
                filteredEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${selectedEmpId === emp.id ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: selectedEmpId === emp.id ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <img src={emp.image_url} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: selectedEmpId === emp.id ? 'var(--primary-hover)' : 'var(--text-main)' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.id} • {formatDept(emp.department)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* รายละเอียดพนักงานและประวัติการบันทึกผลงาน */}
          <div>
            {selectedEmployee ? (
              <div>
                {/* ข้อมูลโปรไฟล์พนักงาน */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="employee-detail-card">
                    <img
                      src={selectedEmployee.image_url}
                      alt={selectedEmployee.name}
                      className="employee-large-avatar"
                      onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <span className="badge badge-progress" style={{ marginBottom: '10px' }}>พนักงานระดับทดสอบ</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{selectedEmployee.name}</h2>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>ตำแหน่ง: {selectedEmployee.position}</p>
                      
                      <div className="employee-meta-info">
                        <div className="meta-item">
                          <div className="meta-label">รหัสพนักงาน</div>
                          <div className="meta-value">{selectedEmployee.id}</div>
                        </div>
                        <div className="meta-item">
                          <div className="meta-label">ฝ่าย / แผนก</div>
                          <div className="meta-value">{formatDept(selectedEmployee.department)}</div>
                        </div>
                        <div className="meta-item">
                          <div className="meta-label">เลขบัตรประชาชน</div>
                          <div className="meta-value" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{selectedEmployee.citizen_id || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* สถิติสรุปรายบุคคล */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <FileText size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>รายงานทั้งหมด</h3>
                      <p>{empPerformance.length} ครั้ง</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-done-bg)', color: 'var(--status-done)' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>ความสำเร็จเฉลี่ย</h3>
                      <p>{empAvgRate}%</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress)' }}>
                      <Clock size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>กำลังดำเนินการ</h3>
                      <p>{empProgress} งาน</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-delayed-bg)', color: 'var(--status-delayed)' }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>ล่าช้ากว่ากำหนด</h3>
                      <p>{empDelayed} งาน</p>
                    </div>
                  </div>
                </div>

                {/* รายการประวัติผลงานรายเดือน */}
                <div className="card">
                  <h3 className="card-title">📅 ประวัติรายงานผลงานรายเดือน ({empPerformance.length} งาน)</h3>
                  <div className="perf-list">
                    {empPerformance.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        ยังไม่มีข้อมูลบันทึกรายงานผลงานในระบบของพนักงานผู้นี้
                      </div>
                    ) : (
                      empPerformance.map(perf => (
                        <div key={perf.id} className="perf-item">
                          <div className="perf-header">
                            <div>
                              <span className="perf-time-badge">{perf.month} {perf.year}</span>
                              <h4 className="perf-title" style={{ marginTop: '8px' }}>{perf.title}</h4>
                            </div>
                            <span className={`badge ${
                              perf.status === 'Done' ? 'badge-done' :
                              perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                            }`}>
                              {perf.status === 'Done' ? 'Done' :
                               perf.status === 'In Progress' ? 'In Progress' : 'Delayed'}
                            </span>
                          </div>

                          <p className="perf-body">{perf.details}</p>

                          <div className="perf-footer">
                            <div>
                              <span className="completion-progress-bar" style={{ width: '100px' }}>
                                <span className="progress-fill" style={{ width: `${perf.completion_rate}%` }}></span>
                              </span>
                              <span style={{ fontWeight: '600' }}>{perf.completion_rate}% ความคืบหน้า</span>
                            </div>

                            {perf.ref_link && (
                              <a
                                href={perf.ref_link}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <LinkIcon size={14} />
                                ดูไฟล์แนบอ้างอิง
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                กรุณาเลือกพนักงานเพื่อดูรายละเอียดและประวัติผลงานรายเดือน
              </div>
            )}
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        currentUser={currentUser}
        onSuccess={onRefresh}
      />
    </div>
  );
}
