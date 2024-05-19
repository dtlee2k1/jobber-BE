import {
  IDeliveredWork,
  IExtendedDelivery,
  IOrderDocument,
  IOrderMessage,
  IReviewMessageDetails,
  lowerCase
} from '@dtlee2k1/jobber-shared';
import envConfig from '@order/config';
import { OrderModel } from '@order/models/order.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { orderChannel } from '@order/server';
import { sendNotification } from '@order/services/notification.service';

export async function getOrderByOrderId(orderId: string) {
  const order: IOrderDocument = (await OrderModel.findOne({
    orderId
  }).exec()) as IOrderDocument;
  return order;
}

export async function getOrdersBySellerId(sellerId: string) {
  const orders: IOrderDocument[] = await OrderModel.find({
    sellerId
  }).exec();
  return orders;
}

export async function getOrdersByBuyerId(buyerId: string) {
  const orders: IOrderDocument[] = await OrderModel.find({
    buyerId
  }).exec();
  return orders;
}

export async function createOrder(data: IOrderDocument) {
  const order: IOrderDocument = await OrderModel.create(data);
  const messageDetails: IOrderMessage = {
    sellerId: order.sellerId,
    ongoingJobs: 1,
    type: 'create-order'
  };

  // update seller info
  await publishDirectMessage(
    orderChannel,
    'jobber-seller-update',
    'user-seller',
    JSON.stringify(messageDetails),
    'Details sent to users service'
  );

  const emailMessageDetailsToSeller: IOrderMessage = {
    orderId: data.orderId,
    invoiceId: data.invoiceId, // generate from frontend
    orderDue: `${data.offer.newDeliveryDate}`, // format: MM dd, yyyy
    amount: `${data.price}`,
    receiverEmail: lowerCase(order.sellerEmail),
    buyerUsername: lowerCase(data.buyerUsername),
    sellerUsername: lowerCase(data.sellerUsername),
    title: data.offer.gigTitle,
    description: data.offer.description,
    requirements: data.requirements,
    serviceFee: `${order.serviceFee}`,
    total: `${order.price + order.serviceFee!}`,
    orderUrl: `${envConfig.CLIENT_URL}/orders/${data.orderId}/activities`,
    template: 'orderPlaced'
  };

  const emailMessageDetailsToBuyer: IOrderMessage = {
    orderId: data.orderId,
    invoiceId: data.invoiceId, // generate from frontend
    orderDue: `${data.offer.newDeliveryDate}`, // format: MM dd, yyyy
    amount: `${data.price}`,
    receiverEmail: lowerCase(order.buyerEmail),
    buyerUsername: lowerCase(data.buyerUsername),
    sellerUsername: lowerCase(data.sellerUsername),
    title: data.offer.gigTitle,
    description: data.offer.description,
    requirements: data.requirements,
    serviceFee: `${order.serviceFee}`,
    total: `${order.price + order.serviceFee!}`,
    orderUrl: `${envConfig.CLIENT_URL}/orders/${data.orderId}/activities`,
    template: 'orderReceipt'
  };
  // send email
  await Promise.all([
    publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(emailMessageDetailsToSeller),
      'Order email sent to notification service'
    ),
    publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(emailMessageDetailsToBuyer),
      'Order email sent to notification service'
    )
  ]);

  return order;
}

export async function cancelOrder(orderId: string, data: IOrderMessage) {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        cancelled: true,
        status: 'Cancelled',
        approvedAt: new Date()
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  // update seller info
  await publishDirectMessage(
    orderChannel,
    'jobber-seller-update',
    'user-seller',
    JSON.stringify({
      sellerId: data.sellerId,
      type: 'cancel-order'
    }),
    'Cancelled order details sent to users service'
  );

  // update buyer info
  await publishDirectMessage(
    orderChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify({
      buyerId: data.buyerId,
      purchasedGigId: data.purchasedGigId,
      type: 'cancel-order'
    }),
    'Cancelled order details sent to users service'
  );
  sendNotification(order, order.sellerUsername, 'Cancelled your order delivery');
  return order;
}

export async function approveOrder(orderId: string, data: IOrderMessage) {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        approved: true,
        status: 'Completed',
        approvedAt: new Date()
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  const messageDetails: IOrderMessage = {
    sellerId: data.sellerId,
    ongoingJobs: -1,
    completedJobs: 1,
    totalEarnings: data.totalEarnings, //the price the seller earned for latest order delivered
    recentDelivery: `${new Date()}`,
    type: 'approve-order'
  };

  // update seller info
  await publishDirectMessage(
    orderChannel,
    'jobber-seller-update',
    'user-seller',
    JSON.stringify(messageDetails),
    'Approved order details sent to users service'
  );

  // update buyer info
  await publishDirectMessage(
    orderChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify({
      buyerId: data.buyerId,
      purchasedGigId: data.purchasedGigId,
      type: 'purchased-gigs'
    }),
    'Approved order details sent to users service'
  );
  sendNotification(order, order.sellerUsername, 'Approved your order delivery');
  return order;
}

export async function sellerDeliverOrder(orderId: string, delivered: boolean, deliveredWork: IDeliveredWork) {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        delivered,
        status: 'Delivered',
        ['events.orderDelivered']: new Date()
      },
      $push: {
        deliveredWork
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  if (order) {
    const messageDetails: IOrderMessage = {
      orderId,
      receiverEmail: lowerCase(order.buyerEmail),
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      title: order.offer.gigTitle,
      description: order.offer.description,
      orderUrl: `${envConfig.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderDelivered'
    };

    // send email
    await publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service'
    );
    sendNotification(order, order.buyerUsername, 'Delivered your order');
  }

  return order;
}

export async function requestDeliveryExtension(orderId: string, data: IExtendedDelivery) {
  const { days, newDate, originalDate, reason } = data;
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        ['requestExtension.originalDate']: originalDate,
        ['requestExtension.newDate']: newDate,
        ['requestExtension.days']: days,
        ['requestExtension.reason']: reason
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  if (order) {
    const messageDetails: IOrderMessage = {
      receiverEmail: lowerCase(order.buyerEmail),
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      originalDate: order.requestExtension?.originalDate,
      newDate: order.requestExtension?.newDate,
      reason: order.requestExtension?.reason,
      orderUrl: `${envConfig.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtension'
    };

    // send email
    await publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service'
    );
    sendNotification(order, order.buyerUsername, 'Requested for an order delivery date extension');
  }

  return order;
}

export async function approveDeliveryDate(orderId: string, data: IExtendedDelivery) {
  const { days, newDate, originalDate, reason, deliveryDateUpdate } = data;
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $inc: { ['offer.deliveryInDays']: days },
      $set: {
        ['offer.oldDeliveryDate']: originalDate,
        ['offer.newDeliveryDate']: newDate,
        ['offer.reason']: reason,
        ['events.deliveryDateUpdate']: new Date(`${deliveryDateUpdate}`),
        requestExtension: {
          originalDate: '',
          newDate: '',
          days: 0,
          reason: ''
        }
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  if (order) {
    const messageDetails: IOrderMessage = {
      subject: 'Congratulations: Your extension request was approved',
      receiverEmail: lowerCase(order.sellerEmail),
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      header: 'Request Accepted',
      type: 'accepted',
      message: 'You can continue working on the order',
      orderUrl: `${envConfig.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension approval message sent to notification service'
    );
    sendNotification(order, order.sellerUsername, 'Approved your order delivery date extension request');
  }
  return order;
}

export async function rejectDeliveryDate(orderId: string) {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        requestExtension: {
          originalDate: '',
          newDate: '',
          days: 0,
          reason: ''
        }
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  if (order) {
    const messageDetails: IOrderMessage = {
      subject: 'Sorry: Your extension request was rejected',
      receiverEmail: lowerCase(order.sellerEmail),
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      header: 'Request Rejected',
      type: 'rejected',
      message: 'Please contact the buyer for more information',
      orderUrl: `${envConfig.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension rejection message sent to notification service'
    );
    sendNotification(order, order.sellerUsername, 'Rejected your order delivery date extension request');
  }
  return order;
}

export async function updateOrderReview(data: IReviewMessageDetails) {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId: data.orderId },
    {
      $set:
        data.type === 'buyer-review'
          ? {
              buyerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.buyerReview']: new Date(`${data.createdAt}`)
            }
          : {
              sellerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.sellerReview']: new Date(`${data.createdAt}`)
            }
    },
    { new: true }
  ).exec()) as IOrderDocument;

  sendNotification(
    order,
    data.type === 'buyer-review' ? order.sellerUsername : order.buyerUsername,
    `Left you a ${data.rating} star review`
  );
  return order;
}
