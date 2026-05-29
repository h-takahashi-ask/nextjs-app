import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!, {
    schema: 'financial_dashboard',
  }),
})

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 外部キー制約の順番で削除
  await prisma.invoice.deleteMany()
  await prisma.revenue.deleteMany()
  await prisma.user.deleteMany()
  await prisma.customer.deleteMany()

  await prisma.user.createMany({
    data: [
      {
        id: '410544b2-4001-4271-9855-fec4b6a6442a',
        name: 'User',
        email: 'user@nextmail.com',
        password: hashedPassword,
      },
    ],
  })

  await prisma.customer.createMany({
    data: [
      { id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', name: 'Evil Rabbit',       email: 'evil@rabbit.com',    imageUrl: '/customers/evil-rabbit.png' },
      { id: '3958dc9e-712f-4377-85e9-fec4b6a6442a', name: 'Delba de Oliveira', email: 'delba@oliveira.com', imageUrl: '/customers/delba-de-oliveira.png' },
      { id: '3958dc9e-742f-4377-85e9-fec4b6a6442a', name: 'Lee Robinson',      email: 'lee@robinson.com',   imageUrl: '/customers/lee-robinson.png' },
      { id: '76d65c26-f784-44a2-ac19-586678f7c2f2', name: 'Michael Novotny',   email: 'michael@novotny.com',imageUrl: '/customers/michael-novotny.png' },
      { id: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9', name: 'Amy Burns',         email: 'amy@burns.com',      imageUrl: '/customers/amy-burns.png' },
      { id: '13d07535-c59e-4157-a011-f8d2ef4e0cbb', name: 'Balazs Orban',      email: 'balazs@orban.com',   imageUrl: '/customers/balazs-orban.png' },
    ],
  })

  await prisma.invoice.createMany({
    data: [
      { customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', amount: 15795, status: 'pending', date: new Date('2022-12-06') },
      { customerId: '3958dc9e-712f-4377-85e9-fec4b6a6442a', amount: 20348, status: 'pending', date: new Date('2022-11-14') },
      { customerId: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9', amount:  3040, status: 'paid',    date: new Date('2022-10-29') },
      { customerId: '76d65c26-f784-44a2-ac19-586678f7c2f2', amount: 44800, status: 'paid',    date: new Date('2023-09-10') },
      { customerId: '13d07535-c59e-4157-a011-f8d2ef4e0cbb', amount: 34577, status: 'pending', date: new Date('2023-08-05') },
      { customerId: '3958dc9e-742f-4377-85e9-fec4b6a6442a', amount: 54246, status: 'pending', date: new Date('2023-07-16') },
      { customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', amount:   666, status: 'pending', date: new Date('2023-06-27') },
      { customerId: '76d65c26-f784-44a2-ac19-586678f7c2f2', amount: 32545, status: 'paid',    date: new Date('2023-06-09') },
      { customerId: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9', amount:  1250, status: 'paid',    date: new Date('2023-06-17') },
      { customerId: '13d07535-c59e-4157-a011-f8d2ef4e0cbb', amount:  8546, status: 'paid',    date: new Date('2023-06-07') },
      { customerId: '3958dc9e-712f-4377-85e9-fec4b6a6442a', amount:   500, status: 'paid',    date: new Date('2023-08-19') },
      { customerId: '13d07535-c59e-4157-a011-f8d2ef4e0cbb', amount:  8945, status: 'paid',    date: new Date('2023-06-03') },
      { customerId: '3958dc9e-742f-4377-85e9-fec4b6a6442a', amount:  1000, status: 'paid',    date: new Date('2022-06-05') },
    ],
  })

  await prisma.revenue.createMany({
    data: [
      { month: 'Jan', revenue: 2000 },
      { month: 'Feb', revenue: 1800 },
      { month: 'Mar', revenue: 2200 },
      { month: 'Apr', revenue: 2500 },
      { month: 'May', revenue: 2300 },
      { month: 'Jun', revenue: 3200 },
      { month: 'Jul', revenue: 3500 },
      { month: 'Aug', revenue: 3700 },
      { month: 'Sep', revenue: 2500 },
      { month: 'Oct', revenue: 2800 },
      { month: 'Nov', revenue: 3000 },
      { month: 'Dec', revenue: 4800 },
    ],
  })

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
