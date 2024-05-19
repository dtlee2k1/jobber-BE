import { IEmailLocals, winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from './connection';
import { sendEmail } from './mail.transport';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

export async function consumeAuthEmailMessages(channel: Channel) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-auth-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);

    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      // Send emails
      const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: `${envConfig.CLIENT_URL}`,
        appIcon: 'https://cdn.freelogovectors.net/wp-content/uploads/2020/12/jobber-logo.png',
        username,
        verifyLink,
        resetLink
      };
      await sendEmail(template, receiverEmail, locals);
      channel.ack(msg!);
    });
  } catch (error) {
    logger.log({ level: 'error', message: `NotificationService EmailConsumer consumeAuthEmailMessages() method error: ${error}` });
  }
}

export async function consumeOrderEmailMessages(channel: Channel) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'jobber-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const orderEmailQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(orderEmailQueue.queue, exchangeName, routingKey);

    channel.consume(orderEmailQueue.queue, async (msg: ConsumeMessage | null) => {
      // Send emails
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      } = JSON.parse(msg!.content.toString());

      const locals: IEmailLocals = {
        appLink: `${envConfig.CLIENT_URL}`,
        appIcon: 'https://cdn.freelogovectors.net/wp-content/uploads/2020/12/jobber-logo.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      };
      if (template === 'orderPlaced') {
        await sendEmail('orderPlaced', receiverEmail, locals);
      } else if (template === 'orderReceipt') {
        await sendEmail('orderReceipt', receiverEmail, locals);
      } else {
        // other order templates: orderDelivered, orderExtension, ...
        await sendEmail(template, receiverEmail, locals);
      }

      channel.ack(msg!);
    });
  } catch (error) {
    logger.log({ level: 'error', message: `NotificationService EmailConsumer consumeOrderEmailMessages() method error: ${error}` });
  }
}
