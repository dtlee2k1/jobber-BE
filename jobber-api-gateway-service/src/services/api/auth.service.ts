import { AxiosInstance } from 'axios';
import { envConfig } from '@gateway/config';
import { IAuth } from '@dtlee2k1/jobber-shared';
import { AxiosService } from '@gateway/services/axios';

export let axiosAuthInstance: AxiosInstance;

class AuthService {
  axiosService: AxiosService;

  constructor() {
    this.axiosService = new AxiosService(`${envConfig.AUTH_BASE_URL}/api/v1/auth`, 'auth');
    axiosAuthInstance = this.axiosService.instance;
  }

  async getCurrentUser() {
    const response = await axiosAuthInstance.get('/current-user');
    return response;
  }

  async getRefreshToken(username: string) {
    const response = await axiosAuthInstance.get(`/refresh-token/${username}`);
    return response;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await axiosAuthInstance.put('/change-password', { currentPassword, newPassword });
    return response;
  }

  async reSendEmail(data: { userId: string; email: string }) {
    const response = await axiosAuthInstance.post('/resend-email', data);
    return response;
  }

  async verifyEmail(token: string) {
    const response = await axiosAuthInstance.put('/verify-email', { token });
    return response;
  }

  async SignUp(body: IAuth) {
    const response = await this.axiosService.instance.post('/signup', body);
    return response;
  }

  async signIn(body: IAuth) {
    const response = await this.axiosService.instance.post('/signin', body);
    return response;
  }

  async forgotPassword(email: string) {
    const response = await this.axiosService.instance.put('/forgot-password', { email });
    return response;
  }

  async resetPassword(token: string, password: string, confirmPassword: string) {
    const response = await this.axiosService.instance.put(`/reset-password/${token}`, { password, confirmPassword });
    return response;
  }

  async getGigs(query: string, from: string, size: string, type: string) {
    const response = await this.axiosService.instance.get(`/search/gig/${from}/${size}/${type}?${query}`);
    return response;
  }

  async getGig(gigId: string) {
    const response = await this.axiosService.instance.get(`/search/gig/${gigId}`);
    return response;
  }

  async seedingUsers(count: string) {
    const response = await this.axiosService.instance.put(`/seed/${count}`);
    return response;
  }
}

export const authService = new AuthService();
