/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as chatService from '@chat/services/message.service';
import { messageDocument, authUserPayload, chatMockRequest, chatMockResponse } from '@chat/controllers/test/mocks/chat.mock';
import * as helper from '@dtlee2k1/jobber-shared';
import { message as createMessage } from '@chat/controllers/create';
import { messageSchema } from '@chat/schemes/message';
import { BadRequestError } from '@chat/error-handler';

jest.mock('@chat/services/message.service');
jest.mock('@chat/elasticsearch');
jest.mock('@chat/schemes/message');
jest.mock('@dtlee2k1/jobber-shared');
jest.mock('@chat/error-handler');

describe('Chat Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete messageDocument.hasConversationId;
    messageDocument.file = '';
    jest.clearAllMocks();
  });

  describe('Create message method', () => {
    it('should throw an error for invalid schema data', async () => {
      const req: Request = chatMockRequest({}, messageDocument, authUserPayload) as unknown as Request;
      const res: Response = chatMockResponse();
      const next = jest.fn();

      jest.spyOn(messageSchema, 'validate').mockImplementation((): any =>
        Promise.resolve({
          error: {
            name: 'ValidationError',
            isJoi: true,
            details: [{ message: 'This is an error message' }]
          }
        })
      );

      createMessage(req, res, next).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('This is an error message', 'Create message() method error');
      });
    });

    it('should throw file upload error', () => {
      messageDocument.file = 'image';
      const req: Request = chatMockRequest({}, messageDocument, authUserPayload) as unknown as Request;
      const res: Response = chatMockResponse();
      const next = jest.fn();

      jest.spyOn(messageSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'uploadImages').mockImplementation((): any => Promise.resolve({ public_id: '' }));

      createMessage(req, res, next).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('File upload error. Try again', 'Create message() method error');
      });
    });

    it('should call createConversation method', async () => {
      messageDocument.hasConversationId = false;
      const req: Request = chatMockRequest({}, messageDocument, authUserPayload) as unknown as Request;
      const res: Response = chatMockResponse();
      const next = jest.fn();

      jest.spyOn(messageSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'uploadImages').mockImplementation((): any => Promise.resolve({ public_id: '123456' }));

      await createMessage(req, res, next);

      expect(chatService.createConversation).toHaveBeenCalledWith(
        `${messageDocument.conversationId}`,
        `${messageDocument.senderUsername}`,
        `${messageDocument.receiverUsername}`
      );
    });

    it('should call addMessage method', async () => {
      messageDocument.file = 'image';
      const req: Request = chatMockRequest({}, messageDocument, authUserPayload) as unknown as Request;
      const res: Response = chatMockResponse();
      const next = jest.fn();

      jest.spyOn(messageSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'uploadImages').mockImplementation((): any => Promise.resolve({ public_id: '123456', secure_url: 'image_url' }));

      messageDocument.file = 'image_url';
      jest.spyOn(chatService, 'addMessage').mockResolvedValue(messageDocument);

      await createMessage(req, res, next);

      expect(chatService.addMessage).toHaveBeenCalledWith(messageDocument);
    });

    it('should return correct json response', async () => {
      const req: Request = chatMockRequest({}, messageDocument, authUserPayload) as unknown as Request;
      const res: Response = chatMockResponse();
      const next = jest.fn();

      jest.spyOn(messageSchema, 'validate').mockImplementation((): any => Promise.resolve({ error: {} }));
      jest.spyOn(helper, 'uploadImages').mockImplementation((): any => Promise.resolve({ public_id: '123456' }));

      await createMessage(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Message added',
        conversationId: messageDocument.conversationId,
        messageData: messageDocument
      });
    });
  });
});
