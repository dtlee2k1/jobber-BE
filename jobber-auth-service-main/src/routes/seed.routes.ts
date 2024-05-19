import { createSeedUsers } from '@auth/controllers/seed';
import { Router } from 'express';

const seedRouter = Router();

seedRouter.put('/seed/:count', createSeedUsers);

export default seedRouter;
