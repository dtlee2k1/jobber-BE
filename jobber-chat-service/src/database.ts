import { winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@chat/config';
import mongoose from 'mongoose';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'chatDatabaseServer', 'debug');

export async function databaseConnection() {
  try {
    await mongoose.connect(`${envConfig.DATABASE_URL}`);
    logger.info('ChatService MongoDB database connection has been established successfully.');
  } catch (error) {
    logger.error('ChatService - Unable to connect to database.');
    logger.log({ level: 'error', message: `ChatService databaseConnection() method error: ${error}` });
  }
}
