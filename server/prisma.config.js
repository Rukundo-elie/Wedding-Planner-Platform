const dotenv = require('dotenv');
const path = require('path');
const { defineConfig } = require('prisma/config');

dotenv.config({ path: path.join(__dirname, '.env') });

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
