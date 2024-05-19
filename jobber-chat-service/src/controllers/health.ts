import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export function checkHealth(_req: Request, res: Response, _next: NextFunction) {
  res.status(StatusCodes.OK).send('Chat service is healthy and OK');
}
