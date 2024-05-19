import { checkHealth } from '@chat/controllers/health';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/chat-health', checkHealth);

export default healthRouter;
