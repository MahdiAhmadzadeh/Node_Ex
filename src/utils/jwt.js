// ماژول JWT: تولید و بررسی access token (کوتاه‌مدت)
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

// کلید سری و زمان انقضای access token از .env
const SECRET = process.env.JWT_SECRET || 'verysecretkey123'
const EXPIRES = process.env.TOKEN_EXPIRES_IN || '15m'

// تولید access token با اطلاعات حداقلی کاربر
export const generateAccessToken = (user) => {
  // payload فقط شامل داده‌های ضروری باشد (id/role/email)
  const payload = { id: user.id, role: user.role, email: user.email }
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES })
}

// اعتبارسنجی و decode کردن توکن
export const verifyAccessToken = (token) => {
  return jwt.verify(token, SECRET)
}
