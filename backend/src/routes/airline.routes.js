import express from 'express';
import { getAllAirlines } from '../controllers/airline.controller.js';

const router = express.Router();

// GET /api/airlines → get list of all airlines
router.get('/', getAllAirlines);

export default router;
