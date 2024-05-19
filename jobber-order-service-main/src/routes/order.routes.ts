import { notifications } from '@order/controllers/notification/get';
import { markSingleNotificationAsRead } from '@order/controllers/notification/update';
import { order, paymentIntent } from '@order/controllers/order/create';
import { buyerOrders, orderByOrderId, sellerOrders } from '@order/controllers/order/get';
import { approve, cancel, deliverOrder, deliveryDate, requestExtension } from '@order/controllers/order/update';
import { Router } from 'express';

const orderRouter = Router();

orderRouter.get('/notification/:userTo', notifications);

orderRouter.get('/:orderId', orderByOrderId);

orderRouter.get('/seller/:sellerId', sellerOrders);

orderRouter.get('/buyer/:buyerId', buyerOrders);

orderRouter.post('/create-payment-intent', paymentIntent);

orderRouter.post('/', order);

orderRouter.put('/cancel/:orderId', cancel);

orderRouter.put('/approve-order/:orderId', approve);

orderRouter.put('/extension/:orderId', requestExtension);

orderRouter.put('/gig/:type/:orderId', deliveryDate);

orderRouter.put('/deliver-order/:orderId', deliverOrder);

orderRouter.put('/notification/mark-as-read', markSingleNotificationAsRead);

export default orderRouter;
