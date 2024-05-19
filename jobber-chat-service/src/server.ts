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
import envConfig from '@chat/config';
import { CustomError, IErrorResponse } from '@chat/error-handler';
import { checkConnection } from '@chat/elasticsearch';
import { createConnection } from '@chat/queues/connection';
import healthRouter from '@chat/routes/health.routes';
import messageRouter from '@chat/routes/message.routes';
import { Server } from 'socket.io';

const SERVER_PORT = 4005;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'ChatService', 'debug');

let chatChannel: Channel;
let socketIOChatObject: Server;

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
  const BASE_PATH = '/api/v1/message';
  app.use(healthRouter);
  app.use(BASE_PATH, verifyGatewayRequest, messageRouter);
}

async function startQueues() {
  chatChannel = (await createConnection()) as Channel;
}

async function startElasticSearch() {
  await checkConnection();
}

function errorHandler(app: Application) {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log({ level: 'error', message: `ChatService ${error.comingFrom}: ${error}` });

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
}

async function startServer(app: Application) {
  try {
    const httpServer = new http.Server(app);
    const socketIO: Server = (await createSocketIO(httpServer)) as Server;
    startHttpServer(httpServer);
    socketIOChatObject = socketIO;
  } catch (error) {
    logger.log('error', 'ChatService startServer() error method:', error);
  }
}

async function createSocketIO(httpServer: http.Server) {
  try {
    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    return io;
  } catch (error) {
    logger.log('error', 'ChatService createSocketIO() error method:', error);
  }
}

async function startHttpServer(httpServer: http.Server) {
  try {
    logger.info(`Chat server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Chat server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    logger.log('error', 'ChatService startHttpServer() error method:', error);
  }
}

export { start, chatChannel, socketIOChatObject };
