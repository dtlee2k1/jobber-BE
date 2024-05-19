/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as orderService from '@order/services/order.service';
import { orderDocument, authUserPayload, orderMockRequest, orderMockResponse } from '@order/controllers/order/test/mocks/order.mock';
import { order, paymentIntent } from '@order/controllers/order/create';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError } from '@order/error-handler';
import { IOrderDocument } from '@dtlee2k1/jobber-shared';

jest.mock('@order/services/order.service');
jest.mock('@order/elasticsearch');
jest.mock('@order/schemes/order');
jest.mock('@dtlee2k1/jobber-shared');
jest.mock('@order/error-handler');

const mockPaymentIntentsCreate = jest.fn();
const mockCustomersSearch = jest.fn();
jest.mock('stripe', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      paymentIntents: {
        create: (...args: any) => mockPaymentIntentsCreate(...args) as unknown
      },
      customers: {
        search: (...args: any) => mockCustomersSearch(...args) as unknown
      }
    }))
  };
});

describe('Order Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create paymentIntent method', () => {
    it('should create a new paymentIntent and return the correct response', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      const next = jest.fn();

      mockCustomersSearch.mockResolvedValueOnce({ data: [{ id: '12236362' }] });
      mockPaymentIntentsCreate.mockResolvedValueOnce({ client_secret: '123443', id: '23485848' });
      await paymentIntent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order intent created successfully',
        clientSecret: '123443',
        paymentIntentId: '23485848'
      });
    });
  });

  describe('Create order method', () => {
    it('should throw an error for invalid schema data', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      const next = jest.fn();

      jest.spyOn(orderSchema, 'validate').mockImplementation((): any =>
        Promise.resolve({
          error: {
            name: 'ValidationError',
            isJoi: true,
            details: [{ message: 'This is an error message' }]
          }
        })
      );

      order(req, res, next).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('This is an error message', 'Create order() method error');
      });
    });

    it('should call createOrder method', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      const next = jest.fn();

      jest.spyOn(orderSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));

      await order(req, res, next);
      expect(orderService.createOrder).toHaveBeenCalled();
    });

    it('should create a new order and return the correct response', async () => {
      const req: Request = orderMockRequest({}, orderDocument, authUserPayload) as unknown as Request;
      const res: Response = orderMockResponse();
      const next = jest.fn();

      const serviceFee: number = req.body.price < 50 ? (5.5 / 100) * req.body.price + 2 : (5.5 / 100) * req.body.price;
      let orderData: IOrderDocument = req.body;
      orderData = { ...orderData, serviceFee };

      jest.spyOn(orderSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(orderService, 'createOrder').mockResolvedValue(orderData);

      await order(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order created successfully',
        order: orderData
      });
    });
  });
});
