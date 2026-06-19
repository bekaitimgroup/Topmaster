import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { nameUz: "Usta xizmatlar", nameRu: "Ремонт и строительство", subscriptionPriceUzs: 500000n, sortOrder: 1 },
  { nameUz: "Yuk tashish",    nameRu: "Грузоперевозки",          subscriptionPriceUzs: 200000n, sortOrder: 2 },
  { nameUz: "Tozalash",       nameRu: "Уборка и помощь",         subscriptionPriceUzs: 140000n, sortOrder: 3 },
  { nameUz: "Kuryer",         nameRu: "Курьерские услуги",        subscriptionPriceUzs: 120000n, sortOrder: 4 },
  { nameUz: "Repetitor",      nameRu: "Репетиторы и обучение",    subscriptionPriceUzs: 80000n,  sortOrder: 5 },
  { nameUz: "Go'zallik",      nameRu: "Красота и здоровье",       subscriptionPriceUzs: 140000n, sortOrder: 6 },
  { nameUz: "Kompyuter yordam", nameRu: "Компьютерная помощь",   subscriptionPriceUzs: 100000n, sortOrder: 7 },
  { nameUz: "Texnika ta'miri", nameRu: "Ремонт техники",          subscriptionPriceUzs: 160000n, sortOrder: 8 },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.sortOrder.toString() },
      update: cat,
      create: cat,
    });
  }
  // Re-seed with auto UUID
  await prisma.category.deleteMany();
  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  const count = await prisma.category.count();
  console.log(`✅ Seeded ${count} categories`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
