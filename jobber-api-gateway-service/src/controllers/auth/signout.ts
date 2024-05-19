import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function signOut(req: Request, res: Response, _next: NextFunction) {
  req.session = null;
  res.status(StatusCodes.OK).json({ message: 'Logout successfully', user: {} });
}
