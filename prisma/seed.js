// اسکریپت seeding برای ایجاد یک ادمین اولیه
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main () {
  // بررسی وجود کاربر ادمین با ایمیل مشخص
  const email = 'admin@local'
  const exist = await prisma.user.findUnique({ where: { email } })

  if (!exist) {
    const hashed = await bcrypt.hash('admin123', 10) // هش کردن رمز اولیه
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashed,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin created: admin@local / admin123')
  } else {
    console.log('ℹ️ Admin already exists')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
