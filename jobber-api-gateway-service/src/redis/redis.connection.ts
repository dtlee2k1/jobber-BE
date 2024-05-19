import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { envConfig } from '@gateway/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'gatewayRedisConnection', 'debug');

class RedisConnection {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: `${envConfig.REDIS_HOST}` });
  }

  async redisConnect() {
    try {
      await this.client.connect();
      logger.info(`GatewayService Redis Connection: ${await this.client.ping()}`);
      this.cacheError();
    } catch (error) {
      logger.log('error', 'GatewayService redisConnect() method error:', error);
    }
  }

  private cacheError() {
    this.client.on('error', (error: unknown) => {
      logger.error(error);
    });
  }
}

const redisConnection = new RedisConnection();
export default redisConnection;
