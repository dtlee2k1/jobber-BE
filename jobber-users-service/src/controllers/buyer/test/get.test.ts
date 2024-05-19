import { Request, Response } from 'express';
import * as buyer from '@users/services/buyer.service';
import { authUserPayload, buyerDocument, buyerMockRequest, buyerMockResponse } from '@users/controllers/buyer/test/mocks/buyer.mock';
import { currentUsername, email, username } from '@users/controllers/buyer/get';

jest.mock('@users/services/buyer.service');
jest.mock('@users/routes/buyer.routes');
jest.mock('@dtlee2k1/jobber-shared');

describe('Buyer Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('email method', () => {
    it('should return buyer profile', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload) as unknown as Request;
      const res: Response = buyerMockResponse();
      const next = jest.fn();

      jest.spyOn(buyer, 'getBuyerByEmail').mockResolvedValue(buyerDocument);

      await email(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Buyer profile',
        buyer: buyerDocument
      });
    });

    it('should return null', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload) as unknown as Request;
      const res: Response = buyerMockResponse();
      const next = jest.fn();

      jest.spyOn(buyer, 'getBuyerByEmail').mockResolvedValue(null);

      await email(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Buyer profile',
        buyer: null
      });
    });
  });

  describe('currentUsername method', () => {
    it('should return buyer profile', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload) as unknown as Request;
      const res: Response = buyerMockResponse();
      const next = jest.fn();

      jest.spyOn(buyer, 'getBuyerByUsername').mockResolvedValue(buyerDocument);

      await currentUsername(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Buyer profile',
        buyer: buyerDocument
      });
    });
  });

  describe('username method', () => {
    it('should return buyer profile', async () => {
      const req: Request = buyerMockRequest({}, authUserPayload, { username: 'TestUser' }) as unknown as Request;
      const res: Response = buyerMockResponse();
      const next = jest.fn();

      jest.spyOn(buyer, 'getBuyerByUsername').mockResolvedValue(buyerDocument);

      await username(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Buyer profile',
        buyer: buyerDocument
      });
    });
  });
});
