import { AxiosInstance } from 'axios';
import { envConfig } from '@gateway/config';
import { AxiosService } from '@gateway/services/axios';
import { ISellerGig } from '@dtlee2k1/jobber-shared';

export let axiosGigInstance: AxiosInstance;

class GigService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${envConfig.GIG_BASE_URL}/api/v1/gig`, 'gig');
    axiosGigInstance = this.axiosService.instance;
  }

  async getGigById(gigId: string) {
    const response = await axiosGigInstance.get(`/${gigId}`);
    return response;
  }

  async getSellerGigs(sellerId: string) {
    const response = await axiosGigInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async getSellerPausedGigs(sellerId: string) {
    const response = await axiosGigInstance.get(`/seller/pause/${sellerId}`);
    return response;
  }

  async searchGigs(query: string, from: string, size: string, type: string) {
    const response = await axiosGigInstance.get(`/search/${from}/${size}/${type}?${query}`);
    return response;
  }

  async getTopRatedGigsByCategory(username: string) {
    const response = await axiosGigInstance.get(`/top/${username}`);
    return response;
  }

  async getGigsByCategory(username: string) {
    const response = await axiosGigInstance.get(`/category/${username}`);
    return response;
  }

  async getMoreGigsLikeThis(gigId: string) {
    const response = await axiosGigInstance.get(`/similar/${gigId}`);
    return response;
  }

  async createGig(body: ISellerGig) {
    const response = await axiosGigInstance.post('/create', body);
    return response;
  }

  async updateGig(gigId: string, body: ISellerGig) {
    const response = await axiosGigInstance.put(`/${gigId}`, body);
    return response;
  }

  async updateActiveGigProp(gigId: string, active: boolean) {
    const response = await axiosGigInstance.put(`/active/${gigId}`, { active });
    return response;
  }

  async deleteGig(gigId: string, sellerId: string) {
    const response = await axiosGigInstance.delete(`/${gigId}/${sellerId}`);
    return response;
  }

  async seed(count: string) {
    const response = await axiosGigInstance.put(`/seed/${count}`);
    return response;
  }
}

export const gigService = new GigService();
