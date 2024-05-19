import { AxiosInstance } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { envConfig } from '@gateway/config';
import { IMessageDocument } from '@dtlee2k1/jobber-shared';

export let axiosMessageInstance: AxiosInstance;

class MessageService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${envConfig.MESSAGE_BASE_URL}/api/v1/message`, 'message');
    axiosMessageInstance = axiosService.instance;
  }

  async getConversation(senderUsername: string, receiverUsername: string) {
    const response = await axiosMessageInstance.get(`/conversation/${senderUsername}/${receiverUsername}`);
    return response;
  }

  async getMessages(senderUsername: string, receiverUsername: string) {
    const response = await axiosMessageInstance.get(`/${senderUsername}/${receiverUsername}`);
    return response;
  }

  async getConversationList(username: string) {
    const response = await axiosMessageInstance.get(`/conversations/${username}`);
    return response;
  }

  async getUserMessages(conversationId: string) {
    const response = await axiosMessageInstance.get(`/${conversationId}`);
    return response;
  }

  async addMessage(body: IMessageDocument) {
    const response = await axiosMessageInstance.post('/', body);
    return response;
  }

  async updateOffer(messageId: string, type: string) {
    const response = await axiosMessageInstance.put('/offer', { messageId, type });
    return response;
  }

  async markMessageAsRead(messageId: string) {
    const response = await axiosMessageInstance.put('/mark-as-read', { messageId });
    return response;
  }

  async markMultipleMessagesAsRead(receiverUsername: string, senderUsername: string, messageId: string) {
    const response = await axiosMessageInstance.put('/mark-multiple-as-read', {
      receiverUsername,
      senderUsername,
      messageId
    });
    return response;
  }
}

export const messageService = new MessageService();
