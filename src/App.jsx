import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import EmployeeDashboard from './components/EmployeeDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import AdminDashboard from './components/AdminDashboard';
import { getInitialData } from './utils/api';
import { CONFIG } from './config';
import { Briefcase, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('portfolio_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employeesData, setEmployeesData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                <h1>ระบบรายงานผลงานรายบุคคล</h1>
                <p>Company Performance & Portfolio System</p>
              </div>
            </div>

            <div className="user-nav-section">
              <div className="user-profile-summary">
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
                    {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : currentUser.role === 'executive' ? 'ผู้บริหาร (Executive)' : `ฝ่าย${currentUser.department}`}
                  </span>
                </div>
              </div>
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
        </>
      )}
    </div>
  );
}
