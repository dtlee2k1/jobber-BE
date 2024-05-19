import envConfig from '@auth/config';
import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/queues/connection';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'authProducer', 'debug');

export async function publishDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));

    logger.info(logMessage);
  } catch (error) {
    logger.log({ level: 'error', message: `AuthService AuthProducer publishDirectMessage() method error: ${error}` });
  }
}
