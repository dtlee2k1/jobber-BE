import { Router } from 'express';
import authMiddleware from '@gateway/services/auth-middleware';
import { buyerOrders, notifications, orderByOrderId, sellerOrders } from '@gateway/controllers/order/get';
import { order, paymentIntent } from '@gateway/controllers/order/create';
import { approve, cancel, deliverOrder, deliveryDate, markNotificationAsRead, requestExtension } from '@gateway/controllers/order/update';

const orderRouter = Router();

orderRouter.get('/order/notification/:userTo', authMiddleware.checkAuthentication, notifications);

orderRouter.get('/order/:orderId', authMiddleware.checkAuthentication, orderByOrderId);

orderRouter.get('/order/seller/:sellerId', authMiddleware.checkAuthentication, sellerOrders);

orderRouter.get('/order/buyer/:buyerId', authMiddleware.checkAuthentication, buyerOrders);

orderRouter.post('/order/create-payment-intent', authMiddleware.checkAuthentication, paymentIntent);

orderRouter.post('/order', authMiddleware.checkAuthentication, order);

orderRouter.put('/order/cancel/:orderId', authMiddleware.checkAuthentication, cancel);

orderRouter.put('/order/approve-order/:orderId', authMiddleware.checkAuthentication, approve);

orderRouter.put('/order/extension/:orderId', authMiddleware.checkAuthentication, requestExtension);

orderRouter.put('/order/gig/:type/:orderId', authMiddleware.checkAuthentication, deliveryDate);

orderRouter.put('/order/deliver-order/:orderId', authMiddleware.checkAuthentication, deliverOrder);

orderRouter.put('/order/notification/mark-as-read', authMiddleware.checkAuthentication, markNotificationAsRead);

export default orderRouter;
