import React, { useState, useEffect } from 'react';
import { addPerformance, updatePerformance } from '../utils/api';
import { CONFIG } from '../config';
import { CheckCircle2, AlertCircle, Clock, Link as LinkIcon, Plus, Save } from 'lucide-react';

export default function PerformanceForm({ currentUser, editingData, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(CONFIG.MONTHS[new Date().getMonth()]);
  const [completionRate, setCompletionRate] = useState('100');
  const [status, setStatus] = useState('Done');
  const [refLink, setRefLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // โหลดข้อมูลเก่ากรณีที่เป็นโหมดแก้ไข
  useEffect(() => {
    if (editingData) {
      setTitle(editingData.title || '');
      setDetails(editingData.details || '');
      setYear(editingData.year || new Date().getFullYear().toString());
      setMonth(editingData.month || CONFIG.MONTHS[new Date().getMonth()]);
      setCompletionRate(editingData.completion_rate?.toString() || '100');
      setStatus(editingData.status || 'Done');
      setRefLink(editingData.ref_link || '');
    }
  }, [editingData]);

  // ซิงค์สถานะตามเปอร์เซ็นต์ความสำเร็จเพื่อความสะดวก
  const handlePercentChange = (val) => {
    setCompletionRate(val);
    const numVal = parseInt(val, 10);
    if (numVal === 100) {
      setStatus('Done');
    } else if (numVal > 0 && status === 'Done') {
      setStatus('In Progress');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      setError('กรุณากรอกหัวข้อผลงานและรายละเอียดงานให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');

    const performancePayload = {
      employee_id: currentUser.id,
      year,
      month,
      title: title.trim(),
      details: details.trim(),
      completion_rate: parseInt(completionRate, 10),
      status,
      ref_link: refLink.trim()
    };

    if (editingData) {
      performancePayload.id = editingData.id;
    }

    try {
      if (editingData) {
        await updatePerformance(performancePayload);
      } else {
        await addPerformance(performancePayload);
      }
      onSuccess(editingData ? 'แก้ไขผลงานเรียบร้อยแล้ว' : 'บันทึกผลงานเรียบร้อยแล้ว');
      // ล้างค่าฟอร์มเฉพาะกรณีเพิ่มใหม่
      if (!editingData) {
        setTitle('');
        setDetails('');
        setCompletionRate('100');
        setStatus('Done');
        setRefLink('');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={editingData ? "" : "card"}>
      {!editingData && <h3 className="card-title">📝 บันทึกผลงานประจำเดือนใหม่</h3>}
      
      {error && (
        <div style={{
          backgroundColor: '#fff1f2',
          color: '#e11d48',
          border: '1px solid #ffe4e6',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">ปี (ค.ศ.)</label>
            <input
              type="number"
              className="form-input"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รอบประจำเดือน</label>
            <select
              className="form-select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            >
              {CONFIG.MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">หัวข้อผลงาน / งานที่ทำ</label>
          <input
            type="text"
            className="form-input"
            placeholder="เช่น ออกแบบหน้าจอแดชบอร์ดสรุปผลงาน, แก้ไขบั๊กของระบบหลังบ้าน"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">รายละเอียดของผลงานและกระบวนการทำงาน</label>
          <textarea
            className="form-textarea"
            rows="4"
            placeholder="อธิบายรายละเอียดผลการทำงาน อุปสรรค ปัญหา และความสำเร็จที่เกิดขึ้นในเดือนนี้..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          ></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">เปอร์เซ็นต์ความคืบหน้า ({completionRate}%)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={completionRate}
                onChange={(e) => handlePercentChange(e.target.value)}
                style={{ flex: 1, accentColor: 'var(--primary)' }}
              />
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                style={{ width: '70px', padding: '6px' }}
                value={completionRate}
                onChange={(e) => handlePercentChange(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">สถานะการทำงาน</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Done">🟢 Done (เสร็จสิ้น)</option>
              <option value="In Progress">🟡 In Progress (กำลังดำเนินการ)</option>
              <option value="Delayed">🔴 Delayed (ล่าช้ากว่ากำหนด)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">ลิงก์อ้างอิงเอกสารหรือไฟล์งาน (ถ้ามี)</label>
          <div style={{ position: 'relative' }}>
            <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-light)' }} />
            <input
              type="url"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="https://drive.google.com/... หรือ https://github.com/..."
              value={refLink}
              onChange={(e) => setRefLink(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              ยกเลิก
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              'กำลังบันทึก...'
            ) : (
              <>
                {editingData ? <Save size={16} /> : <Plus size={16} />}
                {editingData ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูลผลงาน'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
