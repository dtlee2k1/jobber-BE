import express from 'express';
import ApiGatewayServer from '@gateway/server';
import redisConnection from '@gateway/redis/redis.connection';

class Application {
  public init() {
    const app = express();
    const server = new ApiGatewayServer(app);
    server.start();
    redisConnection.redisConnect();
  }
}

const application = new Application();

application.init();
