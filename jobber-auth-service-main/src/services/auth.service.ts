import envConfig from '@auth/config';
import AuthModel from '@auth/models/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { IAuthBuyerMessageDetails, IAuthDocument, firstLetterUppercase } from '@dtlee2k1/jobber-shared';
import { sign } from 'jsonwebtoken';
import { omit } from 'lodash';
import { Model, Op } from 'sequelize';

export async function createAuthUser(data: IAuthDocument) {
  const result: Model<IAuthDocument> = await AuthModel.create(data);
  const messageDetails: IAuthBuyerMessageDetails = {
    username: result.dataValues.username!,
    profilePicture: result.dataValues.profilePicture!,
    email: result.dataValues.email!,
    country: result.dataValues.country!,
    createdAt: result.dataValues.createdAt!,
    type: 'auth'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer details sent to buyer service'
  );

  const userData: IAuthDocument = omit(result.dataValues, ['password']);
  return userData;
}

export async function findAuthUserById(authId: number) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: { id: authId },
    attributes: {
      exclude: ['password']
    }
  });

  return user?.dataValues;
}

export async function findUserByUsernameOrEmail(username: string, email: string) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: {
      [Op.or]: [
        {
          username: firstLetterUppercase(username)
        },
        { email: email.toLowerCase() }
      ]
    }
  });

  return user?.dataValues;
}

export async function findUserByUsername(username: string) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: {
      username: firstLetterUppercase(username)
    }
  });

  return user?.dataValues;
}

export async function findUserByEmail(email: string) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: {
      email: email.toLowerCase()
    }
  });

  return user?.dataValues;
}

export async function findAuthUserByVerificationToken(token: string) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: {
      emailVerificationToken: token
    },
    attributes: {
      exclude: ['password']
    }
  });

  return user?.dataValues;
}

export async function findAuthUserByPasswordToken(token: string) {
  const user: Model<IAuthDocument> | null = await AuthModel.findOne({
    where: {
      [Op.and]: [
        {
          passwordResetToken: token
        },
        { passwordResetExpires: { [Op.gt]: new Date() } }
      ]
    }
  });

  return user?.dataValues;
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken: string | null) {
  await AuthModel.update(
    {
      emailVerified,
      emailVerificationToken
    },
    { where: { id: authId } }
  );
}

export async function updatePasswordResetToken(authId: number, token: string, tokenExpiration: Date) {
  await AuthModel.update(
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    },
    { where: { id: authId } }
  );
}

export async function updatePassword(authId: number, password: string) {
  await AuthModel.update(
    {
      password,
      passwordResetToken: null,
      passwordResetExpires: new Date()
    },
    { where: { id: authId } }
  );
}

export function signToken(id: number, email: string, username: string) {
  return sign(
    {
      id,
      email,
      username
    },
    envConfig.JWT_TOKEN!
  );
}
