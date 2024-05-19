/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as reviewService from '@review/services/review.service';
import { reviewMockResponse, reviewMockRequest, reviewDocument, authUserPayload } from '@review/controllers/test/mocks/review.mock';
import { review } from '@review/controllers/create';

jest.mock('@review/services/review.service');
jest.mock('@review/elasticsearch');

describe('review Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create review method', () => {
    it('should create a new review and return the correct response', async () => {
      const req: Request = reviewMockRequest({}, reviewDocument, authUserPayload) as unknown as Request;
      const res: Response = reviewMockResponse();
      const next = jest.fn();

      jest.spyOn(reviewService, 'addReview').mockResolvedValue(reviewDocument);

      await review(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Review created successfully',
        review: reviewDocument
      });
    });
  });
});
