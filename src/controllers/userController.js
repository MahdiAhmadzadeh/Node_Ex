// کنترلرها: دریافت req/res و فراخوانی سرویس‌ها + پاسخ مناسب
import * as userService from '../services/userService.js'

// ثبت‌نام (با آپلود آواتار)
export const register = async (req, res) => {
  try {
    const filePath = req.file ? req.file.path : null
    const { user, tokens } = await userService.registerUser(req.body, filePath)
    res.status(201).json({
      message: 'ثبت‌نام موفق',
      user,
      tokens // شامل accessToken و refreshToken
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'خطای سرور' })
  }
}

// ورود
export const login = async (req, res) => {
  try {
    const { user, tokens } = await userService.loginUser(req.body)
    res.json({ user, tokens })
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message || 'خطای ورود' })
  }
}

// رفرش توکن (دریافت refreshToken و صدور accessToken جدید + refresh جدید)
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body
    const result = await userService.refreshAccessToken(refreshToken)
    res.json(result)
  } catch (err) {
    res.status(err.status || 401).json({ error: err.message || 'رفرش ناموفق' })
  }
}

// خروج (باطل کردن یک refreshToken)
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body
    await userService.logoutUser(refreshToken)
    res.json({ message: 'خروج انجام شد' })
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' })
  }
}

// لیست کاربران با pagination (فقط ادمین)
export const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' })
  }
}

// پروفایل کاربر لاگین‌شده
export const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id)
    if (!user) return res.status(404).json({ error: 'کاربر پیدا نشد' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور' })
  }
}
