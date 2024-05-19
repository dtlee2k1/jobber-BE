import { messageService } from '@gateway/services/api/message.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function message(req: Request, res: Response, _next: NextFunction) {
  const response = await messageService.addMessage(req.body);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    conversationId: response.data.conversationId,
    messageData: response.data.messageData
  });
}
