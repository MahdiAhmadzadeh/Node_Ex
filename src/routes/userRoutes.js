// تعریف مسیرهای مرتبط با کاربر
import express from 'express'
import { register, login, refresh, logout, getAllUsers, getMe } from '../controllers/userController.js'
import validateWithJoi from '../middlewares/validate.js'
import { registerSchema, loginSchema, refreshSchema, usersQuerySchema } from '../schemas/userSchemas.js'
import { protect } from '../middlewares/auth.js'
import { authorizeRoles } from '../middlewares/roles.js'
import upload from '../middlewares/upload.js'

const router = express.Router()

// ثبت‌نام با آپلود آواتار (avatar)
router.post('/register',
  upload.single('avatar'),
  validateWithJoi({ body: registerSchema }),
  register
)

// ورود و دریافت توکن‌ها
router.post('/login', validateWithJoi({ body: loginSchema }), login)

// دریافت accessToken جدید با refreshToken + چرخش رفرش
router.post('/refresh', validateWithJoi({ body: refreshSchema }), refresh)

// خروج (باطل کردن همان refreshToken سمت سرور)
router.post('/logout', validateWithJoi({ body: refreshSchema }), logout)

// لیست کاربران با pagination (فقط ADMIN)
router.get('/',
  protect,
  authorizeRoles('ADMIN'),
  validateWithJoi({ query: usersQuerySchema }),
  getAllUsers
)

// پروفایل خود کاربر
router.get('/me', protect, getMe)

export default router
