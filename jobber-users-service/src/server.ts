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
import envConfig from '@users/config';
import healthRouter from '@users/routes/health.routes';
import { CustomError, IErrorResponse } from '@users/error-handler';
import { checkConnection } from '@users/elasticsearch';
import buyerRouter from '@users/routes/buyer.routes';
import sellerRouter from '@users/routes/seller.routes';
import { createConnection } from '@users/queues/connection';
import {
  consumeBuyerDirectMessage,
  consumeReviewFanoutMessages,
  consumeSeedGigDirectMessage,
  consumeSellerDirectMessage
} from '@users/queues/user.consumer';

const SERVER_PORT = 4003;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'UsersService', 'debug');

export let userChannel: Channel;

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
  const BUYER_BASE_PATH = '/api/v1/buyer';
  const SELLER_BASE_PATH = '/api/v1/seller';

  app.use(healthRouter);

  app.use(BUYER_BASE_PATH, verifyGatewayRequest, buyerRouter);
  app.use(SELLER_BASE_PATH, verifyGatewayRequest, sellerRouter);
}

async function startQueues() {
  userChannel = (await createConnection()) as Channel;
  await consumeBuyerDirectMessage(userChannel);
  await consumeSellerDirectMessage(userChannel);
  await consumeReviewFanoutMessages(userChannel);
  await consumeSeedGigDirectMessage(userChannel);
}

async function startElasticSearch() {
  await checkConnection();
}

function errorHandler(app: Application) {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log({ level: 'error', message: `UsersService ${error.comingFrom}: ${error}` });

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

function startServer(app: Application) {
  try {
    const httpServer = new http.Server(app);
    logger.info(`Users server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Users server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    logger.log('error', 'UsersService startServer() error method:', error);
  }
}
