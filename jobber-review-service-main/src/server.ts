import http from 'http';

import 'express-async-errors';

import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { Channel } from 'amqplib';
import { IAuthPayload, verifyGatewayRequest, winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@review/config';
import { CustomError, IErrorResponse } from '@review/error-handler';
import { checkConnection } from '@review/elasticsearch';
import { createConnection } from '@review/queues/connection';
import healthRouter from '@review/routes/health.routes';
import reviewRouter from '@review/routes/review.routes';

const SERVER_PORT = 4007;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'ReviewService', 'debug');

let reviewChannel: Channel;

function start(app: Application) {
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
  const BASE_PATH = '/api/v1/review';
  app.use(healthRouter);
  app.use(BASE_PATH, verifyGatewayRequest, reviewRouter);
}

async function startQueues() {
  reviewChannel = (await createConnection()) as Channel;
}

async function startElasticSearch() {
  await checkConnection();
}

function errorHandler(app: Application) {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log({ level: 'error', message: `ReviewService ${error.comingFrom}: ${error}` });

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

async function startServer(app: Application) {
  try {
    const httpServer = new http.Server(app);
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Review server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    logger.log('error', 'ReviewService startServer() error method:', error);
  }
}

export { start, reviewChannel };
