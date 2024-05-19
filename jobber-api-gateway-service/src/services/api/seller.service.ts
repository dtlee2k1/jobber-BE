import { AxiosInstance } from 'axios';
import { envConfig } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { ISellerDocument } from '@dtlee2k1/jobber-shared';

export let axiosSellerInstance: AxiosInstance;

class SellerService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${envConfig.USERS_BASE_URL}/api/v1/seller`, 'seller');
    axiosSellerInstance = this.axiosService.instance;
  }

  async getSellerById(sellerId: string) {
    const response = await axiosSellerInstance.get(`/id/${sellerId}`);
    return response;
  }

  async getSellerByUsername(username: string) {
    const response = await axiosSellerInstance.get(`/username/${username}`);
    return response;
  }

  async getRandomSellers(size: string) {
    const response = await axiosSellerInstance.get(`/random/${size}`);
    return response;
  }

  async createSeller(body: ISellerDocument) {
    const response = await axiosSellerInstance.post('/create', body);
    return response;
  }

  async updateSeller(sellerId: string, body: ISellerDocument) {
    const response = await axiosSellerInstance.put(`/${sellerId}`, body);
    return response;
  }

  async seedingSellers(count: string) {
    const response = await axiosSellerInstance.put(`/seed/${count}`);
    return response;
  }
}

export const sellerService = new SellerService();
