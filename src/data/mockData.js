// ข้อมูลจำลองสำหรับทดลองใช้งานเมื่อยังไม่ได้เชื่อมต่อ Google Sheets API

export const mockEmployees = [
  {
    id: "EMP001",
    name: "ดร.มานพ แสนสุข",
    position: "ประธานเจ้าหน้าที่บริหาร (CEO)",
    department: "ผู้บริหาร",
    email: "ceo@company.com",
    password: "password123",
    role: "executive",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
  },
  {
    id: "EMP002",
    name: "สมชาย รักดี",
    position: "Software Developer Senior",
    department: "ไอที",
    email: "somchai@company.com",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  {
    id: "EMP003",
    name: "พัชรา ศิริกุล",
    position: "Digital Marketer",
    department: "การตลาด",
    email: "patchara@company.com",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: "EMP004",
    name: "ธนาวุฒิ ยอดงาม",
    position: "Senior Accountant",
    department: "บัญชี",
    email: "thanawut@company.com",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: "EMP005",
    name: "นภาพร ชัยชนะ",
    position: "HR Officer",
    department: "บุคคล",
    email: "napaporn@company.com",
    password: "password123",
    role: "employee",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  },
  {
    id: "EMP006",
    name: "นรากร ลาภมาก",
    position: "Sales Representative",
    department: "ขาย",
    email: "narakorn@company.com",
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
    title: "จัดทำแคมเปญส่งเสริมการขายช่วงกลางปี Mid-Year Sale 6.6",
    details: "ออกแบบป้ายแบนเนอร์โฆษณา จัดวางงบประมาณ Facebook Ads แคมเปญสร้างการรับรู้สำหรับสินค้าใหม่ ยอดเข้าชมเว็บไซต์ทะลุเป้าหมาย 120%",
    completion_rate: "100",
    status: "Done",
    ref_link: "https://facebook.com/midyearsale66",
    timestamp: "2026-05-30T10:30:00Z"
  },
  {
    id: "PERF_003",
    employee_id: "EMP004",
    year: "2026",
    month: "พฤษภาคม",
    title: "ปิดงบการเงินไตรมาสที่ 1 ประจำปี 2569",
    details: "ตรวจสอบเอกสารใบกำกับภาษี ใบเสร็จรับเงิน กระทบยอดเงินฝากธนาคาร และสรุปส่งงบดุลให้กับกรมพัฒนาธุรกิจการค้าทันตามเวลา",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-05-29T16:00:00Z"
  },
  {
    id: "PERF_004",
    employee_id: "EMP005",
    year: "2026",
    month: "พฤษภาคม",
    title: "จัดอบรมพัฒนาทักษะพนักงานประจำปี (Soft Skills & Design Thinking)",
    details: "ติดต่อวิทยากรภายนอก ดำเนินการจองสถานที่ จัดทำแบบประเมินผลการฝึกอบรม ค่าความพึงพอใจโดยรวมเฉลี่ย 4.85 จาก 5 คะแนน",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-05-28T09:00:00Z"
  },
  {
    id: "PERF_005",
    employee_id: "EMP006",
    year: "2026",
    month: "พฤษภาคม",
    title: "ขยายฐานลูกค้ากลุ่มโรงพยาบาลและสาธารณสุข",
    details: "เข้าพบคอนแทคติดต่อโรงพยาบาลรัฐขนาดใหญ่ 3 แห่ง นำเสนอโซลูชันระบบไอทีของบริษัท และปิดยอดขายได้รวมมูลค่ากว่า 1.2 ล้านบาท",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-05-27T11:00:00Z"
  },

  // เดือน มิถุนายน
  {
    id: "PERF_006",
    employee_id: "EMP002",
    year: "2026",
    month: "มิถุนายน",
    title: "ปรับปรุงประสิทธิภาพ Database และความเร็วเว็บไซต์หลังบ้าน",
    details: "เขียน Query Optimization ในฐานข้อมูลหลัก เพิ่ม Index ทำระบบแคชหน้าหลัก ลดการตอบสนองของเซิร์ฟเวอร์เฉลี่ยลงจาก 1.5 วินาที เหลือ 0.3 วินาที",
    completion_rate: "100",
    status: "Done",
    ref_link: "",
    timestamp: "2026-06-29T10:00:00Z"
  },
  {
    id: "PERF_007",
    employee_id: "EMP003",
    year: "2026",
    month: "มิถุนายน",
    title: "วิเคราะห์พฤติกรรมกลุ่มลูกค้าและวิจัยตลาดคู่แข่ง (Market Analysis)",
    details: "ทำแบบสอบถามออนไลน์และวิจัยคู่แข่ง 3 อันดับแรก เพื่อนำมาพัฒนาคุณสมบัติผลิตภัณฑ์ใหม่ ค้นพบช่องว่างทางการขายในกลุ่มผู้สูงอายุ",
    completion_rate: "90",
    status: "Done",
    ref_link: "https://drive.google.com/report1",
    timestamp: "2026-06-30T14:00:00Z"
  },
  {
    id: "PERF_008",
    employee_id: "EMP004",
    year: "2026",
    month: "มิถุนายน",
    title: "ย้ายการลงบันทึกบัญชีสู่ระบบคลาวด์โปรแกรม Express Online",
    details: "ศึกษาและนำเข้าฐานข้อมูลบัญชีเดิมเข้าสู่โครงสร้างโปรแกรมใหม่เพื่อการทำงานจากที่ใดก็ได้ ปัจจุบันย้ายข้อมูลสำเร็จแล้ว 80% ติดปัญหาตรวจยอดกระทบจากปีก่อนหน้าเล็กน้อย",
    completion_rate: "80",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-06-30T11:00:00Z"
  },
  {
    id: "PERF_009",
    employee_id: "EMP005",
    year: "2026",
    month: "มิถุนายน",
    title: "ทบทวนโครงสร้างการประเมินผลงานครึ่งปีแรก (Mid-Year Appraisal)",
    details: "จัดทำแบบฟอร์มการประเมิน ส่งต่อให้ผู้จัดการแต่ละฝ่ายเพื่อประเมินลูกทีม รวบรวมและสรุปผลคะแนนเบื้องต้น มีสถิติพนักงานประเมินแล้ว 95%",
    completion_rate: "95",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-06-28T09:30:00Z"
  },
  {
    id: "PERF_010",
    employee_id: "EMP006",
    year: "2026",
    month: "มิถุนายน",
    title: "ดูแลยอดขายและบริการลูกค้ารายเดิมแบบสัญญารายปี",
    details: "เจรจาต่อสัญญาบริการรักษาระบบไอทีรายปี (MA) สำหรับลูกค้ารายเดิม 4 บริษัท ทำสัญญาใหม่สำเร็จ แต่ล่าช้ากว่ากำหนดเดิมเนื่องจากขั้นตอนกฎหมายฝั่งลูกค้า",
    completion_rate: "60",
    status: "Delayed",
    ref_link: "",
    timestamp: "2026-06-29T15:00:00Z"
  },

  // เดือน กรกฎาคม (กำลังดำเนินการ)
  {
    id: "PERF_011",
    employee_id: "EMP002",
    year: "2026",
    month: "กรกฎาคม",
    title: "พัฒนาระบบ Portfolio พนักงาน (โปรเจกต์ปัจจุบัน)",
    details: "ออกแบบฐานข้อมูลใน Google Sheet เขียนสคริปต์เชื่อมต่อ GAS และพัฒนาหน้า UI ด้วย React สำหรับรายงานผู้บริหาร",
    completion_rate: "40",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-07-01T10:00:00Z"
  },
  {
    id: "PERF_012",
    employee_id: "EMP003",
    year: "2026",
    month: "กรกฎาคม",
    title: "วางแผนโฆษณาสำหรับไตรมาสที่ 3 (Q3 Marketing Plan)",
    details: "จัดเตรียมงบโฆษณาสำหรับเปิดตัวสินค้าช่วงสิงหาคม ประสานงานกับฝ่ายสร้างสรรค์ในการถ่ายทำสื่อวิดีโอแอด",
    completion_rate: "20",
    status: "In Progress",
    ref_link: "",
    timestamp: "2026-07-01T09:00:00Z"
  }
];
