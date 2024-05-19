import { authService } from '@gateway/services/api/auth.service';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function updateVerifyToken(req: Request, res: Response, _next: NextFunction) {
  const response = await authService.verifyEmail(req.body.token);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    user: response.data.user
  });
}
