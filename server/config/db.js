const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

let prisma;

try {
  const dbUrlString = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/wedding_planner';
  const dbUrl = new URL(dbUrlString);

  const config = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password || ''),
    database: dbUrl.pathname.replace(/^\//, ''),
    connectionLimit: 5,
  };

  const adapter = new PrismaMariaDb(config);
  prisma = new PrismaClient({ adapter });
  
  console.log(`Prisma Client initialized with MariaDB adapter targeting database: ${config.database}`);
} catch (error) {
  console.error('Failed to initialize Prisma Client with MariaDB adapter:', error);
  // Fallback to standard initialization if adapter fails
  prisma = new PrismaClient();
}

module.exports = prisma;
