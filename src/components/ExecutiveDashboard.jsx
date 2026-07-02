import React, { useState } from 'react';
import {
  Users, BarChart3, TrendingUp, ShieldAlert,
  Search, FolderKanban, FileText, CheckCircle2,
  Clock, AlertTriangle, Link as LinkIcon, LogOut, ArrowRight, KeyRound,
  Edit, Share2, Mail, Calendar, Building2
} from 'lucide-react';
import { CONFIG, formatDept, isSameDept, calcMonthComparison } from '../config';

export default function ExecutiveDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [activeSubTab, setActiveSubTab] = useState('overall'); // overall, department, individual
  const [selectedDept, setSelectedDept] = useState(CONFIG.DEPARTMENTS[1]); // ไอที เป็นดีฟอลต์
  const [selectedEmpId, setSelectedEmpId] = useState(employeesData[1]?.id || ''); // พนักงานคนแรกที่ไม่ใช่ CEO เป็นดีฟอลต์
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('ทั้งหมด');
  const [filterMonth, setFilterMonth] = useState('ทั้งหมด');

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
  const overallComparison = calcMonthComparison(performanceData);

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
  const empPerformance = performanceData.filter(p => {
    if (p.employee_id !== selectedEmpId) return false;
    if (filterYear !== 'ทั้งหมด' && String(p.year || '').trim() !== String(filterYear)) return false;
    if (filterMonth !== 'ทั้งหมด' && String(p.month || '').trim() !== String(filterMonth)) return false;
    return true;
  });
  
  const empDone = empPerformance.filter(p => p.status === 'Done').length;
  const empProgress = empPerformance.filter(p => p.status === 'In Progress').length;
  const empDelayed = empPerformance.filter(p => p.status === 'Delayed').length;
  const empAvgRate = empPerformance.length > 0
    ? Math.round(empPerformance.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / empPerformance.length)
    : 0;
  const empComparison = calcMonthComparison(empPerformance);

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
            <div className="stat-card-left-border accent-blue">
              <div className="stat-card-header">
                <span className="stat-card-title">พนักงานทั้งหมด</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
              </div>
              <div className="stat-card-value">{totalEmployees}</div>
              <div className="stat-card-subtitle"><span>บุคลากรในระบบ</span><span>คน</span></div>
            </div>

            <div className="stat-card-left-border accent-purple">
              <div className="stat-card-header">
                <span className="stat-card-title">รายงานผลงานรวม</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}><FileText size={18} /></div>
              </div>
              <div className="stat-card-value">{totalSubmissions}</div>
              <div className="stat-card-subtitle"><span>รายการสะสม</span><span>ครั้ง</span></div>
            </div>

            <div className="stat-card-left-border accent-green">
              <div className="stat-card-header">
                <span className="stat-card-title">ความคืบหน้าเฉลี่ย</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={18} /></div>
              </div>
              <div className="stat-card-value">{avgCompletionRate}%</div>
              <div className="stat-card-subtitle">
                <span>ภาพรวมความสำเร็จ</span>
                <span className={`badge ${overallComparison.badgeClass}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{overallComparison.text}</span>
              </div>
              <div className="completion-progress-bar" style={{ width: '100%', height: '6px', marginTop: '10px' }}>
                <div className="progress-fill" style={{ width: `${avgCompletionRate}%`, backgroundColor: '#10b981' }}></div>
              </div>
            </div>

            <div className="stat-card-left-border accent-orange">
              <div className="stat-card-header">
                <span className="stat-card-title">ส่งงานเดือน{currentMonth}</span>
                <div className="stat-card-icon-sm" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><TrendingUp size={18} /></div>
              </div>
              <div className="stat-card-value">{submittedThisMonth}</div>
              <div className="stat-card-subtitle"><span>จากทั้งหมด {totalEmployees} คน</span><span>{Math.round((submittedThisMonth / (totalEmployees || 1)) * 100)}%</span></div>
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
                          <div className="bar-tooltip">{dept.name}: {dept.submissions} งาน</div>
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
                          <div className="bar-tooltip">{dept.name}: {dept.avgRate}%</div>
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
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>รายชื่อพนักงาน</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>รายชื่อทั้งหมดในองค์กร ({filteredEmployees.length} คน)</p>
            </div>
            <div className="form-group" style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input search-pill-input"
                placeholder="ค้นหาพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '500px', overflowY: 'auto' }}>
              {filteredEmployees.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูล</p>
              ) : (
                filteredEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmpId(emp.id)}
                    className={`emp-sidebar-item ${selectedEmpId === emp.id ? 'active' : 'inactive'}`}
                  >
                    <img src={emp.image_url} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} />
                    <div style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', opacity: selectedEmpId === emp.id ? 0.9 : 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.position || formatDept(emp.department)}</div>
                    </div>
                    <ArrowRight size={16} style={{ opacity: selectedEmpId === emp.id ? 1 : 0.3 }} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* รายละเอียดพนักงานและประวัติการบันทึกผลงาน */}
          <div>
            {selectedEmployee ? (
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
                          onError={(e) => e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
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

                {/* สถิติสรุปรายบุคคล (4 Left-Bordered Cards) */}
                <div className="stats-grid">
                  <div className="stat-card-left-border accent-blue">
                    <div className="stat-card-header">
                      <span className="stat-card-title">งานทั้งหมด</span>
                      <div className="stat-card-icon-sm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><FileText size={18} /></div>
                    </div>
                    <div className="stat-card-value">{empPerformance.length}</div>
                    <div className="stat-card-subtitle"><span>รายการสะสม</span><span>งาน</span></div>
                  </div>

                  <div className="stat-card-left-border accent-green">
                    <div className="stat-card-header">
                      <span className="stat-card-title">เสร็จสมบูรณ์</span>
                      <div className="stat-card-icon-sm" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={18} /></div>
                    </div>
                    <div className="stat-card-value">{empPerformance.filter(p => p.status === 'Done').length}</div>
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

                {/* รายการประวัติผลงานรายเดือน (Timeline View) */}
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
                    {empPerformance.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        ยังไม่มีข้อมูลบันทึกรายงานผลงานในระบบของพนักงานผู้นี้
                      </div>
                    ) : (
                      empPerformance.map(perf => (
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
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                กรุณาเลือกพนักงานเพื่อดูรายละเอียดและประวัติผลงานรายเดือน
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
