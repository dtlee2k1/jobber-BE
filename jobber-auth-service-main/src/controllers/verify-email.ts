import { BadRequestError } from '@auth/error-handler';
import { findAuthUserById, findAuthUserByVerificationToken, updateVerifyEmailField } from '@auth/services/auth.service';
import { IAuthDocument } from '@dtlee2k1/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function updateVerifyToken(req: Request, res: Response, _next: NextFunction) {
  const { token } = req.body;

  const existingUser: IAuthDocument | undefined = await findAuthUserByVerificationToken(token);
  if (!existingUser) {
    throw new BadRequestError('Verification token is either invalid or is already used', 'VerifyEmail updateVerifyToken() method error');
  }
  // Verify user
  await updateVerifyEmailField(existingUser.id!, 1, null);

  const updatedUser: IAuthDocument = (await findAuthUserById(existingUser.id!)) as IAuthDocument;
  res.status(StatusCodes.OK).json({
    message: 'Email verified successfully',
    user: updatedUser
  });
}
