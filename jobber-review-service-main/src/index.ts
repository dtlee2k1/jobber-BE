import express from 'express';
import { start } from '@review/server';
import { databaseConnection } from '@review/database';

function init() {
  const app = express();
  databaseConnection();
  start(app);
}

init();
