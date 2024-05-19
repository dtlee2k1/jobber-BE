import envConfig from '@review/config';
import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Channel } from 'amqplib';
import { createConnection } from '@review/queues/connection';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'reviewProducer', 'debug');

export async function publishFanoutMessage(channel: Channel, exchangeName: string, message: string, logMessage: string) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    await channel.assertExchange(exchangeName, 'fanout');
    channel.publish(exchangeName, '', Buffer.from(message));
    logger.info(logMessage);
  } catch (error) {
    logger.log({ level: 'error', message: `ReviewService ReviewProducer publishFanoutMessage() method error: ${error}` });
  }
}
