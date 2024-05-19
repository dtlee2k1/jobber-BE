import { authService } from '@gateway/services/api/auth.service';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function createSeedUsers(req: Request, res: Response, _next: NextFunction) {
  const response = await authService.seedingUsers(req.params.count);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message
  });
}
