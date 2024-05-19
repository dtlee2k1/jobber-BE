import express from 'express';
import { start } from '@chat/server';
import envConfig from '@chat/config';
import { databaseConnection } from '@chat/database';

function init() {
  envConfig.cloudinaryConfig();
  const app = express();
  databaseConnection();
  start(app);
}

init();
