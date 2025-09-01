// ابزار ساده‌ی pagination و مرتب‌سازی/جست‌وجو برای Prisma
// ورودی: query اوبجکت اکسپرس (page, limit, sortBy, sortOrder, search)
// خروجی: { skip, take, orderBy, where, meta }
export function buildPagination(query) {
  // تبدیل مقادیر ورودی به عدد و تعیین پیش‌فرض‌ها
  const page = Math.max(parseInt(query.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100)
  const skip = (page - 1) * limit

  // مرتب‌سازی (مثلاً sortBy=createdAt&sortOrder=desc)
  const sortBy = query.sortBy || 'createdAt'
  const sortOrder = (query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
  const orderBy = { [sortBy]: sortOrder }

  // جست‌وجوی ساده روی name یا email
  const search = (query.search || '').trim()
  const where = search
    ? {
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    : {}

  return { page, limit, skip, orderBy, where }
}
