import http from 'http';

import 'express-async-errors';

import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { Channel } from 'amqplib';
import envConfig from '@auth/config';
import { checkConnection, createIndex } from '@auth/elasticsearch';
import { createConnection } from '@auth/queues/connection';
import authRouter from '@auth/routes/auth.routes';
import currentUserRouter from '@auth/routes/current-user.routes';
import healthRouter from '@auth/routes/health.routes';
import { IAuthPayload, verifyGatewayRequest, winstonLogger } from '@dtlee2k1/jobber-shared';
import { CustomError, IErrorResponse } from '@auth/error-handler';
import searchRouter from '@auth/routes/search.routes';
import seedRouter from '@auth/routes/seed.routes';

const SERVER_PORT = 4002;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'authServer', 'debug');

export let authChannel: Channel;

export function start(app: Application) {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  errorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application) {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: envConfig.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(token, envConfig.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(urlencoded({ extended: true, limit: '200mb' }));
  app.use(json({ limit: '200mb' }));
}

function routesMiddleware(app: Application) {
  const BASE_PATH = '/api/v1/auth';

  app.use(healthRouter);
  app.use(BASE_PATH, searchRouter);
  app.use(BASE_PATH, seedRouter);

  app.use(BASE_PATH, verifyGatewayRequest, authRouter);
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRouter);
}

async function startQueues() {
  authChannel = (await createConnection()) as Channel;
}

async function startElasticSearch() {
  await checkConnection();
  await createIndex('gigs');
}

function errorHandler(app: Application) {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log({ level: 'error', message: `AuthService ${error.comingFrom}: ${error}` });

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

function startServer(app: Application) {
  try {
    const httpServer = new http.Server(app);
    logger.info(`Auth server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Auth server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    logger.log('error', 'AuthService startServer() error method:', error);
  }
}
