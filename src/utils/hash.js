// ابزارهای هش/مقایسه پسورد و هش رفرش‌توکن
// نکته: برای رفرش‌توکن هم از bcrypt استفاده می‌کنیم تا حتی اگر دیتابیس لو رفت، توکن واقعی لو نرود.
import bcrypt from 'bcryptjs'

// هش کردن یک مقدار متنی (برای پسورد یا رفرش توکن)
export const hashValue = async (plain) => {
  const salt = await bcrypt.genSalt(10)     // تولید salt با هزینه محاسباتی 10
  return await bcrypt.hash(plain, salt)     // خروجی هش
}

// مقایسه مقدار خام با مقدار هش‌شده
export const compareValue = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed)
}

// برای سازگاری با نسخه قبلی:
export const hashPassword = hashValue
export const comparePassword = compareValue
