import AuthModel from '@auth/models/auth.schema';
import { BadRequestError } from '@auth/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { findUserByEmail, findUserByUsername, signToken } from '@auth/services/auth.service';
import { IAuthDocument, isEmail } from '@dtlee2k1/jobber-shared';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function SignIn(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(loginSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signin SignIn() method error');
  }

  const { username, password } = req.body;

  const isValidEmail = isEmail(username);
  const existingUser: IAuthDocument | undefined = isValidEmail ? await findUserByEmail(username) : await findUserByUsername(username);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'Signin SignIn() method error');
  }

  const isMatchPasswords: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
  if (!isMatchPasswords) {
    throw new BadRequestError('Invalid credentials', 'Signin SignIn() method error');
  }

  const userJWT = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  const userData = omit(existingUser, ['password']);

  res.status(StatusCodes.OK).json({
    message: 'User login successfully',
    user: userData,
    token: userJWT
  });
}
