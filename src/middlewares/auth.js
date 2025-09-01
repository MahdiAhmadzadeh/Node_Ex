// Middleware محافظت مسیرها با بررسی access token
import { verifyAccessToken } from '../utils/jwt.js'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const protect = async (req, res, next) => {
  try {
    // هدر Authorization باید به شکل: "Bearer <token>" باشد
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'توکن ارسال نشده' })
    }
    const token = header.split(' ')[1]

    // بررسی صحت و اعتبار توکن
    const payload = verifyAccessToken(token)

    // پیدا کردن کاربر برای اطمینان از وجود و وضعیت
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return res.status(401).json({ error: 'کاربر وجود ندارد' })

    // الصاق اطلاعات ساده کاربر به درخواست
    req.user = { id: user.id, email: user.email, role: user.role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده' })
  }
}
