// فایل پیکربندی اصلی اپلیکیشن Express
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import userRoutes from './routes/userRoutes.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()

// پشتیبانی از JSON و فرم-urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// امنیت و لاگ
app.use(helmet())
app.use(morgan('dev'))

// CORS (در صورت نیاز تنظیمات دقیق‌تر انجام دهید)
app.use(cors({ origin: true, credentials: true }))

// کوکی پارسر (اگر خواستید رفرش‌توکن را در کوکی نگه دارید)
app.use(cookieParser())

// سرو فایل‌های استاتیک برای آپلودها
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)))

// مسیرهای API
app.use('/api/users', userRoutes)

// سلامت
app.get('/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }))

// Middleware‌های انتهایی
app.use(notFound)
app.use(errorHandler)

export default app
