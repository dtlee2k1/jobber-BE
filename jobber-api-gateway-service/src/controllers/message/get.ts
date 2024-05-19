import { messageService } from '@gateway/services/api/message.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function conversation(req: Request, res: Response, _next: NextFunction) {
  const { senderUsername, receiverUsername } = req.params;
  const response = await messageService.getConversation(senderUsername, receiverUsername);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    conversations: response.data.conversations
  });
}

export async function conversationList(req: Request, res: Response, _next: NextFunction) {
  const { username } = req.params;
  const response = await messageService.getConversationList(username);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    conversations: response.data.conversations
  });
}

export async function messages(req: Request, res: Response, _next: NextFunction) {
  const { senderUsername, receiverUsername } = req.params;
  const response = await messageService.getMessages(senderUsername, receiverUsername);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    messages: response.data.messages
  });
}

export async function userMessages(req: Request, res: Response, _next: NextFunction) {
  const { conversationId } = req.params;
  const response = await messageService.getUserMessages(conversationId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    messages: response.data.messages
  });
}
