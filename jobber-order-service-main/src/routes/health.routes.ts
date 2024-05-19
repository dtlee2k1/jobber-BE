import { checkHealth } from '@order/controllers/health';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/order-health', checkHealth);

export default healthRouter;
