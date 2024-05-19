import { winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@users/config';
import mongoose from 'mongoose';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'usersDatabaseServer', 'debug');

export async function databaseConnection() {
  try {
    await mongoose.connect(`${envConfig.DATABASE_URL}`);
    logger.info('UsersService MongoDB database connection has been established successfully.');
  } catch (error) {
    logger.error('UsersService - Unable to connect to database.');
    logger.log({ level: 'error', message: `UsersService databaseConnection() method error: ${error}` });
  }
}
