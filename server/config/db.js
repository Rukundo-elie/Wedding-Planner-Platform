const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

console.log('Prisma Client initialized with native engine.');

module.exports = prisma;
