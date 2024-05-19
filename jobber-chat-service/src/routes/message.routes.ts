import { message } from '@chat/controllers/create';
import { conversation, conversationList, messages, userMessages } from '@chat/controllers/get';
import { markMultipleMessages, markSingleMessage, offer } from '@chat/controllers/update';
import { Router } from 'express';

const messageRouter = Router();

messageRouter.get('/conversation/:senderUsername/:receiverUsername', conversation);

messageRouter.get('/conversations/:username', conversationList);

messageRouter.get('/:senderUsername/:receiverUsername', messages);

messageRouter.get('/:conversationId', userMessages);

messageRouter.post('/', message);

messageRouter.put('/offer', offer);

messageRouter.put('/mark-as-read', markSingleMessage);

messageRouter.put('/mark-multiple-as-read', markMultipleMessages);

export default messageRouter;
