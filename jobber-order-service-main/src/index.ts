import express from 'express';
import { start } from '@order/server';
import envConfig from '@order/config';
import { databaseConnection } from '@order/database';

function init() {
  envConfig.cloudinaryConfig();
  const app = express();
  databaseConnection();
  start(app);
}

init();
