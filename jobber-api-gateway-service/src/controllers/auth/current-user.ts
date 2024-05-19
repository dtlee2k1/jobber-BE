import { GatewayCache } from '@gateway/redis/gateway.cache';
import { socketIO } from '@gateway/server';
import { authService } from '@gateway/services/api/auth.service';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

const gatewayCache = new GatewayCache();

export async function getCurrentUser(_req: Request, res: Response, _next: NextFunction) {
  const response = await authService.getCurrentUser();
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    user: response.data.user
  });
}

export async function resendEmail(req: Request, res: Response, _next: NextFunction) {
  const response = await authService.reSendEmail(req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    user: response.data.user
  });
}

export async function getLoggedInUsers(_req: Request, res: Response, _next: NextFunction) {
  const response: string[] = await gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
  socketIO.emit('online', response);

  res.status(StatusCodes.OK).json({
    message: 'User is online'
  });
}

export async function removeLoggedInUser(req: Request, res: Response, _next: NextFunction) {
  const response: string[] = await gatewayCache.removeLoggedInUserFromCache('loggedInUsers', req.params.username);
  socketIO.emit('online', response);

  res.status(StatusCodes.OK).json({
    message: 'User is offline'
  });
}
