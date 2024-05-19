import { authService } from '@gateway/services/api/auth.service';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function forgotPassword(req: Request, res: Response, _next: NextFunction) {
  const response = await authService.forgotPassword(req.body.email);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}

export async function resetPassword(req: Request, res: Response, _next: NextFunction) {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  const response = await authService.resetPassword(token, password, confirmPassword);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}

export async function changePassword(req: Request, res: Response, _next: NextFunction) {
  const { currentPassword, newPassword } = req.body;
  const response = await authService.changePassword(currentPassword, newPassword);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}
