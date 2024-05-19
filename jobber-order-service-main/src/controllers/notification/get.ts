import { IOrderNotifcation } from '@dtlee2k1/jobber-shared';
import { getNotificationsById } from '@order/services/notification.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function notifications(req: Request, res: Response, _next: NextFunction) {
  const notifications: IOrderNotifcation[] = await getNotificationsById(req.params.userTo);
  res.status(StatusCodes.OK).json({
    message: 'Get notifications successfully',
    notifications
  });
}
