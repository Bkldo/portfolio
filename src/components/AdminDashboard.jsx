import React, { useState } from 'react';
import EmployeeProfileForm from './EmployeeProfileForm';
import {
  Users, UserPlus, Search, ShieldCheck, LogOut, CheckCircle2,
  Building2, BarChart3, TrendingUp, FileText,
  Clock, AlertTriangle, Link as LinkIcon, ArrowRight, KeyRound
} from 'lucide-react';
import { CONFIG, formatDept, isSameDept } from '../config';

export default function AdminDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [activeTab, setActiveTab] = useState('stats'); // stats, users
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ทั้งหมด');
  const [successToast, setSuccessToast] = useState('');
  // สำหรับแท็บสถิติ
  const [statsSubTab, setStatsSubTab] = useState('overall'); // overall, department, individual
  const [statsDept, setStatsDept] = useState(CONFIG.DEPARTMENTS[1]);
  const [selectedEmpId, setSelectedEmpId] = useState(employeesData.find(e => e.role !== 'admin' && e.role !== 'executive')?.id || '');
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('ทั้งหมด');
  const [filterMonth, setFilterMonth] = useState('ทั้งหมด');
  const [showExecInInspection, setShowExecInInspection] = useState(() => {
    return localStorage.getItem('show_exec_in_inspection') === 'true';
  });

  const isExecutiveUser = (e) => {
    if (!e) return false;
    const role = String(e.role || '').toLowerCase();
    const dept = String(e.department || '').trim();
    const pos = String(e.position || '').trim();
    return role === 'executive' || 
           dept === 'ผู้บริหาร' || 
           dept.toLowerCase() === 'executive' || 
           pos.includes('ผู้อำนวยการเขต') || 
           pos.includes('ผู้ช่วยผู้อำนวยการ');
  };

  const sortHeadFirst = (list) => {
    return [...list].sort((a, b) => {
      const aIsHead = String(a.role || '').toLowerCase() === 'head' || String(a.position || '').includes('หัวหน้า');
      const bIsHead = String(b.role || '').toLowerCase() === 'head' || String(b.position || '').includes('หัวหน้า');
      if (aIsHead && !bIsHead) return -1;
      if (!aIsHead && bIsHead) return 1;
      return 0;
    });
  };

  // ===== สถิติบุคลากร =====
  const totalUsers = employeesData.length;
  const adminCount = employeesData.filter(e => e.role === 'admin').length;
  const execCount = employeesData.filter(e => e.role === 'executive').length;
  const empCount = employeesData.filter(e => e.role !== 'admin' && e.role !== 'executive').length;

  // ===== สถิติผลงาน (เหมือนผู้บริหาร) =====
  const perfData = performanceData || [];
  const totalEmployees = employeesData.filter(e => e.role !== 'executive' && e.role !== 'admin').length;
  const totalSubmissions = perfData.length;
  const doneCount = perfData.filter(p => p.status === 'Done').length;
  const progressCount = perfData.filter(p => p.status === 'In Progress').length;
  const delayedCount = perfData.filter(p => p.status === 'Delayed').length;
  const avgCompletionRate = totalSubmissions > 0
    ? Math.round(perfData.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / totalSubmissions)
    : 0;

  const currentMonth = CONFIG.MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear().toString();
  const submittedThisMonth = new Set(
    perfData
      .filter(p => String(p.month || '').trim() === currentMonth && String(p.year || '').trim() === currentYear)
      .map(p => p.employee_id)
  ).size;

  // กราฟข้อมูลฝ่าย
  const deptStats = CONFIG.DEPARTMENTS.filter(d => d !== 'ผู้บริหาร').map(dept => {
    const deptEmps = employeesData.filter(e => isSameDept(e.department, dept));
    const deptEmpIds = deptEmps.map(e => e.id);
    const deptSubs = perfData.filter(p => deptEmpIds.includes(p.employee_id));
    const deptAvg = deptSubs.length > 0
      ? Math.round(deptSubs.reduce((a, c) => a + parseInt(c.completion_rate || 0, 10), 0) / deptSubs.length) : 0;
    return { name: dept, submissions: deptSubs.length, avgRate: deptAvg, staffCount: deptEmps.length };
  });
  const maxSubmissions = Math.max(...deptStats.map(d => d.submissions), 1);

  // ข้อมูลฝ่ายที่เลือก
  const deptEmployees = sortHeadFirst(employeesData.filter(e => isSameDept(e.department, statsDept)));
  const deptEmpIds = deptEmployees.map(e => e.id);
  const deptPerformance = perfData.filter(p => deptEmpIds.includes(p.employee_id));
  const deptDone = deptPerformance.filter(p => p.status === 'Done').length;
  const deptProgress = deptPerformance.filter(p => p.status === 'In Progress').length;
  const deptDelayed = deptPerformance.filter(p => p.status === 'Delayed').length;
  const deptAvgRate = deptPerformance.length > 0
    ? Math.round(deptPerformance.reduce((a, c) => a + parseInt(c.completion_rate || 0, 10), 0) / deptPerformance.length) : 0;

  const filteredEmpList = sortHeadFirst(employeesData.filter(e => {
    const q = empSearchQuery.toLowerCase();
    const isExec = isExecutiveUser(e);
    return e.role !== 'admin' && (showExecInInspection || !isExec) && (
      String(e.name || '').toLowerCase().includes(q) || String(e.id || '').toLowerCase().includes(q) || String(e.department || '').toLowerCase().includes(q)
    );
  }));

  // ข้อมูลรายบุคคล
  const validSelectedEmpId = (filteredEmpList.some(e => e.id === selectedEmpId))
    ? selectedEmpId
    : (filteredEmpList[0]?.id || '');

  const selectedEmployee = employeesData.find(e => e.id === validSelectedEmpId);
  const empPerformance = perfData.filter(p => {
    if (p.employee_id !== validSelectedEmpId) return false;
    if (filterYear !== 'ทั้งหมด' && String(p.year || '').trim() !== String(filterYear)) return false;
    if (filterMonth !== 'ทั้งหมด' && String(p.month || '').trim() !== String(filterMonth)) return false;
    return true;
  });
  const empDone = empPerformance.filter(p => p.status === 'Done').length;
  const empProgress = empPerformance.filter(p => p.status === 'In Progress').length;
  const empDelayed = empPerformance.filter(p => p.status === 'Delayed').length;
  const empAvgRate = empPerformance.length > 0
    ? Math.round(empPerformance.reduce((a, c) => a + parseInt(c.completion_rate || 0, 10), 0) / empPerformance.length) : 0;

  // กรองรายชื่อสำหรับแท็บจัดการผู้ใช้
  const filteredEmployees = employeesData.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (e.citizen_id || '').includes(searchQuery) ||
                        e.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === 'ทั้งหมด' || isSameDept(e.department, selectedDept);
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
      {successToast && (
        <div className="alert-toast">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* แถบหัวข้อ */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} style={{ color: '#8b5cf6' }} />
            แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            ดูสถิติผลงานภาพรวมองค์กร จัดการรายชื่อบุคลากร และลงทะเบียนบุคคลใหม่
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#8b5cf6' }}>
            <UserPlus size={16} />
            ลงทะเบียนบุคคลใหม่
          </button>
        </div>
      </div>

      {/* แท็บหลัก */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          📊 สถิติผลงานองค์กร
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 จัดการบุคลากร
        </button>
      </div>

      {/* ===== แท็บสถิติ (เหมือนผู้บริหาร) ===== */}
      {activeTab === 'stats' && (
        <div>
          {/* เมนูย่อยสถิติ */}
          <div className="tabs" style={{ marginBottom: '20px' }}>
            <button className={`tab-btn ${statsSubTab === 'overall' ? 'active' : ''}`} onClick={() => setStatsSubTab('overall')}>
              📊 ภาพรวมองค์กร
            </button>
            <button className={`tab-btn ${statsSubTab === 'department' ? 'active' : ''}`} onClick={() => setStatsSubTab('department')}>
              🏢 แยกตามฝ่ายงาน
            </button>
            <button className={`tab-btn ${statsSubTab === 'individual' ? 'active' : ''}`} onClick={() => setStatsSubTab('individual')}>
              👤 ตรวจสอบรายบุคคล
            </button>
          </div>

          {/* ภาพรวม */}
          {statsSubTab === 'overall' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}><Users size={24} /></div>
                  <div className="stat-info"><h3>พนักงานในระบบ</h3><p>{totalEmployees} คน</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><FileText size={24} /></div>
                  <div className="stat-info"><h3>ผลงานทั้งหมด</h3><p>{totalSubmissions} งาน</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#fefce8', color: '#f59e0b' }}><TrendingUp size={24} /></div>
                  <div className="stat-info"><h3>ความคืบหน้าเฉลี่ย</h3><p>{avgCompletionRate}%</p></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><CheckCircle2 size={24} /></div>
                  <div className="stat-info"><h3>ส่งรายงานเดือนนี้</h3><p>{submittedThisMonth}/{totalEmployees} คน</p></div>
                </div>
              </div>

              {/* กราฟแท่งสรุปรายฝ่าย */}
              <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                  เปรียบเทียบจำนวนผลงานแยกตามฝ่าย
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {deptStats.map(dept => (
                    <div key={dept.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '120px', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', textAlign: 'right', flexShrink: 0 }}>{dept.name}</div>
                      <div style={{ flex: 1, height: '28px', backgroundColor: '#f1f5f9', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.max((dept.submissions / maxSubmissions) * 100, 2)}%`,
                          height: '100%', backgroundColor: 'var(--primary)', borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px',
                          color: '#fff', fontSize: '11px', fontWeight: '700', minWidth: '30px', transition: 'width 0.5s ease'
                        }}>
                          {dept.submissions}
                        </div>
                      </div>
                      <div style={{ width: '60px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {dept.avgRate}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ตารางสรุปสถานะ */}
              <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📋 สรุปสถานะผลงานทั้งหมด</h3>
                <div className="stats-grid">
                  <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-label">✅ เสร็จสิ้น (Done)</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>{doneCount}</div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-label">🔄 กำลังดำเนินการ</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{progressCount}</div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-label">⚠️ ล่าช้ากว่ากำหนด</div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{delayedCount}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* แยกตามฝ่าย */}
          {statsSubTab === 'department' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CONFIG.DEPARTMENTS.filter(d => d !== 'ผู้บริหาร').map(d => (
                    <button key={d} className={`tab-btn ${statsDept === d ? 'active' : ''}`} onClick={() => setStatsDept(d)} style={{ fontSize: '13px' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div className="stat-label">👥 จำนวนพนักงาน</div>
                  <div className="stat-value">{deptEmployees.length} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <div className="stat-label">✅ เสร็จสิ้น</div>
                  <div className="stat-value" style={{ color: '#10b981' }}>{deptDone}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className="stat-label">🔄 กำลังดำเนินการ</div>
                  <div className="stat-value" style={{ color: '#f59e0b' }}>{deptProgress}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div className="stat-label">⚠️ ล่าช้า</div>
                  <div className="stat-value" style={{ color: '#ef4444' }}>{deptDelayed}</div>
                </div>
              </div>
              <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📝 รายการผลงานของ{formatDept(statsDept)} (ทั้งหมด {deptPerformance.length} รายการ)</h3>
                {deptPerformance.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลรายงานผลงานของฝ่ายนี้</div>
                ) : (
                  deptPerformance.map(perf => {
                    const emp = employeesData.find(e => e.id === perf.employee_id);
                    return (
                      <div key={perf.id} className="perf-item">
                        <div className="perf-header">
                          <div>
                            <span className="perf-time-badge">{perf.month} {perf.year}</span>
                            <h4 className="perf-title" style={{ marginTop: '8px' }}>{perf.title}</h4>
                            {emp && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>โดย: {emp.name}</p>}
                          </div>
                          <span className={`badge ${perf.status === 'Done' ? 'badge-done' : perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'}`}>{perf.status}</span>
                        </div>
                        <p className="perf-details">{perf.details}</p>
                        <div className="perf-footer">
                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${perf.completion_rate}%` }}></div>
                          </div>
                          <span className="progress-text">{perf.completion_rate}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* รายบุคคล */}
          {statsSubTab === 'individual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
              {/* รายชื่อพนักงาน */}
              <div className="card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input type="text" className="form-input" placeholder="ค้นหาพนักงาน..." value={empSearchQuery} onChange={(e) => setEmpSearchQuery(e.target.value)} style={{ paddingLeft: '34px', fontSize: '13px' }} />
                </div>
                {filteredEmpList.map(emp => (
                  <div key={emp.id} onClick={() => setSelectedEmpId(emp.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                    backgroundColor: validSelectedEmpId === emp.id ? 'var(--primary-light)' : 'transparent',
                    border: validSelectedEmpId === emp.id ? '1px solid var(--primary)' : '1px solid transparent'
                  }}>
                    <img src={emp.image_url} alt={emp.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.department} • {emp.id}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ข้อมูลพนักงานที่เลือก */}
              <div>
                {selectedEmployee ? (
                  <>
                    <div className="card" style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={selectedEmployee.image_url} alt={selectedEmployee.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }} />
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedEmployee.name}</h3>
                          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            {selectedEmployee.position} • {formatDept(selectedEmployee.department)} • <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>เลขที่ตำแหน่ง: {selectedEmployee.id || '-'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="stats-grid">
                      <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}><div className="stat-label">📄 ผลงานทั้งหมด</div><div className="stat-value">{empPerformance.length}</div></div>
                      <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}><div className="stat-label">✅ เสร็จสิ้น</div><div className="stat-value" style={{ color: '#10b981' }}>{empDone}</div></div>
                      <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}><div className="stat-label">🔄 กำลังดำเนินการ</div><div className="stat-value" style={{ color: '#f59e0b' }}>{empProgress}</div></div>
                      <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}><div className="stat-label">📈 ความคืบหน้าเฉลี่ย</div><div className="stat-value" style={{ color: '#3b82f6' }}>{empAvgRate}%</div></div>
                    </div>
                    <div className="card" style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>📝 ประวัติผลงาน ({empPerformance.length} รายการ)</h4>
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
                      {empPerformance.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>ยังไม่มีผลงาน</div>
                      ) : (
                        empPerformance.map(perf => (
                          <div key={perf.id} className="perf-item">
                            <div className="perf-header">
                              <div>
                                <span className="perf-time-badge">{perf.month} {perf.year}</span>
                                <h4 className="perf-title" style={{ marginTop: '6px' }}>{perf.title}</h4>
                              </div>
                              <span className={`badge ${perf.status === 'Done' ? 'badge-done' : perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'}`}>{perf.status}</span>
                            </div>
                            <p className="perf-details">{perf.details}</p>
                            <div className="perf-footer">
                              <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${perf.completion_rate}%` }}></div></div>
                              <span className="progress-text">{perf.completion_rate}%</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>กรุณาเลือกพนักงานจากรายชื่อทางซ้าย</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== แท็บจัดการบุคลากร ===== */}
      {activeTab === 'users' && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}><div className="stat-label">👥 บุคลากรทั้งหมด</div><div className="stat-value" style={{ color: '#8b5cf6' }}>{totalUsers} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div></div>
            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}><div className="stat-label">💼 พนักงานทั่วไป</div><div className="stat-value" style={{ color: '#3b82f6' }}>{empCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div></div>
            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}><div className="stat-label">🤵 ผู้บริหาร</div><div className="stat-value" style={{ color: '#f59e0b' }}>{execCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div></div>
            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}><div className="stat-label">🛡️ ผู้ดูแลระบบ</div><div className="stat-value" style={{ color: '#10b981' }}>{adminCount} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>คน</span></div></div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input type="text" className="form-input" placeholder="ค้นหาตามเลขที่ตำแหน่ง, ชื่อ, ตำแหน่ง หรือเลขบัตรประชาชน..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '38px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={18} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ width: 'auto', minWidth: '160px' }} value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="ทั้งหมด">ทั้งหมดทุกฝ่าย</option>
                  {CONFIG.DEPARTMENTS.map(d => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '500' }}>
                <input 
                  type="checkbox" 
                  checked={showExecInInspection} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setShowExecInInspection(val);
                    localStorage.setItem('show_exec_in_inspection', val ? 'true' : 'false');
                    onRefresh();
                  }} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>แสดงข้อมูลผู้บริหาร (ผู้อำนวยการเขต/ผู้ช่วยผู้อำนวยการเขต) ในหน้าตรวจสอบรายบุคคล</span>
              </label>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              รายชื่อบุคลากรในระบบ ({filteredEmployees.length} คน)
            </h3>
            {filteredEmployees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบบุคลากรที่ตรงกับเงื่อนไข</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>บุคลากร</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>เลขที่ตำแหน่ง</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>ตำแหน่ง</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>สังกัด / ฝ่าย</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>เลขบัตรประชาชน</th>
                      <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>ระดับสิทธิ์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={emp.image_url} alt={emp.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"; }} />
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{emp.id}</td>
                        <td style={{ padding: '12px', color: 'var(--text-main)' }}>{emp.position}</td>
                        <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{formatDept(emp.department)}</span></td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px' }}>{emp.citizen_id || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                            backgroundColor: emp.role === 'admin' ? '#f3e8ff' : emp.role === 'executive' ? '#fef3c7' : emp.role === 'head' || emp.role === 'supervisor' || emp.role === 'manager' || emp.role === 'หัวหน้าฝ่าย' ? '#ecfdf5' : '#e0f2fe',
                            color: emp.role === 'admin' ? '#7e22ce' : emp.role === 'executive' ? '#b45309' : emp.role === 'head' || emp.role === 'supervisor' || emp.role === 'manager' || emp.role === 'หัวหน้าฝ่าย' ? '#059669' : '#0369a1'
                          }}>
                            {emp.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : emp.role === 'executive' ? '🤵 ผู้บริหาร' : emp.role === 'head' || emp.role === 'supervisor' || emp.role === 'manager' || emp.role === 'หัวหน้าฝ่าย' ? '👨‍💼 หัวหน้าฝ่าย' : '👤 พนักงานทั่วไป'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* โมดัลลงทะเบียน */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: 0, color: 'var(--text-main)' }}>
                <UserPlus size={20} style={{ color: '#8b5cf6' }} />
                ลงทะเบียนบุคลากรใหม่เข้าสู่ระบบ
              </h3>
              <button style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }} onClick={() => setShowRegisterModal(false)}>&times;</button>
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
