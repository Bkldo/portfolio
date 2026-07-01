/**
 * ระบบ Google Apps Script สำหรับเป็น API ของระบบ Portfolio ผลงานรายเดือน
 * 
 * วิธีการติดตั้ง:
 * 1. เปิด Google Sheets
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเก่าออกให้หมดแล้วนำโค้ดนี้ไปวางแทนที่
 * 4. กดบันทึก (Save)
 * 5. กดเรียกใช้ฟังก์ชัน setupSheets เพื่อสร้างตารางข้อมูลเริ่มต้น
 * 6. กด Deploy (การใช้งานจัดทำ) > New deployment (การใช้งานจัดทำใหม่)
 * 7. เลือกประเภทเป็น "Web app" (แอปพลิเคชันเว็บ)
 * 8. ตั้งค่าดังนี้:
 *    - Execute as: "Me" (ตัวฉันเอง)
 *    - Who has access: "Anyone" (ทุกคน) -> สำคัญมากเพื่อให้ระบบ React เข้าถึงได้
 * 9. คัดลอก "Web app URL" ที่ได้มานำไปวางในไฟล์ src/config.js ของโปรเจกต์ React
 */

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. ตาราง Employees (ข้อมูลพนักงาน)
  var empSheet = ss.getSheetByName('Employees');
  if (!empSheet) {
    empSheet = ss.insertSheet('Employees');
    empSheet.appendRow(['id', 'name', 'position', 'department', 'email', 'password', 'role', 'image_url']);
    
    // ใส่ข้อมูลผู้ใช้ระดับ admin, ผู้บริหาร และพนักงานจำลองตัวอย่าง
    empSheet.appendRow(['ADM001', 'สมบูรณ์ ระบบดี', 'System Administrator', 'ไอที', 'admin@company.com', '123456', 'admin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150']);
    empSheet.appendRow(['EMP001', 'ผู้บริหาร สูงสุด', 'ประธานเจ้าหน้าที่บริหาร (CEO)', 'ผู้บริหาร', 'ceo@company.com', '123456', 'executive', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150']);
    empSheet.appendRow(['EMP002', 'สมชาย รักดี', 'Software Engineer', 'ไอที', 'somchai@company.com', '123456', 'employee', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150']);
    empSheet.appendRow(['EMP003', 'สมศรี สวยงาม', 'Marketing Manager', 'การตลาด', 'somsri@company.com', '123456', 'employee', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150']);
    empSheet.appendRow(['EMP004', 'วันชัย ทรงพลัง', 'HR Specialist', 'บุคคล', 'wanchai@company.com', '123456', 'employee', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150']);
  }
  
  // 2. ตาราง Performance (ผลงานรายเดือน)
  var perfSheet = ss.getSheetByName('Performance');
  if (!perfSheet) {
    perfSheet = ss.insertSheet('Performance');
    perfSheet.appendRow(['id', 'employee_id', 'year', 'month', 'title', 'details', 'completion_rate', 'status', 'ref_link', 'timestamp']);
    
    // ใส่ข้อมูลผลงานจำลองตัวอย่าง
    var now = new Date().toISOString();
    perfSheet.appendRow(['PERF001', 'EMP002', '2026', 'มิถุนายน', 'พัฒนาระบบหลังบ้านใหม่', 'ย้ายฐานข้อมูลไปใช้งาน Cloud และปรับปรุงความเร็วระบบขึ้น 40%', '100', 'Done', 'https://github.com/project', now]);
    perfSheet.appendRow(['PERF002', 'EMP002', '2026', 'กรกฎาคม', 'พัฒนาหน้าจอแดชบอร์ดสรุปผล', 'เชื่อมต่อข้อมูลผลงานและกราฟรายงานผลส่งต่อให้ผู้บริหาร', '80', 'In Progress', '', now]);
    perfSheet.appendRow(['PERF003', 'EMP003', '2026', 'มิถุนายน', 'แคมเปญการตลาด Q2', 'ยอดขายโตขึ้น 15% จากการโปรโมตผ่านโซเชียลมีเดีย', '100', 'Done', 'https://marketing-report.com', now]);
    perfSheet.appendRow(['PERF004', 'EMP004', '2026', 'มิถุนายน', 'สรรหาพนักงานใหม่ต้อนรับปี 2026', 'รับพนักงานใหม่เข้าทำงานในฝ่ายไอทีและบัญชีครบตามเป้าหมาย', '100', 'Done', '', now]);
  }
}

// ช่วยดึงข้อมูลทั้งหมดจากแต่ละ Sheet แปลงเป็น JSON Object Array
function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    var hasData = false;
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
      if (row[j] !== "") hasData = true;
    }
    if (hasData) {
      data.push(obj);
    }
  }
  return data;
}

// ฟังก์ชันหลักในการรับ GET Request
function doGet(e) {
  var action = e.parameter.action;
  var result = {};
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'getInitialData') {
      result = {
        status: 'success',
        employees: getSheetData(ss, 'Employees'),
        performance: getSheetData(ss, 'Performance')
      };
    } else {
      result = { status: 'error', message: 'ไม่พบ Action ที่ต้องการ' };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ฟังก์ชันหลักในการรับ POST Request
function doPost(e) {
  var result = {};
  
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'login') {
      var email = postData.email;
      var password = postData.password;
      
      var employees = getSheetData(ss, 'Employees');
      var user = employees.find(function(emp) {
        return emp.email === email && emp.password.toString() === password.toString();
      });
      
      if (user) {
        // ลบรหัสผ่านก่อนส่งกลับ
        var userData = Object.assign({}, user);
        delete userData.password;
        result = { status: 'success', user: userData };
      } else {
        result = { status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
      }
      
    } else if (action === 'addEmployee') {
      var empSheet = ss.getSheetByName('Employees');
      var newEmp = postData.data; // { id, name, position, department, email, password, role, image_url }
      
      // ตรวจสอบข้อมูลซ้ำ
      var employees = getSheetData(ss, 'Employees');
      var exists = employees.some(function(emp) { return emp.email === newEmp.email || emp.id === newEmp.id; });
      
      if (exists) {
        result = { status: 'error', message: 'รหัสพนักงานหรืออีเมลนี้มีอยู่ในระบบแล้ว' };
      } else {
        empSheet.appendRow([
          newEmp.id,
          newEmp.name,
          newEmp.position,
          newEmp.department,
          newEmp.email,
          newEmp.password || '123456',
          newEmp.role || 'employee',
          newEmp.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        ]);
        result = { status: 'success', message: 'ลงทะเบียนพนักงานสำเร็จ' };
      }
      
    } else if (action === 'addPerformance') {
      var perfSheet = ss.getSheetByName('Performance');
      var newPerf = postData.data; // { id, employee_id, year, month, title, details, completion_rate, status, ref_link }
      
      perfSheet.appendRow([
        newPerf.id || 'PERF_' + new Date().getTime(),
        newPerf.employee_id,
        newPerf.year,
        newPerf.month,
        newPerf.title,
        newPerf.details,
        newPerf.completion_rate,
        newPerf.status,
        newPerf.ref_link || '',
        new Date().toISOString()
      ]);
      result = { status: 'success', message: 'บันทึกผลงานประจำเดือนสำเร็จ' };
      
    } else if (action === 'updatePerformance') {
      var perfSheet = ss.getSheetByName('Performance');
      var updatedPerf = postData.data; // { id, title, details, completion_rate, status, ref_link, ... }
      
      var dataRange = perfSheet.getDataRange();
      var values = dataRange.getValues();
      var foundIdx = -1;
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][0].toString() === updatedPerf.id.toString()) {
          foundIdx = i + 1; // 1-based index for row
          break;
        }
      }
      
      if (foundIdx !== -1) {
        // แก้ไขคอลัมน์ยกเว้น id, employee_id, timestamp
        // คอลัมน์ลำดับ: id (1), employee_id (2), year (3), month (4), title (5), details (6), completion_rate (7), status (8), ref_link (9), timestamp (10)
        perfSheet.getRange(foundIdx, 3).setValue(updatedPerf.year);
        perfSheet.getRange(foundIdx, 4).setValue(updatedPerf.month);
        perfSheet.getRange(foundIdx, 5).setValue(updatedPerf.title);
        perfSheet.getRange(foundIdx, 6).setValue(updatedPerf.details);
        perfSheet.getRange(foundIdx, 7).setValue(updatedPerf.completion_rate);
        perfSheet.getRange(foundIdx, 8).setValue(updatedPerf.status);
        perfSheet.getRange(foundIdx, 9).setValue(updatedPerf.ref_link || '');
        perfSheet.getRange(foundIdx, 10).setValue(new Date().toISOString());
        
        result = { status: 'success', message: 'แก้ไขข้อมูลผลงานสำเร็จ' };
      } else {
        result = { status: 'error', message: 'ไม่พบรหัสผลงานที่ต้องการแก้ไข' };
      }
      
    } else {
      result = { status: 'error', message: 'ไม่พบ Action ที่ต้องการ' };
    }
    
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
