import { IMessageDocument, IOrderDocument, IOrderNotifcation, winstonLogger } from '@dtlee2k1/jobber-shared';
import { envConfig } from '@gateway/config';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
let chatSocketClient: SocketClient; // socket between Gateway service (client) and Chat service (server)
let orderSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  constructor(io: Server) {
    this.io = io; // socket between Frontend (client) and Gateway service (server)
    this.gatewayCache = new GatewayCache();
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
  }

  public listen() {
    this.chatSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();

    this.io.on('connection', async (socket: Socket) => {
      socket.on('getLoggedInUsers', async () => {
        const response: string[] = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        socket.emit('online', response);
      });

      socket.on('saveLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        socket.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        socket.emit('online', response);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedGigCategory(`selectedCategories:${username}`, category);
      });
    });
  }

  private chatSocketServiceIOConnections() {
    chatSocketClient = io(`${envConfig.MESSAGE_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    chatSocketClient.on('connect', () => {
      logger.info('ChatService socket connected');
    });

    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      logger.log('error', `ChatService socket connection error: ${reason}`);

      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      logger.log('error', 'ChatService socket connection error:', error);
      chatSocketClient.connect();
    });

    // custom events
    chatSocketClient.on('message_received', (data: IMessageDocument) => {
      this.io.emit('message_received', data);
    });

    chatSocketClient.on('message_updated', (data: IMessageDocument) => {
      this.io.emit('message_updated', data);
    });
  }

  private orderSocketServiceIOConnections() {
    orderSocketClient = io(`${envConfig.ORDER_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    orderSocketClient.on('connect', () => {
      logger.info('OrderService socket connected');
    });

    orderSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      logger.log('error', `OrderService socket connection error: ${reason}`);

      orderSocketClient.connect();
    });

    orderSocketClient.on('connect_error', (error: Error) => {
      logger.log('error', 'OrderService socket connection error:', error);
      orderSocketClient.connect();
    });

    // custom event
    orderSocketClient.on('order_notification', (data: IOrderDocument, orderNotification: IOrderNotifcation) => {
      this.io.emit('order_notification', data, orderNotification);
    });
  }
}
