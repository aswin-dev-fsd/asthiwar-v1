import { Router } from 'express';
import { getHealth } from '../modules/health/health.controller.js';

const router = Router();

// Public Health Check Route
router.get('/health', getHealth);

export default router;
