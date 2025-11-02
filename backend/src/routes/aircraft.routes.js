import express from 'express';
import { getAllAircraft } from '../controllers/aircraft.controller.js';

const router = express.Router();

// GET /api/aircraft → List all aircraft
router.get('/', getAllAircraft);

export default router;
