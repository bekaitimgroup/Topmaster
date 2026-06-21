'use strict';
/**
 * Usage: node prisma/make-executor.js <phone|email>
 * Example: node prisma/make-executor.js +998901234567
 * Promotes an existing user to executor and creates their profile.
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
    // Create the user if they don't exist yet
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
  const existing = await prisma.executorProfile.findUnique({ where: { userId: user.id } });
  if (!existing) {
    await prisma.executorProfile.create({
      data: {
        userId: user.id,
        city: 'Toshkent',
        bio: 'Test executor account',
        badge: 'verified',
      },
    });
    console.log('Created executor profile');
  } else {
    console.log('Executor profile already exists');
  }

  console.log('\nDone! User can now log in and visit /executor/dashboard');
  console.log('Phone:', user.phone ?? '(none)');
  console.log('Email:', user.email ?? '(none)');
  console.log('Role:', user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
