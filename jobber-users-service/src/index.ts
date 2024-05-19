import express from 'express';
import { start } from '@users/server';
import envConfig from '@users/config';
import { databaseConnection } from '@users/database';

function init() {
  envConfig.cloudinaryConfig();
  const app = express();
  databaseConnection();
  start(app);
}

init();
