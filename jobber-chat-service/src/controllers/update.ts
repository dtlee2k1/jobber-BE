import { markMessageAsRead, markMultipleMessagesAsRead, updateOffer } from '@chat/services/message.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function offer(req: Request, res: Response, _next: NextFunction) {
  const { messageId, type } = req.body;

  const message = await updateOffer(messageId, type);

  res.status(StatusCodes.OK).json({
    message: 'Message updated successfully',
    singleMessage: message
  });
}

export async function markSingleMessage(req: Request, res: Response, _next: NextFunction) {
  const { messageId } = req.body;

  const message = await markMessageAsRead(messageId);

  res.status(StatusCodes.OK).json({
    message: 'Mark message as read successfully',
    singleMessage: message
  });
}

export async function markMultipleMessages(req: Request, res: Response, _next: NextFunction) {
  const { messageId, senderUsername, receiverUsername } = req.body;

  await markMultipleMessagesAsRead(receiverUsername, senderUsername, messageId);

  res.status(StatusCodes.OK).json({
    message: 'Mark messages as read successfully'
  });
}
