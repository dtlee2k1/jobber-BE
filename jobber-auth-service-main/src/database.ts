import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Sequelize } from 'sequelize';
import envConfig from '@auth/config';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const sequelize = new Sequelize(process.env.MYSQL_DB!, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export async function databaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info('AuthService Mysql database connection has been established successfully.');
  } catch (error) {
    logger.error('AuthService - Unable to connect to database.');
    logger.log({ level: 'error', message: `AuthService databaseConnection() method error: ${error}` });
  }
}
