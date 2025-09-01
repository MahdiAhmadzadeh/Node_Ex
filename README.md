# User API (Node + Express + PostgreSQL + Prisma + JWT Access/Refresh + Nodemailer + Upload + Roles + Pagination)

> همه‌ی فایل‌ها با **کامنت فارسی** و توضیح کافی نوشته شده‌اند.

## راه‌اندازی سریع

```bash
cp .env.example .env   # متغیرها را تنظیم کنید (DATABASE_URL و SMTP)
npm install
npx prisma generate
npx prisma migrate dev --name init_postgres
npm run seed
npm run dev
```

### مسیرهای مهم
- `POST /api/users/register` — ثبت‌نام + آپلود آواتار + ارسال ایمیل خوش‌آمد + صدور access/refresh
- `POST /api/users/login` — ورود + ایمیل اعلان ورود + صدور access/refresh
- `POST /api/users/refresh` — صدور access جدید با refresh و چرخش رفرش
- `POST /api/users/logout` — ابطال یک refreshToken
- `GET /api/users?search=&page=&limit=&sortBy=&sortOrder=` — فقط ادمین، همراه pagination
- `GET /api/users/me` — پروفایل کاربر فعلی

### نکته امنیتی
- رفرش‌توکن‌ها در دیتابیس **به‌صورت هش‌شده** ذخیره می‌شوند (bcrypt).
- Access Token کوتاه‌مدت است (`TOKEN_EXPIRES_IN=15m`).
- رفرش‌توکن هنگام `/refresh` **چرخش** می‌شود (توکن قدیمی revoke و جدید صادر می‌گردد).
