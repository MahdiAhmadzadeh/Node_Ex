// Middleware عمومی برای اعتبارسنجی ورودی‌ها با Joi
// استفاده: validateWithJoi({ body: schema, params: schema, query: schema })
import Joi from 'joi'

const validateWithJoi = (schemas = {}) => {
  return (req, res, next) => {
    try {
      // برای هر بخش از درخواست که اسکیمای Joi دارد، validate انجام می‌دهیم
      for (const key of ['body', 'params', 'query']) {
        if (schemas[key]) {
          const { error, value } = schemas[key].validate(req[key], { abortEarly: false, stripUnknown: true })
          if (error) {
            // جمع کردن همه پیام‌های خطا به صورت آرایه خوانا
            const details = error.details.map(d => d.message)
            return res.status(400).json({ error: 'اعتبارسنجی نامعتبر', details })
          }
          // جایگزین کردن داده‌ی تمیز شده
          req[key] = value
        }
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default validateWithJoi
