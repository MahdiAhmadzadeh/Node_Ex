// Middleware کنترل نقش‌ها (RBAC ساده)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'ابتدا وارد شوید' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز' })
    }
    next()
  }
}
