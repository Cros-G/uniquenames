import express from 'express';
import { narrowDownController } from '../controllers/narrowDownController.js';

const router = express.Router();

// Narrow Down 处理端点
router.post('/narrow-down/process', narrowDownController.process);

export default router;



