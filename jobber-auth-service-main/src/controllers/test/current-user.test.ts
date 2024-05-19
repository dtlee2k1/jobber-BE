import * as auth from '@auth/services/auth.service'; // use to mock the specific methods that need in testing
import { Request, Response } from 'express';
import { getCurrentUser, resendEmail } from '@auth/controllers/current-user';
import { authMock, authMockRequest, authMockResponse, authUserPayload } from '@auth/controllers/test/mocks/auth.mock';
import { Sequelize } from 'sequelize';
import { BadRequestError } from '@auth/error-handler';

jest.mock('@auth/services/auth.service'); // Mocking complete service
jest.mock('@dtlee2k1/jobber-shared');
jest.mock('@auth/queues/auth.producer');
jest.mock('@auth/routes/current-user.routes');
jest.mock('@auth/error-handler');

const USERNAME = 'TestUser';
const PASSWORD = '12345678';

let mockConnection: Sequelize;

describe('CurrentUser', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    mockConnection = new Sequelize(process.env.MYSQL_DB!, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        multipleStatements: true
      }
    });
    await mockConnection.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockConnection.close();
  });

  describe('getCurrentUser method', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(auth, 'findAuthUserById').mockResolvedValue(authMock);

      await getCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: authMock
      });
    });
  });

  describe('getCurrentUser method', () => {
    it('should return empty user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(auth, 'findAuthUserById').mockResolvedValue(undefined);

      await getCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: null
      });
    });
  });

  describe('resendEmail method', () => {
    it('should call BadRequestError for invalid email', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(auth, 'findUserByEmail').mockResolvedValue(undefined);

      resendEmail(req, res, next).catch(() => {
        expect(BadRequestError).toHaveBeenCalledWith('Email is invalid', 'CurrentUser resentEmail() method error');
      });
    });

    it('should call updateVerifyEmailField method', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(auth, 'findUserByEmail').mockResolvedValue(authMock);

      await resendEmail(req, res, next);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
    });

    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;
      const res: Response = authMockResponse();
      const next = jest.fn();

      jest.spyOn(auth, 'findUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(auth, 'findAuthUserById').mockResolvedValue(authMock);

      await resendEmail(req, res, next);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verification sent',
        user: authMock
      });
    });
  });
});
