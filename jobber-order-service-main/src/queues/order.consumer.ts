import envConfig from '@order/config';
import { winstonLogger } from '@dtlee2k1/jobber-shared';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from '@order/queues/connection';
import { updateOrderReview } from '@order/services/order.service';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'orderConsumer', 'debug');

export async function consumeReviewFanoutMessages(channel: Channel) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-review';
    const queueName = 'order-review-queue';

    await channel.assertExchange(exchangeName, 'fanout');
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, '');

    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      await updateOrderReview(JSON.parse(msg!.content.toString()));
      channel.ack(msg!);
    });
  } catch (error) {
    logger.log({ level: 'error', message: `OrderService OrderConsumer consumeReviewFanoutMessages() method error: ${error}` });
  }
}
