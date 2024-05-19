import { getConversation, getMessages, getUserConversationList, getUserMessages } from '@chat/services/message.service';
import { IConversationDocument, IMessageDocument } from '@dtlee2k1/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function conversation(req: Request, res: Response, _next: NextFunction) {
  const { senderUsername, receiverUsername } = req.params;

  const conversations: IConversationDocument[] = await getConversation(senderUsername, receiverUsername);

  res.status(StatusCodes.OK).json({
    message: 'Get chat conversation successfully',
    conversations
  });
}

export async function conversationList(req: Request, res: Response, _next: NextFunction) {
  const { username } = req.params;

  const messages: IMessageDocument[] = await getUserConversationList(username);

  res.status(StatusCodes.OK).json({
    message: 'Get conversation list successfully',
    conversations: messages
  });
}

export async function messages(req: Request, res: Response, _next: NextFunction) {
  const { senderUsername, receiverUsername } = req.params;

  const messages: IMessageDocument[] = await getMessages(senderUsername, receiverUsername);

  res.status(StatusCodes.OK).json({
    message: 'Get chat messages successfully',
    messages
  });
}

export async function userMessages(req: Request, res: Response, _next: NextFunction) {
  const { conversationId } = req.params;

  const messages: IMessageDocument[] = await getUserMessages(conversationId);

  res.status(StatusCodes.OK).json({
    message: 'Get chat messages successfully',
    messages
  });
}
