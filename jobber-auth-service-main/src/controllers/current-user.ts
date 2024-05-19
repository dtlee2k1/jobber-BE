import crypto from 'crypto';

import { findAuthUserById, findUserByEmail, updateVerifyEmailField } from '@auth/services/auth.service';
import { IAuthDocument, IEmailMessageDetails, lowerCase } from '@dtlee2k1/jobber-shared';
import { BadRequestError } from '@auth/error-handler';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import envConfig from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';

export async function getCurrentUser(req: Request, res: Response, _next: NextFunction) {
  const existingUser: IAuthDocument | undefined = await findAuthUserById(req.currentUser?.id as number);
  const user = existingUser ? existingUser : null;

  res.status(StatusCodes.OK).json({
    message: 'Authenticated user',
    user
  });
}

export async function resendEmail(req: Request, res: Response, _next: NextFunction) {
  const { email, userId } = req.body;
  const existingUser: IAuthDocument | undefined = await findUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Email is invalid', 'CurrentUser resentEmail() method error');
  }
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const verificationLink = `${envConfig.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-auth-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service'
  );
  const updatedUser: IAuthDocument = (await findAuthUserById(parseInt(userId))) as IAuthDocument;
  res.status(StatusCodes.OK).json({ message: 'Email verification sent', user: updatedUser });
}
