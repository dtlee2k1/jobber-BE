import { AxiosInstance } from 'axios';
import { envConfig } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { IReviewDocument } from '@dtlee2k1/jobber-shared';

export let axiosReviewInstance: AxiosInstance;

class ReviewService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${envConfig.REVIEW_BASE_URL}/api/v1/review`, 'review');
    axiosReviewInstance = this.axiosService.instance;
  }

  async getReviewsByGigId(gigId: string) {
    const response = await axiosReviewInstance.get(`/gig/${gigId}`);
    return response;
  }

  async getReviewsBySellerId(sellerId: string) {
    const response = await axiosReviewInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async addReview(body: IReviewDocument) {
    const response = await axiosReviewInstance.post('/', body);
    return response;
  }
}

export const reviewService = new ReviewService();
