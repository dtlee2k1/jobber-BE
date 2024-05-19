import express from 'express';
import { start } from './server';

function init() {
  const app = express();
  start(app);
}

init();
