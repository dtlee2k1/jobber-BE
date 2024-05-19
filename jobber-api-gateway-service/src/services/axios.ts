import { envConfig } from '@gateway/config';
import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

// Each service has its own instance since each service has different base url therefore each instance is responsible for request(API or JWT token from client that is added to cookie session) that is going from the API gateway to the microservice
export class AxiosService {
  public instance: AxiosInstance;

  constructor(baseUrl: string, serviceName: string) {
    this.instance = this.axiosCreateInstance(baseUrl, serviceName);
  }

  public axiosCreateInstance(baseUrl: string, serviceName?: string) {
    let gatewayToken = '';

    if (serviceName) {
      gatewayToken = jwt.sign({ id: serviceName }, `${envConfig.GATEWAY_JWT_TOKEN}`);
    }

    const instance: AxiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken
      },
      withCredentials: true // Determines whether cookies and authentication information (token) can be included in the request
    });

    return instance;
  }
}
