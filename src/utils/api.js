import { CONFIG } from '../config';
import { mockEmployees, mockPerformance } from '../data/mockData';

// คีย์สำหรับจัดการข้อมูลใน localStorage เมื่อไม่ได้ต่อ GAS
const LOCAL_EMPLOYEES_KEY = 'portfolio_employees';
const LOCAL_PERFORMANCE_KEY = 'portfolio_performance';

// เริ่มต้นข้อมูลจำลองลงใน localStorage หากยังไม่มีข้อมูล
const initializeLocalStorage = () => {
  if (!localStorage.getItem(LOCAL_EMPLOYEES_KEY)) {
    localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(mockEmployees));
  }
  if (!localStorage.getItem(LOCAL_PERFORMANCE_KEY)) {
    localStorage.setItem(LOCAL_PERFORMANCE_KEY, JSON.stringify(mockPerformance));
  }
};

// ดึงข้อมูลพนักงานและผลงาน
export const getInitialData = async () => {
  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=getInitialData`);
      const data = await response.json();
      if (data.status === 'success') {
        return {
          employees: data.employees,
          performance: data.performance
        };
      }
      throw new Error(data.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheet');
    } catch (error) {
      console.error('GAS API Fetch Error, falling back to Local Storage:', error);
      // ถ้าเชื่อมต่อผ่านอินเทอร์เน็ตล้มเหลว ให้กลับไปใช้ LocalStorage
    }
  }

  // Local Storage Fallback
  initializeLocalStorage();
  return {
    employees: JSON.parse(localStorage.getItem(LOCAL_EMPLOYEES_KEY)),
    performance: JSON.parse(localStorage.getItem(LOCAL_PERFORMANCE_KEY))
  };
};

// จัดการเข้าสู่ระบบ
export const login = async (citizenId, password) => {
  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // ใช้ text/plain เพื่อเลี่ยงการเกิด preflight CORS error ใน GAS
        },
        body: JSON.stringify({
          action: 'login',
          citizen_id: citizenId,
          email: citizenId, // ส่ง email ไปด้วยเพื่อป้องกันปัญหา GAS เวอร์ชันเดิมที่ยังเช็คตัวแปร email อยู่ (undefined === undefined)
          password
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data.user;
      }
      throw new Error(data.message || 'เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง');
    } catch (error) {
      console.error('GAS Login Error:', error);
      if (CONFIG.GOOGLE_SCRIPT_URL) {
        throw error; // ส่งต่อ error หากตั้งใจจะต่อ GAS แล้วแต่เกิดปัญหา
      }
    }
  }

  // Local Storage Login
  initializeLocalStorage();
  const employees = JSON.parse(localStorage.getItem(LOCAL_EMPLOYEES_KEY));
  const user = employees.find(emp => {
    const empId = emp.citizen_id !== undefined ? emp.citizen_id : emp.email;
    return empId !== undefined && empId !== null && String(empId).trim() === String(citizenId || '').trim() && String(emp.password) === String(password);
  });
  if (user) {
    const userData = { ...user };
    delete userData.password;
    return userData;
  }
  throw new Error('เลขบัตรประชาชนหรือรหัสผ่านไม่ถูกต้อง (LocalStorage Mode)');
};

// ลงทะเบียนพนักงานใหม่
export const addEmployee = async (employeeData) => {
  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addEmployee',
          data: employeeData
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data;
      }
      throw new Error(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } catch (error) {
      console.error('GAS Add Employee Error:', error);
      if (CONFIG.GOOGLE_SCRIPT_URL) throw error;
    }
  }

  // Local Storage Add
  initializeLocalStorage();
  const employees = JSON.parse(localStorage.getItem(LOCAL_EMPLOYEES_KEY));
  const exists = employees.some(emp => emp.citizen_id === employeeData.citizen_id || emp.id === employeeData.id);
  if (exists) {
    throw new Error('รหัสพนักงานหรือเลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว (LocalStorage Mode)');
  }
  employees.push({
    ...employeeData,
    role: employeeData.role || 'employee',
    image_url: employeeData.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  });
  localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(employees));
  return { status: 'success', message: 'ลงทะเบียนพนักงานในเครื่องสำเร็จ' };
};

// เพิ่มผลงานประจำเดือน
export const addPerformance = async (performanceData) => {
  const newPerf = {
    id: performanceData.id || 'PERF_' + new Date().getTime(),
    ...performanceData,
    timestamp: new Date().toISOString()
  };

  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addPerformance',
          data: newPerf
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data;
      }
      throw new Error(data.message || 'เกิดข้อผิดพลาดในการบันทึกผลงาน');
    } catch (error) {
      console.error('GAS Add Performance Error:', error);
      if (CONFIG.GOOGLE_SCRIPT_URL) throw error;
    }
  }

  // Local Storage Add
  initializeLocalStorage();
  const performances = JSON.parse(localStorage.getItem(LOCAL_PERFORMANCE_KEY));
  performances.push(newPerf);
  localStorage.setItem(LOCAL_PERFORMANCE_KEY, JSON.stringify(performances));
  return { status: 'success', message: 'บันทึกผลงานลงในเครื่องสำเร็จ' };
};

// แก้ไขผลงานประจำเดือน
export const updatePerformance = async (performanceData) => {
  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'updatePerformance',
          data: performanceData
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data;
      }
      throw new Error(data.message || 'เกิดข้อผิดพลาดในการแก้ไขผลงาน');
    } catch (error) {
      console.error('GAS Update Performance Error:', error);
      if (CONFIG.GOOGLE_SCRIPT_URL) throw error;
    }
  }

  // Local Storage Update
  initializeLocalStorage();
  const performances = JSON.parse(localStorage.getItem(LOCAL_PERFORMANCE_KEY));
  const index = performances.findIndex(perf => perf.id.toString() === performanceData.id.toString());
  if (index !== -1) {
    performances[index] = {
      ...performances[index],
      ...performanceData,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_PERFORMANCE_KEY, JSON.stringify(performances));
    return { status: 'success', message: 'แก้ไขผลงานในเครื่องสำเร็จ' };
  }
  throw new Error('ไม่พบข้อมูลผลงานที่ต้องการแก้ไข (LocalStorage Mode)');
};

// เปลี่ยนรหัสผ่านของตัวเอง
export const changePassword = async (employeeId, oldPassword, newPassword) => {
  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'changePassword',
          employee_id: employeeId,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await response.json();
      if (data.status === 'success') {
        return data;
      }
      throw new Error(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } catch (error) {
      console.error('GAS Change Password Error:', error);
      if (CONFIG.GOOGLE_SCRIPT_URL) throw error;
    }
  }

  // Local Storage Change Password
  initializeLocalStorage();
  const employees = JSON.parse(localStorage.getItem(LOCAL_EMPLOYEES_KEY));
  const index = employees.findIndex(emp => emp.id === employeeId);
  if (index === -1) {
    throw new Error('ไม่พบข้อมูลพนักงานในระบบ');
  }
  if (employees[index].password !== oldPassword) {
    throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
  }
  employees[index].password = newPassword;
  localStorage.setItem(LOCAL_EMPLOYEES_KEY, JSON.stringify(employees));
  return { status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
};
