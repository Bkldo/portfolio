import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ตั้งค่าเป็น relative path เพื่อให้แสดงผลบน GitHub Pages ในโฟลเดอร์ย่อยได้ถูกต้อง
})
