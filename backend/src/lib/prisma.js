const { PrismaClient } = require('@prisma/client');
const { withPgBouncerParam } = require('./prismaUrl');

const databaseUrl = withPgBouncerParam(process.env.DATABASE_URL);

module.exports = new PrismaClient({
  datasources: {
    db: { url: databaseUrl }
  }
});
