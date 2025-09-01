// ماژول ارسال ایمیل با nodemailer
// این ماژول یک تابع عمومی sendEmail و چند تابع کاربردی (welcome/reset) ارائه می‌دهد
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// ایجاد transporter بر اساس متغیرهای محیطی
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                         // آدرس سرور SMTP
  port: Number(process.env.SMTP_PORT) || 587,          // پورت (معمولاً 587)
  secure: false,                                       // برای 465 true (SSL) و برای 587 false
  auth: {
    user: process.env.SMTP_USER,                       // نام کاربری SMTP
    pass: process.env.SMTP_PASS                        // رمز عبور SMTP
  }
})

// تابع کمکی: ارسال ایمیل ساده HTML + متن
export async function sendEmail({ to, subject, html, text }) {
  // آدرس فرستنده از .env
  const from = process.env.MAIL_FROM || 'User API <no-reply@example.com>'
  const info = await transporter.sendMail({ from, to, subject, html, text })
  // در محیط توسعه با Ethereal می‌توانید پیش‌نمایش URL را در لاگ ببینید
  if (nodemailer.getTestMessageUrl) {
    const url = nodemailer.getTestMessageUrl(info)
    if (url) console.log('Preview URL:', url)
  }
  return info
}

// نمونه: ایمیل خوش‌آمدگویی
export async function sendWelcomeEmail(to, name) {
  const subject = 'خوش آمدید 👋'
  const text = `سلام ${name}! به سرویس ما خوش آمدید.`
  const html = `<h2>سلام ${name}!</h2><p>به سرویس ما خوش آمدید 🎉</p>`
  return sendEmail({ to, subject, text, html })
}

// نمونه: ایمیل اطلاع‌رسانی ورود
export async function sendLoginAlertEmail(to, name) {
  const subject = 'ورود به حساب کاربری'
  const text = `سلام ${name}! یک ورود موفق به حساب شما ثبت شد. اگر شما نبودید، رمزتان را تغییر دهید.`
  const html = `<p>سلام <b>${name}</b>،</p><p>یک ورود موفق به حساب شما ثبت شد.</p>`
  return sendEmail({ to, subject, text, html })
}
