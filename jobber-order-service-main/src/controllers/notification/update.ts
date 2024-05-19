import { IOrderNotifcation } from '@dtlee2k1/jobber-shared';
import { markNotificationAsRead } from '@order/services/notification.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function markSingleNotificationAsRead(req: Request, res: Response, _next: NextFunction) {
  const notification: IOrderNotifcation = await markNotificationAsRead(req.body.notificationId);
  res.status(StatusCodes.OK).json({
    message: 'Mark notification as read successfully',
    notification
  });
}
