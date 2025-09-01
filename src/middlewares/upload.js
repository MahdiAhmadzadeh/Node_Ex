// پیکربندی Multer برای آپلود تصویر آواتار
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = process.env.UPLOAD_DIR || 'uploads'

// اطمینان از وجود پوشه آپلود
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// تنظیمات محل و نام فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)     // پسوند فایل اصلی
    cb(null, `${Date.now()}-${file.fieldname}${ext}`) // نام جدید یکتا
  }
})

// فیلتر نوع فایل برای جلوگیری از آپلود‌های ناخواسته
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('فقط فایل‌های JPG و PNG مجاز هستند'))
  }
  cb(null, true)
}

// محدودیت حجم فایل (۲ مگابایت)
const limits = { fileSize: 2 * 1024 * 1024 }

const upload = multer({ storage, fileFilter, limits })
export default upload
