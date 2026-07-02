import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AdminDashboard from './components/AdminDashboard';
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard';
import { getInitialData } from './utils/api';
import { CONFIG, formatDept } from './config';
import { Briefcase, AlertCircle, FileSpreadsheet, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import ChangePasswordModal from './components/ChangePasswordModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('portfolio_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employeesData, setEmployeesData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInitialData();
      setEmployeesData(data.employees || []);
      setPerformanceData(data.performance || []);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถเชื่อมต่อข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    sessionStorage.setItem('portfolio_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('portfolio_user');
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      {/* 1. กรณีที่ยังไม่ล็อกอิน */}
      {!currentUser ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* 2. กรณีล็อกอินสำเร็จ */
        <>
          {/* ส่วนหัวของแอปพลิเคชัน */}
          <header className="header-bar">
            <div className="brand-section">
              <div className="brand-icon">
                <Briefcase size={20} />
              </div>
              <div className="brand-title">
                <h1 style={{ fontSize: '20px', letterSpacing: '-0.3px', color: '#0f172a' }}>Performance Insights</h1>
                <p style={{ fontSize: '12px', color: '#64748b' }}>ระบบบริหารจัดการและติดตามผลงาน</p>
              </div>
            </div>

            <div className="user-nav-section" style={{ position: 'relative' }}>
              <div
                className="user-profile-summary"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <img
                  src={currentUser.image_url}
                  alt={currentUser.name}
                  className="user-avatar-sm"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                  }}
                />
                <div className="user-info-text">
                  <div className="user-name-text">{currentUser.name}</div>
                  <span className="user-role-badge">
                    {currentUser.role === 'admin'
                      ? 'ผู้ดูแลระบบ (Admin)'
                      : currentUser.role === 'executive'
                      ? 'ผู้บริหาร (Executive)'
                      : currentUser.role === 'head' || currentUser.role === 'supervisor' || currentUser.role === 'manager' || currentUser.role === 'หัวหน้าฝ่าย'
                      ? `หัวหน้า${formatDept(currentUser.department)}`
                      : formatDept(currentUser.department)}
                  </span>
                </div>
                <ChevronDown size={16} style={{ color: '#64748b', marginLeft: '2px' }} />
              </div>

              {showProfileMenu && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 50
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDept(currentUser.department)} ({currentUser.id})</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowPasswordModal(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1e293b',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <KeyRound size={16} style={{ color: 'var(--primary)' }} />
                      <span>เปลี่ยนรหัสผ่าน</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#e11d48',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* แจ้งเตือนสถานะการเชื่อมต่อ (ในกรณีใช้งาน Demo Mode) */}
          {!CONFIG.GOOGLE_SCRIPT_URL && (
            <div style={{
              backgroundColor: '#eff6ff',
              borderBottom: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '10px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <AlertCircle size={16} />
              <span>
                <strong>สถานะระบบ:</strong> โหมดจำลอง (LocalStorage) ข้อมูลที่กรอกจะบันทึกอยู่ในเครื่องของท่านเท่านั้น
              </span>
              <span style={{ color: '#64748b' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileSpreadsheet size={14} />
                ดูไฟล์คู่มือการติดตั้ง Google Sheets ได้ที่ไฟล์ <code>google_apps_script.js</code>
              </span>
            </div>
          )}

          {/* เนื้อหาหลักตามบทบาท */}
          <main className="main-content">
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                กำลังประมวลผลข้อมูล...
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #ffe4e6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p>{error}</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={loadData}>
                  โหลดข้อมูลใหม่อีกครั้ง
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {currentUser.role === 'admin' ? (
                  <AdminDashboard
                    currentUser={currentUser}
                    performanceData={performanceData}
                    employeesData={employeesData}
                    onRefresh={loadData}
                    onLogout={handleLogout}
                  />
                ) : currentUser.role === 'executive' ? (
                  <ExecutiveDashboard
                    currentUser={currentUser}
                    performanceData={performanceData}
                    employeesData={employeesData}
                    onRefresh={loadData}
                    onLogout={handleLogout}
                  />
                ) : currentUser.role === 'head' || currentUser.role === 'supervisor' || currentUser.role === 'manager' || currentUser.role === 'หัวหน้าฝ่าย' ? (
                  <DepartmentHeadDashboard
                    currentUser={currentUser}
                    performanceData={performanceData}
                    employeesData={employeesData}
                    onRefresh={loadData}
                    onLogout={handleLogout}
                  />
                ) : (
                  <EmployeeDashboard
                    currentUser={currentUser}
                    performanceData={performanceData}
                    employeesData={employeesData}
                    onRefresh={loadData}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </main>

          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            currentUser={currentUser}
            onSuccess={loadData}
          />
        </>
      )}
    </div>
  );
}
