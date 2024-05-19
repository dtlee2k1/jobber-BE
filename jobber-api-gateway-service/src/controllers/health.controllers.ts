import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export function healthController(_req: Request, res: Response, _next: NextFunction) {
  res.status(StatusCodes.OK).send('Gateway service is healthy and OK');
}
