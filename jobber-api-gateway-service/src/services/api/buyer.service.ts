import { AxiosInstance } from 'axios';
import { envConfig } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';

export let axiosBuyerInstance: AxiosInstance;

class BuyerService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${envConfig.USERS_BASE_URL}/api/v1/buyer`, 'buyer');
    axiosBuyerInstance = this.axiosService.instance;
  }

  async getBuyerByEmail() {
    const response = await axiosBuyerInstance.get('/email');
    return response;
  }

  async getCurrentBuyerByUsername() {
    const response = await axiosBuyerInstance.get('/username');
    return response;
  }

  async getBuyerByUsername(username: string) {
    const response = await axiosBuyerInstance.get(`/${username}`);
    return response;
  }
}

export const buyerService = new BuyerService();
