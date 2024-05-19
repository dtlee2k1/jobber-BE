import express from 'express';
import { start } from '@auth/server';
import { databaseConnection } from '@auth/database';
import envConfig from '@auth/config';

function init() {
  envConfig.cloudinaryConfig();
  const app = express();
  databaseConnection();
  start(app);
}

init();
