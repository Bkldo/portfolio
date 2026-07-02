// ข้อมูลจำลองสำหรับทดลองใช้งานเมื่อยังไม่ได้เชื่อมต่อ Google Sheets API

export const mockEmployees = [
  {
    id: "ADM001",
    name: "สมบูรณ์ ระบบดี",
    position: "System Administrator",
    department: "ฝ่ายทะเบียน",
    citizen_id: "1999999999991",
    password: "password123",
    role: "admin",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "EMP001",
    name: "ดร.มานพ แสนสุข",
    position: "ประธานเจ้าหน้าที่บริหาร (CEO)",
    department: "ผู้บริหาร",
    citizen_id: "1100100100001",
    password: "password123",
    role: "executive",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
  },
  {
    id: "EMP002",
    name: "สมชาย รักดี",
    position: "หัวหน้าฝ่ายทะเบียน",
    department: "ฝ่ายทะเบียน",
    citizen_id: "1100200200002",
    password: "password123",
    role: "head",
    image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  {
    id: "EMP003",
    name: "พัชรา ศิริกุล",
    position: "เจ้าหน้าที่ทะเบียนชำนาญงาน",
    department: "ฝ่ายทะเบียน",
    citizen_id: "1100300300003",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: "EMP004",
    name: "ธนาวุฒิ ยอดงาม",
    position: "หัวหน้าฝ่ายการคลัง",
    department: "ฝ่ายการคลัง",
    citizen_id: "1100400400004",
    password: "password123",
    role: "head",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "EMP005",
    name: "นภาพร ชัยชนะ",
    position: "นักวิชาการเงินและบัญชี",
    department: "ฝ่ายการคลัง",
    citizen_id: "1100500500005",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  },
  {
    id: "EMP006",
    name: "นรากร ลาภมาก",
    position: "เจ้าหน้าที่การศึกษา",
    department: "ฝ่ายการศึกษา",
    citizen_id: "1100600600006",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
  }
];

export const mockPerformance = [
  // เดือน พฤษภาคม
  {
    id: "PERF_001",
    employee_id: "EMP002",
    year: "2026",
    month: "พฤษภาคม",
    title: "พัฒนาระบบจ่ายเงินออนไลน์ (Payment Gateway Integration)",
    details: "เขียนโปรแกรมเชื่อมต่อ API ของธนาคารกสิกรและไทยพาณิชย์ ทำระบบทดสอบความปลอดภัยแซนด์บ็อกซ์ พร้อมทำระบบแจ้งเตือนผ่าน Line Notify คืบหน้า 100% เรียบร้อย",
    completion_rate: "100",
    status: "Done",
    ref_link: "https://github.com/company/payment-gateway",
    timestamp: "2026-05-30T10:00:00Z"
  },
  {
    id: "PERF_002",
    employee_id: "EMP003",
    year: "2026",
    month: "พฤษภาคม",
    title: "แคมเปญโซเชียลมีเดีย Q2",
    details: "เพิ่มยอด Follower ได้ 20% ผ่านช่องทาง Instagram, Facebook และ TikTok มีเนื้อหาที่ไวรัลถึง 3 ชิ้น",
    completion_rate: "100",
    status: "Done",
    ref_link: "https://analytics.google.com/dashboard",
    timestamp: "2026-05-28T14:00:00Z"
  },
  {
    id: "PERF_003",
    employee_id: "EMP004",
    year: "2026",
    month: "พฤษภาคม",
    title: "ปิดงบการเงินไตรมาส 1/2026",
    details: "ตรวจสอบรายรับรายจ่ายทุกรายการ ทำรายงานสรุปงบเสนอผู้บริหาร และส่งข้อมูลให้สำนักงานบัญชีเรียบร้อย",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-05-25T09:00:00Z"
  },
  // เดือน มิถุนายน
  {
    id: "PERF_004",
    employee_id: "EMP002",
    year: "2026",
    month: "มิถุนายน",
    title: "ย้ายระบบขึ้น Cloud Infrastructure",
    details: "ย้ายเซิร์ฟเวอร์จาก On-Premise ไป AWS ลดค่าใช้จ่ายรายเดือน 30% และเพิ่ม Uptime เป็น 99.9%",
    completion_rate: "100",
    status: "Done",
    ref_link: "https://aws.amazon.com/console",
    timestamp: "2026-06-20T10:00:00Z"
  },
  {
    id: "PERF_005",
    employee_id: "EMP003",
    year: "2026",
    month: "มิถุนายน",
    title: "จัดงาน Product Launch Event",
    details: "วางแผนและจัดงานเปิดตัวสินค้าใหม่ มีผู้เข้าร่วม 500 คน สร้าง Lead ใหม่ได้ 150 ราย",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-06-15T11:00:00Z"
  },
  {
    id: "PERF_006",
    employee_id: "EMP005",
    year: "2026",
    month: "มิถุนายน",
    title: "โครงการ Employee Engagement Survey",
    details: "ออกแบบแบบสำรวจความพึงพอใจพนักงาน เก็บข้อมูลครบ 95% ของพนักงานทั้งหมด วิเคราะห์ผลและเสนอแผนปรับปรุง",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-06-10T13:00:00Z"
  },
  {
    id: "PERF_007",
    employee_id: "EMP006",
    year: "2026",
    month: "มิถุนายน",
    title: "ขยายฐานลูกค้ากลุ่ม SME",
    details: "ติดต่อลูกค้าใหม่ 30 ราย ปิดการขายสำเร็จ 12 ราย คิดเป็นรายได้เพิ่ม 850,000 บาท",
    completion_rate: "90",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-06-18T15:00:00Z"
  },
  // เดือน กรกฎาคม
  {
    id: "PERF_008",
    employee_id: "EMP002",
    year: "2026",
    month: "กรกฎาคม",
    title: "พัฒนาระบบ Portfolio Dashboard",
    details: "สร้างระบบเว็บแอปพลิเคชันเพื่อบันทึกผลงานรายเดือนของพนักงาน เชื่อมต่อ Google Sheets API พร้อม Deploy บน GitHub Pages",
    completion_rate: "80",
    status: "In Progress",
    ref_link: "https://github.com/portfolio-dashboard",
    timestamp: "2026-07-01T10:00:00Z"
  },
  {
    id: "PERF_009",
    employee_id: "EMP004",
    year: "2026",
    month: "กรกฎาคม",
    title: "ตรวจสอบภาษีครึ่งปี 2026",
    details: "รวบรวมเอกสารและคำนวณภาษีหัก ณ ที่จ่ายครึ่งปีแรก เตรียมยื่นแบบ ภ.ง.ด. 51",
    completion_rate: "60",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-07-01T09:00:00Z"
  },
  {
    id: "PERF_010",
    employee_id: "EMP005",
    year: "2026",
    month: "กรกฎาคม",
    title: "จัดอบรม Soft Skills ให้พนักงานใหม่",
    details: "จัดเตรียมหลักสูตรอบรมทักษะการสื่อสารและการทำงานเป็นทีม สำหรับพนักงานใหม่ 8 คนที่เข้าร่วมเมื่อ Q2",
    completion_rate: "40",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-07-01T14:00:00Z"
  }
];
