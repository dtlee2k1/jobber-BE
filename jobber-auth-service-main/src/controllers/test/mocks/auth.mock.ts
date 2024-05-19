import { IAuthDocument, IAuthPayload } from '@dtlee2k1/jobber-shared';
import { Response } from 'express';

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

interface IJWT {
  jwt?: string;
}

interface IAuthMock {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date | string;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'TestUser',
  email: 'test@example.com',
  iat: 1234567890
};

export const authMock: IAuthDocument = {
  id: 1,
  username: 'TestUser',
  email: 'test@example.com',
  country: 'Vietnam',
  emailVerified: 1,
  profilePicture: '',
  createdAt: '2024-03-04T04:26:06.223Z'
} as unknown as IAuthDocument;
