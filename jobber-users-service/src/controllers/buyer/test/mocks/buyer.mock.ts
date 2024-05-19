import { IAuthPayload, IBuyerDocument } from '@dtlee2k1/jobber-shared';
import { Response } from 'express';

export const buyerMockRequest = (sessionData: IJWT, currentUser?: IAuthPayload | null, params?: IParams) => ({
  session: sessionData,
  params,
  currentUser
});

export const buyerMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IParams {
  username?: string;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'TestUser',
  email: 'test@example.com',
  iat: 1234567890
};

export const buyerDocument: IBuyerDocument = {
  _id: '428475874bwhsqw2939829',
  username: 'TestUser',
  email: 'test@example.com',
  country: 'Vietnam',
  profilePicture: '',
  isSeller: false,
  purchasedGigs: [],
  createdAt: '2024-03-04T04:26:06.223Z'
};
