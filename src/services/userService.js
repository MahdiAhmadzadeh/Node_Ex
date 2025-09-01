// لایه سرویس: تمام منطق کاربری شامل ثبت‌نام، ورود، رفرش توکن، خروج، لیست کاربران
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { hashPassword, comparePassword, hashValue, compareValue } from '../utils/hash.js'
import { generateAccessToken } from '../utils/jwt.js'
import { sendWelcomeEmail, sendLoginAlertEmail } from '../utils/email.js'
import { buildPagination } from '../utils/pagination.js'

const prisma = new PrismaClient()

// تولید رندم رفرش توکن ایمن (۳۲ بایت تصادفی به base64url)
function generateRefreshTokenString() {
  return crypto.randomBytes(32).toString('base64url')
}

// ساخت و ذخیره رفرش‌توکن (با هش) + برگرداندن رشته واقعی برای کاربر
async function issueRefreshToken(userId) {
  const token = generateRefreshTokenString()               // توکن واقعی که به کاربر می‌دهیم
  const tokenHash = await hashValue(token)                 // هش برای ذخیره در DB
  const expiresAt = new Date(Date.now() + parseExpiry(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'))

  const created = await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt }
  })

  return { token, record: created }
}

// کمک‌کننده برای تبدیل رشته‌های  "7d" یا "15m" به میلی‌ثانیه
function parseExpiry(str) {
  // پشتیبانی از s/m/h/d
  const m = /^([0-9]+)([smhd])$/.exec(String(str).trim())
  if (!m) {
    // اگر فرمت نا‌معتبر بود، پیش‌فرض 7 روز
    return 7 * 24 * 60 * 60 * 1000
  }
  const n = Number(m[1])
  const unit = m[2]
  const map = { s: 1000, m: 60*1000, h: 60*60*1000, d: 24*60*60*1000 }
  return n * map[unit]
}

// ثبت‌نام کاربر جدید
export const registerUser = async (data, filePath) => {
  // جلوگیری از ایمیل تکراری
  const exists = await prisma.user.findUnique({ where: { email: data.email } })
  if (exists) {
    const err = new Error('ایمیل قبلاً ثبت شده است')
    err.status = 409
    throw err
  }

  // هش کردن رمز عبور
  const hashed = await hashPassword(data.password)
  // ایجاد کاربر
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role || 'USER',
      avatar: filePath || null
    }
  })

  // ارسال ایمیل خوش‌آمد (غیر بحرانی؛ خطا را نادیده می‌گیریم تا ثبت‌نام خراب نشود)
  sendWelcomeEmail(user.email, user.name).catch(() => {})

  // صدور توکن‌ها
  const accessToken = generateAccessToken(user)
  const { token: refreshToken } = await issueRefreshToken(user.id)

  return { user: publicUser(user), tokens: { accessToken, refreshToken } }
}

// ورود کاربر
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await comparePassword(password, user.password))) {
    const err = new Error('ایمیل یا رمز اشتباه است')
    err.status = 401
    throw err
  }

  // ارسال ایمیل اعلان ورود (اختیاری)
  sendLoginAlertEmail(user.email, user.name).catch(() => {})

  // ساخت توکن‌ها
  const accessToken = generateAccessToken(user)
  const { token: refreshToken } = await issueRefreshToken(user.id)

  return { user: publicUser(user), tokens: { accessToken, refreshToken } }
}

// رفرش کردن access token با دریافت refreshToken
export const refreshAccessToken = async (refreshToken) => {
  // پیدا کردن رکوردی که هش‌اش با این توکن بخواند
  // چون bcrypt یک‌طرفه است، باید همه توکن‌های کاربر را چک کنیم؛
  // اما برای بهینه‌سازی، می‌توانیم همه توکن‌ها را مرور کنیم و اولین match را قبول کنیم
  const tokens = await prisma.refreshToken.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } }
  })

  let tokenRecord = null
  for (const t of tokens) {
    const match = await compareValue(refreshToken, t.tokenHash)
    if (match) { tokenRecord = t; break }
  }
  if (!tokenRecord) {
    const err = new Error('رفرش توکن نامعتبر است')
    err.status = 401
    throw err
  }

  // کاربر مربوطه
  const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } })
  if (!user) {
    const err = new Error('کاربر یافت نشد')
    err.status = 404
    throw err
  }

  // چرخش توکن: توکن قبلی را revoke و توکن جدید بساز
  const { token: newRefresh, record } = await issueRefreshToken(user.id)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true, replacedBy: record.id }
  })

  // ساخت access token جدید
  const accessToken = generateAccessToken(user)
  return { accessToken, refreshToken: newRefresh, user: publicUser(user) }
}

// خروج کاربر: ابطال یک رفرش‌توکن خاص
export const logoutUser = async (refreshToken) => {
  // مشابه بالایی، پیدا کردن رکورد متناظر با این توکن
  const tokens = await prisma.refreshToken.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } }
  })
  let tokenRecord = null
  for (const t of tokens) {
    const match = await compareValue(refreshToken, t.tokenHash)
    if (match) { tokenRecord = t; break }
  }
  if (!tokenRecord) return { success: true } // اگر نبود هم مشکلی نیست

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revoked: true }
  })
  return { success: true }
}

// لیست کاربران با pagination + جست‌وجو + مرتب‌سازی
export const getUsers = async (query) => {
  const { page, limit, skip, orderBy, where } = buildPagination(query)

  // دریافت لیست
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true }
    }),
    prisma.user.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)
  return {
    items,
    meta: { page, limit, total, totalPages }
  }
}

// دریافت پروفایل کاربر با id
export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true }
  })
}

// کمک‌کننده برای حذف اطلاعات حساس
function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, createdAt: u.createdAt }
}
