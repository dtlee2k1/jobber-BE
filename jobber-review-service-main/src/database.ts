import { winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@review/config';
import { Pool } from 'pg';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'reviewDatabaseServer', 'debug');

const pool = new Pool({
  host: `${envConfig.DATABASE_HOST}`,
  user: `${envConfig.DATABASE_USER}`,
  database: `${envConfig.DATABASE_NAME}`,
  password: `${envConfig.DATABASE_PASSWORD}`,
  port: 5432
});

pool.on('error', (err) => {
  logger.log({ level: 'error', message: `pg client error: ${err}` });
  process.exit(-1);
});

const createTableText = `
  CREATE TABLE IF NOT EXISTS reviews (
    "id" SERIAL PRIMARY KEY,
    "gigId" text NOT NULL,
    "reviewerId" text NOT NULL,
    "orderId" text NOT NULL,
    "sellerId" text NOT NULL,
    "review" text NOT NULL,
    "reviewerImage" text NOT NULL,
    "reviewerUsername" text NOT NULL,
    "country" text NOT NULL,
    "reviewType" text NOT NULL,
    "rating" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp DEFAULT CURRENT_DATE
  );

  CREATE INDEX IF NOT EXISTS "gigId_idx" ON reviews ("gigId");

  CREATE INDEX IF NOT EXISTS "sellerId_idx" ON reviews ("sellerId");
`;

async function databaseConnection() {
  try {
    await pool.connect();
    logger.info('ReviewService Postgresql database connection has been established successfully');
    await pool.query(createTableText);
  } catch (error) {
    logger.error('ReviewService - Unable to connect to database');
    logger.log({ level: 'error', message: `ReviewService databaseConnection() method error: ${error}` });
  }
}

export { databaseConnection, pool };
