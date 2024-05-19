import { authService } from '@gateway/services/api/auth.service';
import { Request, Response } from 'express';
import { getCurrentUser, getLoggedInUsers, removeLoggedInUser, resendEmail } from '@gateway/controllers/auth/current-user';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from '@gateway/controllers/auth/test/mocks/auth.mock';
import { Server } from 'socket.io';
import { AxiosResponse } from 'axios';
import * as socketServer from '@gateway/server';
import { GatewayCache } from '@gateway/redis/gateway.cache';

jest.mock('@gateway/services/api/auth.service');
jest.mock('@dtlee2k1/jobber-shared');
jest.mock('@gateway/elasticsearch');
jest.mock('@gateway/redis/gateway.cache');
jest.mock('@gateway/server');
jest.mock('@gateway/error-handler');

const USERNAME = 'TestUser';
const PASSWORD = '12345678';

Object.defineProperties(socketServer, {
  socketIO: {
    value: new Server(),
    writable: true
  }
});

describe('Auth current-user controller', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser method', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest
        .spyOn(authService, 'getCurrentUser')
        .mockResolvedValue({ data: { message: 'Authenticated user', user: authMock } } as unknown as AxiosResponse);

      await getCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: authMock
      });
    });
  });

  describe('resendEmail method', () => {
    it('should return correct response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest
        .spyOn(authService, 'reSendEmail')
        .mockResolvedValue({ data: { message: 'Email verification sent', user: authMock } } as unknown as AxiosResponse);

      await resendEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verification sent',
        user: authMock
      });
    });
  });

  describe('getLoggedInUsers method', () => {
    it('should return correct response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest
        .spyOn(GatewayCache.prototype, 'getLoggedInUsersFromCache')
        .mockResolvedValue(['testusername1', 'testusername2', 'testusername3']);
      jest.spyOn(socketServer.socketIO, 'emit');

      await getLoggedInUsers(req, res, next);

      expect(socketServer.socketIO.emit).toHaveBeenCalledWith('online', ['testusername1', 'testusername2', 'testusername3']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User is online'
      });
    });
  });

  describe('removeLoggedInUser method', () => {
    it('should return correct response', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload, {
        username: 'testusername3'
      }) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(GatewayCache.prototype, 'removeLoggedInUserFromCache').mockResolvedValue(['testusername1', 'testusername2']);
      jest.spyOn(socketServer.socketIO, 'emit');

      await removeLoggedInUser(req, res, next);

      expect(socketServer.socketIO.emit).toHaveBeenCalledWith('online', ['testusername1', 'testusername2']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User is offline'
      });
    });
  });
});
