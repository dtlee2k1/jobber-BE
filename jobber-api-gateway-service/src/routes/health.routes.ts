import { healthController } from '@gateway/controllers/health.controllers';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/gateway-health', healthController);

export default healthRouter;
