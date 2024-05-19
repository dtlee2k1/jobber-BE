import { message } from '@gateway/controllers/message/create';
import { conversation, conversationList, messages, userMessages } from '@gateway/controllers/message/get';
import { markMultipleMessages, markSingleMessage, offer } from '@gateway/controllers/message/update';
import authMiddleware from '@gateway/services/auth-middleware';
import { Router } from 'express';

const messageRouter = Router();

messageRouter.get('/message/conversation/:senderUsername/:receiverUsername', authMiddleware.checkAuthentication, conversation);

messageRouter.get('/message/conversations/:username', authMiddleware.checkAuthentication, conversationList);

messageRouter.get('/message/:senderUsername/:receiverUsername', authMiddleware.checkAuthentication, messages);

messageRouter.get('/message/:conversationId', authMiddleware.checkAuthentication, userMessages);

messageRouter.post('/message/', authMiddleware.checkAuthentication, message);

messageRouter.put('/message/offer', authMiddleware.checkAuthentication, offer);

messageRouter.put('/message/mark-as-read', authMiddleware.checkAuthentication, markSingleMessage);

messageRouter.put('/message/mark-multiple-as-read', authMiddleware.checkAuthentication, markMultipleMessages);

export default messageRouter;
