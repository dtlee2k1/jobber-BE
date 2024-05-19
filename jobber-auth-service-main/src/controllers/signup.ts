import crypto from 'crypto';

import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, findUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import envConfig from '@auth/config';
import { StatusCodes } from 'http-status-codes';
import { IAuthDocument, IEmailMessageDetails, firstLetterUppercase, uploadImages } from '@dtlee2k1/jobber-shared';
import { BadRequestError } from '@auth/error-handler';

export async function signUp(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signup signUp() method error');
  }

  const { username, email, password, country, profilePicture } = req.body;

  const checkIfUserExist = await findUserByUsernameOrEmail(firstLetterUppercase(username), email);
  if (checkIfUserExist) {
    throw new BadRequestError('Invalid credentials. Email or Username', 'Signup signUp() method error');
  }

  const profilePublicId = uuidv4();
  const uploadResults: UploadApiResponse = (await uploadImages(profilePicture, profilePublicId, true, true)) as UploadApiResponse;

  if (!uploadResults.public_id) {
    throw new BadRequestError('File upload error. Try again', 'Signup signUp() method error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters = randomBytes.toString('hex');
  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email,
    password,
    country,
    profilePublicId,
    profilePicture: uploadResults?.secure_url,
    emailVerificationToken: randomCharacters
  } as IAuthDocument;

  const result = await createAuthUser(authData);

  const verifyLink = `${envConfig.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
    verifyLink,
    template: 'verifyEmail'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-auth-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service'
  );

  const userJWT = signToken(result.id!, result.email!, result.username!);

  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
}
