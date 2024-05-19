import crypto from 'crypto';

import { createAuthUser, findUserByUsernameOrEmail } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import { generateUsername } from 'unique-username-generator';
import { v4 as uuidV4 } from 'uuid';
import { sample } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { IAuthDocument, firstLetterUppercase, lowerCase } from '@dtlee2k1/jobber-shared';
import { BadRequestError } from '@auth/error-handler';

export async function createSeedUsers(req: Request, res: Response, _next: NextFunction) {
  const { count } = req.params;
  const usernames: string[] = [];
  for (let i = 0; i < parseInt(count); i++) {
    const username: string = generateUsername('', 0, 12);
    usernames.push(firstLetterUppercase(username));
  }

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const email = faker.internet.email();
    const password = 'password';
    const country = faker.location.country();
    const profilePicture = faker.image.urlPicsumPhotos();

    const checkIfUserExist: IAuthDocument | undefined = await findUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials. Email or Username', 'Seed createSeedUsers() method error');
    }

    const profilePublicId = uuidV4();
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture,
      emailVerificationToken: randomCharacters,
      emailVerified: sample([0, 1])
    } as IAuthDocument;
    await createAuthUser(authData);
  }
  res.status(StatusCodes.CREATED).json({ message: 'Seed users created successfully' });
}
