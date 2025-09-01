// همه‌ی اسکیمای Joi برای اعتبارسنجی
import Joi from 'joi'

// ثبت‌نام کاربر جدید
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'نام الزامی است',
    'string.min': 'نام حداقل 3 کاراکتر باشد'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'ایمیل معتبر نیست',
    'string.empty': 'ایمیل الزامی است'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'رمز عبور حداقل 6 کاراکتر باشد'
  }),
  role: Joi.string().valid('ADMIN', 'USER').optional()
})

// ورود کاربر
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// درخواست رفرش توکن
export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'رفرش توکن الزامی است'
  })
})

// پارامترهای pagination و جست‌وجو
export const usersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('name','email','createdAt','role').optional(),
  sortOrder: Joi.string().valid('asc','desc').optional(),
  search: Joi.string().allow('').optional()
})
