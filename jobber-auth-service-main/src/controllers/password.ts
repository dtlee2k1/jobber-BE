import crypto from 'crypto';

import { changePasswordSchema, emailSchema, passwordSchema } from '@auth/schemes/password';
import {
  findAuthUserByPasswordToken,
  findUserByEmail,
  findUserByUsername,
  updatePassword,
  updatePasswordResetToken
} from '@auth/services/auth.service';
import { IAuthDocument, IEmailMessageDetails } from '@dtlee2k1/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import envConfig from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';
import AuthModel from '@auth/models/auth.schema';
import { BadRequestError } from '@auth/error-handler';

export async function forgotPassword(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(emailSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password createPasswordResetToken() method error');
  }

  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await findUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Password createPasswordResetToken() method error');
  }

  // Generate password reset token
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters = randomBytes.toString('hex');

  // Set expiration date for password reset token
  const date = new Date();
  date.setHours(date.getHours() + 1);

  await updatePasswordResetToken(existingUser.id!, randomCharacters, date);

  const resetLink = `${envConfig.CLIENT_URL}/reset_password?token=${randomCharacters}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    resetLink,
    username: existingUser.username,
    template: 'forgotPassword'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-auth-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Forgot password message has been sent to notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Check email to reset password' });
}

export async function resetPassword(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(passwordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password resetPassword() method error');
  }

  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (password !== confirmPassword) {
    throw new BadRequestError('Passwords do not match', 'Password resetPassword() method error');
  }

  const existingUser: IAuthDocument | undefined = await findAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('Reset token has expired', 'Password resetPassword() method error');
  }

  const hashedPassword = await AuthModel.prototype.hashPassword(password);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-auth-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Reset password success message has been sent to notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
}

export async function changePassword(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Password changePassword() method error');
  }

  const { currentPassword, newPassword } = req.body;

  const existingUser: IAuthDocument | undefined = await findUserByUsername(req.currentUser?.username as string);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Password resetPassword() method error');
  }

  const isMatchPassword = await AuthModel.prototype.comparePassword(currentPassword, existingUser.password!);
  if (!isMatchPassword) {
    throw new BadRequestError('Current password is incorrect', 'Password resetPassword() method error');
  }

  const hashedPassword = await AuthModel.prototype.hashPassword(newPassword);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-auth-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Change password success message has been sent to notification service'
  );

  res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
}
