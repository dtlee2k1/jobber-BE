import { winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@order/config';
import mongoose from 'mongoose';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'orderDatabaseServer', 'debug');

export async function databaseConnection() {
  try {
    await mongoose.connect(`${envConfig.DATABASE_URL}`);
    logger.info('OrderService MongoDB database connection has been established successfully');
  } catch (error) {
    logger.error('OrderService - Unable to connect to database.');
    logger.log({ level: 'error', message: `OrderService databaseConnection() method error: ${error}` });
  }
}
