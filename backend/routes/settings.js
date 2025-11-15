import express from 'express';
import { settingsController } from '../controllers/settingsController.js';

const router = express.Router();

// 系统配置路由
router.get('/settings', settingsController.getAll);
router.put('/settings', settingsController.update);
router.post('/settings/reset', settingsController.reset);

export default router;



