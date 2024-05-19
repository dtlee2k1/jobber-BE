import { IAuthPayload } from '@dtlee2k1/jobber-shared';
import { envConfig } from '@gateway/config';
import { NotAuthorizedError } from '@gateway/error-handler';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction) {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again', 'verifyUser() method error');
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${envConfig.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is not available. Please login again', 'verifyUser() method invalid session error');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this route', 'checkAuthentication() method error');
    }
    next();
  }
}

const authMiddleware = new AuthMiddleware();
export default authMiddleware;
