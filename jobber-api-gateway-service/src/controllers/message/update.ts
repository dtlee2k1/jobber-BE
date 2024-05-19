import { messageService } from '@gateway/services/api/message.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function offer(req: Request, res: Response, _next: NextFunction) {
  const { messageId, type } = req.body;
  const response = await messageService.updateOffer(messageId, type);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    singleMessage: response.data.singleMessage
  });
}

export async function markSingleMessage(req: Request, res: Response, _next: NextFunction) {
  const { messageId } = req.body;
  const response = await messageService.markMessageAsRead(messageId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    singleMessage: response.data.singleMessage
  });
}

export async function markMultipleMessages(req: Request, res: Response, _next: NextFunction) {
  const { messageId, senderUsername, receiverUsername } = req.body;
  const response = await messageService.markMultipleMessagesAsRead(receiverUsername, senderUsername, messageId);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}
