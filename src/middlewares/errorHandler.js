// Middleware نهایی برای مدیریت خطاها
export function notFound (req, res, next) {
  res.status(404).json({ error: 'آدرس مورد نظر یافت نشد' })
}

export function errorHandler (err, req, res, next) {
  console.error('❌ Error:', err)
  const status = err.status || 500
  const message = err.message || 'خطای داخلی سرور'
  res.status(status).json({ error: message })
}
