import http from 'http';

import 'express-async-errors';
import { winstonLogger } from '@dtlee2k1/jobber-shared';
import cookieSession from 'cookie-session';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import compression from 'compression';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { envConfig } from '@gateway/config';
import elasticSearch from '@gateway/elasticsearch';
import healthRouter from '@gateway/routes/health.routes';
import { axiosAuthInstance } from '@gateway/services/api/auth.service';
import { axiosBuyerInstance } from '@gateway/services/api/buyer.service';
import { axiosSellerInstance } from '@gateway/services/api/seller.service';
import { axiosGigInstance } from '@gateway/services/api/gig.service';
import { axiosMessageInstance } from '@gateway/services/api/message.service';
import { axiosOrderInstance } from '@gateway/services/api/order.service';
import { axiosReviewInstance } from '@gateway/services/api/review.service';
import authMiddleware from '@gateway/services/auth-middleware';
import authRouter from '@gateway/routes/auth.routes';
import currentUserRouter from '@gateway/routes/current-user.routes';
import searchRouter from '@gateway/routes/search.routes';
import buyerRouter from '@gateway/routes/buyer.routes';
import sellerRouter from '@gateway/routes/seller.routes';
import gigRouter from '@gateway/routes/gig.routes';
import messageRouter from '@gateway/routes/message.routes';
import orderRouter from '@gateway/routes/order.routes';
import reviewRouter from '@gateway/routes/review.routes';
import { CustomError, IErrorResponse } from '@gateway/error-handler';
import { SocketIOAppHandler } from '@gateway/sockets/socket';
import { isAxiosError } from 'axios';

const SERVER_PORT = 4000;
const DEFAULT_ERROR_CODE = 500;
const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug');

export let socketIO: Server;
export default class ApiGatewayServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start() {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application) {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${envConfig.SECRET_KEY_ONE}`, `${envConfig.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 60 * 60 * 1000, // 7 days,
        secure: envConfig.NODE_ENV !== 'development',
        ...(envConfig.NODE_ENV !== 'development' && {
          sameSite: 'none'
        })
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: envConfig.CLIENT_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosMessageInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosOrderInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
        axiosReviewInstance.defaults.headers['Authorization'] = `Bearer ${req.session.jwt}`;
      }
      next();
    });
  }

  private standardMiddleware(app: Application) {
    app.use(compression());
    app.use(urlencoded({ extended: true, limit: '200mb' }));
    app.use(json({ limit: '200mb' }));
  }

  // Frontend to API Gateway – http(s)://<host>:<port>/api/gateway/v1/auth
  // API Gateway to Auth Service – http(s)://<api-gateway-host>:<port>/api/v1/auth
  private routesMiddleware(app: Application) {
    const BASE_PATH = '/api/gateway/v1';

    app.use(healthRouter);
    app.use(BASE_PATH, authRouter);
    app.use(BASE_PATH, searchRouter);

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, buyerRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, sellerRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, gigRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, messageRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, orderRouter);
    app.use(BASE_PATH, authMiddleware.verifyUser, reviewRouter);
  }

  private async startElasticSearch() {
    await elasticSearch.checkConnection();
  }

  private errorHandler(app: Application) {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      logger.log({ level: 'error', message: `${fullUrl} endpoint does not existed` });
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not existed' });
      next();
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      logger.log({ level: 'error', message: `GatewayService ${error.comingFrom}: ${error}` });

      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }

      if (isAxiosError(error)) {
        logger.log({ level: 'error', message: `GatewayService Axios Error - ${error?.response?.data?.comingFrom}: ${error}` });

        res
          .status(error?.response?.data?.statusCode ?? DEFAULT_ERROR_CODE)
          .json({ message: error?.response?.data?.message ?? 'Error occurred' });
      }

      next();
    });
  }

  private async startServer(app: Application) {
    try {
      const httpServer = new http.Server(app);
      const socketIO: Server = (await this.createSocketIO(httpServer)) as Server;
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      logger.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private async createSocketIO(httpServer: http.Server) {
    try {
      const pubClient = createClient({ url: envConfig.REDIS_HOST });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      const io = new Server(httpServer, {
        cors: {
          origin: envConfig.CLIENT_URL,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        },
        adapter: createAdapter(pubClient, subClient)
      });

      socketIO = io;
      return io;
    } catch (error) {
      logger.log('error', 'GatewayService createSocketIO() error method:', error);
    }
  }

  private async startHttpServer(httpServer: http.Server) {
    try {
      logger.info(`Gateway server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        logger.info(`Gateway server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      logger.log('error', 'GatewayService startHttpServer() error method:', error);
    }
  }

  // SocketIO instances
  private async socketIOConnections(socketIO: Server) {
    const socketIOApp = new SocketIOAppHandler(socketIO);
    socketIOApp.listen();
  }
}
