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
