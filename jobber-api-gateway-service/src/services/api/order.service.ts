import { IDeliveredWork, IExtendedDelivery, IOrderDocument, IOrderMessage } from '@dtlee2k1/jobber-shared';
import { AxiosService } from '@gateway/services/axios';
import { AxiosInstance } from 'axios';

export let axiosOrderInstance: AxiosInstance;

class OrderService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${process.env.ORDER_BASE_URL}/api/v1/order`, 'order');
    axiosOrderInstance = axiosService.instance;
  }

  async getOrderById(orderId: string) {
    const response = await axiosOrderInstance.get(`/${orderId}`);
    return response;
  }

  async sellerOrders(sellerId: string) {
    const response = await axiosOrderInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async buyerOrders(buyerId: string) {
    const response = await axiosOrderInstance.get(`/buyer/${buyerId}`);
    return response;
  }

  async createOrderIntent(price: number, buyerId: string) {
    const response = await axiosOrderInstance.post('/create-payment-intent', { price, buyerId });
    return response;
  }

  async createOrder(body: IOrderDocument) {
    const response = await axiosOrderInstance.post('/', body);
    return response;
  }

  async cancelOrder(paymentIntentId: string, orderId: string, body: IOrderMessage) {
    const response = await axiosOrderInstance.put(`/cancel/${orderId}`, { paymentIntentId, orderData: body });
    return response;
  }

  async requestDeliveryDateExtension(orderId: string, body: IExtendedDelivery) {
    const response = await axiosOrderInstance.put(`/extension/${orderId}`, body);
    return response;
  }

  async updateDeliveryDate(orderId: string, type: string, body: IExtendedDelivery) {
    const response = await axiosOrderInstance.put(`/gig/${type}/${orderId}`, body);
    return response;
  }

  async deliverOrder(orderId: string, body: IDeliveredWork) {
    const response = await axiosOrderInstance.put(`/deliver-order/${orderId}`, body);
    return response;
  }

  async approveOrder(orderId: string, body: IOrderMessage) {
    const response = await axiosOrderInstance.put(`/approve-order/${orderId}`, body);
    return response;
  }

  async getNotifications(userTo: string) {
    const response = await axiosOrderInstance.get(`/notification/${userTo}`);
    return response;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await axiosOrderInstance.put('/notification/mark-as-read', { notificationId });
    return response;
  }
}

export const orderService = new OrderService();
