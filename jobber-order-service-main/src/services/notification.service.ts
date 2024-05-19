import { IOrderDocument, IOrderNotifcation } from '@dtlee2k1/jobber-shared';
import { OrderNotificationModel } from '@order/models/notification.schema';
import { socketIOOrderObject } from '@order/server';
import { getOrderByOrderId } from '@order/services/order.service';

export async function createNotification(data: IOrderNotifcation) {
  const notification: IOrderNotifcation = await OrderNotificationModel.create(data);
  return notification;
}

export async function getNotificationsById(userToId: string) {
  const notifications: IOrderNotifcation[] = await OrderNotificationModel.aggregate([
    {
      $match: { userTo: userToId }
    }
  ]);
  return notifications;
}

export async function markNotificationAsRead(notificationId: string) {
  const notification: IOrderNotifcation = (await OrderNotificationModel.findOneAndUpdate(
    { _id: notificationId },
    { $set: { isRead: true } },
    { new: true }
  )) as IOrderNotifcation;

  // Update notification as read in real time
  const order = await getOrderByOrderId(notification.orderId);
  socketIOOrderObject.emit('order_notification', order, notification);

  return notification;
}

export async function sendNotification(data: IOrderDocument, userToId: string, message: string) {
  const notification: IOrderNotifcation = {
    userTo: userToId,
    senderUsername: data.sellerUsername,
    senderPicture: data.sellerImage,
    receiverUsername: data.buyerUsername,
    receiverPicture: data.buyerImage,
    message,
    orderId: data.orderId
  } as IOrderNotifcation;
  const orderNotification: IOrderNotifcation = await createNotification(notification);
  socketIOOrderObject.emit('order_notification', data, orderNotification);
}
