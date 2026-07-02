import React, { useState } from 'react';
import PerformanceForm from './PerformanceForm';
import { Award, Briefcase, FileText, CheckCircle2, Clock, AlertTriangle, Link as LinkIcon, Edit, Share2, Mail, Building2, TrendingUp } from 'lucide-react';
import { CONFIG, formatDept, calcMonthComparison } from '../config';

export default function EmployeeDashboard({ currentUser, performanceData, employeesData, onRefresh, onLogout }) {
  const [editingPerf, setEditingPerf] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  const [filterYear, setFilterYear] = useState('ทั้งหมด');
  const [filterMonth, setFilterMonth] = useState('ทั้งหมด');
  const [pageIdx, setPageIdx] = useState(0);

  // ข้อมูลผลงานทั้งหมดของตัวเองตามปีที่เลือก (สำหรับคำนวณสถิติภาพรวมด้านบน)
  const userYearPerf = performanceData.filter(perf => {
    const isMe = String(perf?.employee_id || '').trim() === String(currentUser?.id || '').trim();
    const matchYear = filterYear === 'ทั้งหมด' || String(perf?.year || '').trim() === String(filterYear || '').trim();
    return isMe && matchYear;
  });

  // คำนวณสถิติส่วนบุคคล (ภาพรวมของปี)
  const totalSubmissions = userYearPerf.length;
  const doneSubmissions = userYearPerf.filter(p => p.status === 'Done').length;
  const progressSubmissions = userYearPerf.filter(p => p.status === 'In Progress').length;
  const delayedSubmissions = userYearPerf.filter(p => p.status === 'Delayed').length;
  
  const avgCompletionRate = totalSubmissions > 0
    ? Math.round(userYearPerf.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / totalSubmissions)
    : 0;
  const myComparison = calcMonthComparison(userYearPerf);

  // เรียงลำดับผลงานจากใหม่ไปเก่า (ล่าสุดขึ้นก่อน)
  const sortedYearPerf = [...userYearPerf].sort((a, b) => {
    if (String(a.year) !== String(b.year)) {
      return parseInt(b.year || 0, 10) - parseInt(a.year || 0, 10);
    }
    return CONFIG.MONTHS.indexOf(String(b.month || '')) - CONFIG.MONTHS.indexOf(String(a.month || ''));
  });

  // หารายชื่อเดือนที่มีข้อมูลจริง เรียงจากล่าสุดไปเก่าสุด
  const uniqueMonthsList = [];
  const seenKeys = new Set();
  sortedYearPerf.forEach(p => {
    const key = `${p.year}-${p.month}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueMonthsList.push({ year: String(p.year || ''), month: String(p.month || ''), key });
    }
  });

  // คำนวณการแบ่งหน้า หน้าละ 3 เดือน โดยเริ่มต้นจากเดือนล่าสุด
  const monthsPerPage = 3;
  const totalPages = Math.ceil(uniqueMonthsList.length / monthsPerPage) || 1;
  const activeMonths = uniqueMonthsList.slice(pageIdx * monthsPerPage, (pageIdx + 1) * monthsPerPage);
  const activeMonthKeys = new Set(activeMonths.map(m => m.key));

  // ผลงานที่แสดงในประวัติ (ถ้าเลือกทั้งหมด จะแสดงหน้าละ 3 เดือนโดยเริ่มจากล่าสุด, ถ้าเลือกเดือนเฉพาะ จะแสดงเดือนนั้น)
  const displayedPerformance = filterMonth === 'ทั้งหมด'
    ? sortedYearPerf.filter(p => activeMonthKeys.has(`${p.year}-${p.month}`))
    : sortedYearPerf.filter(p => String(p.month || '').trim() === String(filterMonth).trim());

  const myPerformance = displayedPerformance;

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
      {/* ส่วนต้อนรับและโปรไฟล์ (Performance Insights Style) */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
            <div className="profile-avatar-wrapper">
              <img
                src={currentUser.image_url}
                alt={currentUser.name}
                className="profile-avatar-ring"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                }}
              />
              <div className="profile-avatar-badge">★</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{currentUser.name}</h2>
                <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: '600', padding: '3px 12px', borderRadius: '20px' }}>
                  {currentUser.position || formatDept(currentUser.department)}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} style={{ color: '#94a3b8' }} />
                  {formatDept(currentUser.department)}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>เลขที่ตำแหน่ง</span>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: '600', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    {currentUser.id || '-'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* บล็อกสถิติรายบุคคล (4 Left-Bordered Cards) */}
      <div className="stats-grid">
        <div className="stat-card-left-border accent-blue">
          <div className="stat-card-header">
            <span className="stat-card-title">งานทั้งหมด</span>
            <div className="stat-card-icon-sm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><FileText size={18} /></div>
          </div>
          <div className="stat-card-value">{totalSubmissions}</div>
          <div className="stat-card-subtitle"><span>รายการสะสม</span><span>งาน</span></div>
        </div>

        <div className="stat-card-left-border accent-green">
          <div className="stat-card-header">
            <span className="stat-card-title">เสร็จสมบูรณ์</span>
            <div className="stat-card-icon-sm" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-card-value">{doneSubmissions}</div>
          <div className="stat-card-subtitle"><span>ความสำเร็จ</span><span>{avgCompletionRate}%</span></div>
        </div>

        <div className="stat-card-left-border accent-purple">
          <div className="stat-card-header">
            <span className="stat-card-title">กำลังดำเนินการ</span>
            <div className="stat-card-icon-sm" style={{ backgroundColor: '#faf5ff', color: '#a855f7' }}><Clock size={18} /></div>
          </div>
          <div className="stat-card-value">{progressSubmissions}</div>
          <div className="stat-card-subtitle"><span>รอดำเนินการต่อ</span><span>งาน</span></div>
        </div>

        <div className="stat-card-left-border accent-orange">
          <div className="stat-card-header">
            <span className="stat-card-title">ความก้าวหน้าเฉลี่ย</span>
            <div className="stat-card-icon-sm" style={{ backgroundColor: '#ffedd5', color: '#f97316' }}><TrendingUp size={18} /></div>
          </div>
          <div className="stat-card-value">{avgCompletionRate}%</div>
          <div className="stat-card-subtitle">
            <span>ภาพรวม</span>
            <span className={`badge ${myComparison.badgeClass}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{myComparison.text}</span>
          </div>
          <div className="completion-progress-bar" style={{ width: '100%', height: '6px', marginTop: '10px' }}>
            <div className="progress-fill" style={{ width: `${avgCompletionRate}%`, backgroundColor: '#f97316' }}></div>
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
                  onChange={(e) => { setFilterYear(e.target.value); setPageIdx(0); }}
                >
                  <option value="ทั้งหมด">ทุกปี</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <select
                  className="form-select"
                  style={{ width: '170px', padding: '6px 12px' }}
                  value={filterMonth}
                  onChange={(e) => { setFilterMonth(e.target.value); setPageIdx(0); }}
                >
                  <option value="ทั้งหมด">ล่าสุด (หน้าละ 3 เดือน)</option>
                  {CONFIG.MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px' }} className="timeline-container">
              {filterMonth === 'ทั้งหมด' && uniqueMonthsList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    📅 แสดงผล: {activeMonths[0]?.month} {activeMonths[0]?.year} {activeMonths.length > 1 ? `ถึง ${activeMonths[activeMonths.length - 1]?.month} ${activeMonths[activeMonths.length - 1]?.year}` : ''} ({activeMonths.length} เดือน)
                  </span>
                  {uniqueMonthsList.length > monthsPerPage && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      หน้า {pageIdx + 1} จากทั้งหมด {totalPages} หน้า ({uniqueMonthsList.length} เดือน)
                    </span>
                  )}
                </div>
              )}

              {displayedPerformance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p>ไม่พบประวัติผลงานในเงื่อนไขที่เลือก</p>
                  <p style={{ fontSize: '13px' }}>คุณสามารถเพิ่มข้อมูลใหม่ได้ที่ฟอร์มด้านขวามือ</p>
                </div>
              ) : (
                displayedPerformance.map(perf => (
                  <div key={perf.id} className="timeline-item">
                    <div className={`timeline-node ${perf.status === 'Done' ? '' : perf.status === 'In Progress' ? 'progress' : 'delayed'}`}></div>
                    <div className="perf-header" style={{ marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>{perf.title}</h4>
                        <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px', marginBottom: 0 }}>{perf.details}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${
                          perf.status === 'Done' ? 'badge-done' :
                          perf.status === 'In Progress' ? 'badge-progress' : 'badge-delayed'
                        }`} style={{ fontWeight: '600', padding: '4px 12px' }}>
                          {perf.status === 'Done' ? 'สำเร็จแล้ว' :
                           perf.status === 'In Progress' ? 'กำลังดำเนินการ' : 'ล่าช้า'}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setEditingPerf(perf)}
                        >
                          <Edit size={12} />
                          แก้ไข
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, marginRight: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>ความคืบหน้า ({perf.month} {perf.year})</span>
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
                          ไฟล์อ้างอิง
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

              {filterMonth === 'ทั้งหมด' && uniqueMonthsList.length > monthsPerPage && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pageIdx === 0}
                    onClick={() => setPageIdx(Math.max(0, pageIdx - 1))}
                    style={{ padding: '6px 14px', fontSize: '13px', opacity: pageIdx === 0 ? 0.5 : 1, cursor: pageIdx === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    &lt; ย้อนดู 3 เดือนใหม่กว่า
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPageIdx(idx)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)',
                          backgroundColor: pageIdx === idx ? 'var(--primary)' : 'var(--card-bg)',
                          color: pageIdx === idx ? '#fff' : 'var(--text-main)',
                          fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pageIdx >= totalPages - 1}
                    onClick={() => setPageIdx(Math.min(totalPages - 1, pageIdx + 1))}
                    style={{ padding: '6px 14px', fontSize: '13px', opacity: pageIdx >= totalPages - 1 ? 0.5 : 1, cursor: pageIdx >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ดู 3 เดือนเก่ากว่า &gt;
                  </button>
                </div>
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
