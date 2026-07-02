// การตั้งค่าสำหรับระบบ Portfolio
export const CONFIG = {
  // วาง Web App URL ที่ได้จากการ Deploy Google Apps Script ในช่องนี้
  // เช่น: "https://script.google.com/macros/s/AKfycbz.../exec"
  // หากเป็นค่าว่าง ระบบจะดึงข้อมูลจำลอง (Mock Data) จากเครื่องขึ้นมาทำงานอัตโนมัติเพื่อให้คุณทดลองใช้งานได้ทันที
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw1ESHOKGLiAKQvBX2p3Bh93zXB6kT4pPlyb8V3YoXmd2aRtJVgmEjV8Q3AnoW1_KmO3Q/exec",
  
  // รายชื่อฝ่าย (Departments) ในระบบ
  DEPARTMENTS: ["ผู้บริหาร", "ฝ่ายทะเบียน", "ฝ่ายปกครอง", "ฝ่ายสิ่งแวดล้อมฯ", "ฝ่ายรายได้", "ฝ่ายรักษาความสะอาดฯ", "ฝ่ายการคลัง", "ฝ่ายการศึกษา", "ฝ่ายพัฒนาชุมชนฯ", "ฝ่ายโยธา", "ฝ่ายเทศกิจ"],
  
  // รายชื่อเดือนสำหรับรายงานผล
  MONTHS: [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ]
};

// ฟังก์ชันจัดรูปแบบชื่อฝ่ายเพื่อป้องกันคำว่า "ฝ่าย" ซ้ำซ้อน (เช่น "ฝ่ายฝ่ายทะเบียน")
export const formatDept = (dept) => {
  if (!dept) return '-';
  const str = String(dept).trim();
  if (
    str === 'ผู้บริหาร' ||
    str === 'ทั้งหมด' ||
    str === 'ทั้งหมดทุกฝ่าย' ||
    str.startsWith('ฝ่าย') ||
    str.startsWith('กอง') ||
    str.startsWith('สำนัก') ||
    str.startsWith('แผนก') ||
    str.startsWith('ศูนย์')
  ) {
    return str;
  }
  return `ฝ่าย${str}`;
};

// ฟังก์ชันเปรียบเทียบชื่อฝ่ายว่าตรงกันหรือไม่ โดยตัดคำนำหน้าออกเพื่อความถูกต้อง
export const isSameDept = (d1, d2) => {
  if (!d1 || !d2) return false;
  const clean = (s) => String(s).replace(/^(ฝ่าย|กอง|สำนัก|แผนก|ศูนย์)/, '').trim();
  return clean(d1) === clean(d2) || String(d1).trim() === String(d2).trim();
};

// ฟังก์ชันคำนวณเปรียบเทียบผลงานจริง (ความคืบหน้าเฉลี่ย) กับเดือนก่อนหน้า
export const calcMonthComparison = (list) => {
  if (!list || !Array.isArray(list) || list.length === 0) {
    return { text: '0% vs. เดือนที่แล้ว', badgeClass: 'badge-done', diff: 0 };
  }

  // จัดกลุ่มงานตามปีและเดือน (แปลงชื่อเดือนเป็น index 0-11 เพื่อเรียงลำดับ)
  const monthMap = {};
  list.forEach(item => {
    if (!item || !item.month || !item.year) return;
    const y = parseInt(item.year, 10);
    const mIdx = CONFIG.MONTHS.indexOf(String(item.month).trim());
    if (isNaN(y) || mIdx === -1) return;
    const key = `${y}-${String(mIdx).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = { year: y, monthIdx: mIdx, items: [] };
    }
    monthMap[key].items.push(item);
  });

  const sortedKeys = Object.keys(monthMap).sort().reverse();
  if (sortedKeys.length === 0) {
    return { text: '0% vs. เดือนที่แล้ว', badgeClass: 'badge-done', diff: 0 };
  }

  // เดือนล่าสุดที่มีข้อมูล
  const latestKey = sortedKeys[0];
  const latestGroup = monthMap[latestKey];
  const latestAvg = latestGroup.items.length > 0
    ? Math.round(latestGroup.items.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / latestGroup.items.length)
    : 0;

  // หาเดือนก่อนหน้า (ตามปฏิทินของเดือนล่าสุด หรือเดือนก่อนหน้าที่อยู่ในข้อมูล)
  let prevYear = latestGroup.year;
  let prevMonthIdx = latestGroup.monthIdx - 1;
  if (prevMonthIdx < 0) {
    prevMonthIdx = 11;
    prevYear -= 1;
  }
  const prevKey = `${prevYear}-${String(prevMonthIdx).padStart(2, '0')}`;

  const prevGroup = monthMap[prevKey] || (sortedKeys.length > 1 ? monthMap[sortedKeys[1]] : null);
  
  if (!prevGroup || prevGroup.items.length === 0) {
    return { text: `+${latestAvg}% vs. เดือนที่แล้ว`, badgeClass: 'badge-done', diff: latestAvg };
  }

  const prevAvg = Math.round(prevGroup.items.reduce((acc, curr) => acc + parseInt(curr.completion_rate || 0, 10), 0) / prevGroup.items.length);
  const diff = latestAvg - prevAvg;
  const sign = diff > 0 ? '+' : '';
  const badgeClass = diff >= 0 ? 'badge-done' : 'badge-delayed';

  return {
    text: `${sign}${diff}% vs. เดือนที่แล้ว`,
    badgeClass,
    diff
  };
};
