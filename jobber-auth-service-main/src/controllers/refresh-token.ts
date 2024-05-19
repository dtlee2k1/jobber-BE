import { BadRequestError } from '@auth/error-handler';
import { findUserByUsername, signToken } from '@auth/services/auth.service';
import { IAuthDocument } from '@dtlee2k1/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function refreshToken(req: Request, res: Response, _next: NextFunction) {
  const existingUser: IAuthDocument | undefined = await findUserByUsername(req.params.username);
  if (!existingUser) {
    throw new BadRequestError('User not found', 'CurrentUser resentEmail() method error');
  }

  const userJWT = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  const userData = omit(existingUser, ['password']);

  res.status(StatusCodes.OK).json({
    message: 'Refresh token successfully',
    user: userData,
    token: userJWT
  });
}
