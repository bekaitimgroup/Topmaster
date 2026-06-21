'use strict';
/**
 * Usage: node prisma/make-executor.js <phone|email>
 * Example: node prisma/make-executor.js bek@aitimgroup.com
 *
 * Promotes a user to executor and creates an unlimited 1-year subscription
 * for every category so they can see and bid on all tasks.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Usage: node prisma/make-executor.js <phone|email>');
    process.exit(1);
  }

  const where = identifier.includes('@')
    ? { email: identifier }
    : { phone: identifier };

  let user = await prisma.user.findUnique({ where });

  if (!user) {
    const data = identifier.includes('@')
      ? { email: identifier, role: 'executor', isPhoneVerified: false }
      : { phone: identifier, role: 'executor', isPhoneVerified: true };
    user = await prisma.user.create({ data });
    console.log('Created new user:', user.id);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'executor' },
    });
    console.log('Promoted existing user to executor:', user.id);
  }

  // Create executor profile if missing
  let profile = await prisma.executorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.executorProfile.create({
      data: {
        userId: user.id,
        city: 'Toshkent',
        bio: 'Test executor account',
        badge: 'verified',
      },
    });
    console.log('Created executor profile:', profile.id);
  } else {
    console.log('Executor profile exists:', profile.id);
  }

  // Create unlimited 1-year subscriptions for ALL categories
  const categories = await prisma.category.findMany({
    where: { parentId: null }, // top-level only
    select: { id: true, nameRu: true },
  });

  console.log(`\nCreating subscriptions for ${categories.length} categories...`);
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  let created = 0;
  for (const cat of categories) {
    const existing = await prisma.subscription.findFirst({
      where: { executorId: profile.id, categoryId: cat.id, isActive: true },
    });
    if (existing) {
      console.log(`  skip ${cat.nameRu} (already subscribed)`);
      continue;
    }
    await prisma.subscription.create({
      data: {
        executorId: profile.id,
        categoryId: cat.id,
        planType: 'unlimited_30',
        bidsTotal: 9999,
        bidsUsed: 0,
        priceUzs: 0n,
        startsAt: now,
        expiresAt: oneYearLater,
        isActive: true,
      },
    });
    console.log(`  + ${cat.nameRu}`);
    created++;
  }

  console.log(`\n✅ Done! Created ${created} new subscriptions.`);
  console.log('User can now:');
  console.log('  1. Log in at topmaster.uz/auth');
  console.log('  2. Go to topmaster.uz/executor/dashboard to see task feed');
  console.log('  3. Click any task to view details and place a bid');
  console.log('\nPhone:', user.phone ?? '(none)');
  console.log('Email:', user.email ?? '(none)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
