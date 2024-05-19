import { NextFunction, Response, Request, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const healthRouter = Router();

healthRouter.get('/notification-health', (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).send('Notification service is healthy and OK');
});

export default healthRouter;
