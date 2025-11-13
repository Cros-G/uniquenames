import express from 'express';
import { auditController } from '../controllers/auditController.js';

const router = express.Router();

// 审计日志路由
router.get('/audit', auditController.getAll);
router.get('/audit/stats', auditController.getStats);
router.get('/audit/:id', auditController.getById);
router.delete('/audit', auditController.clear);

export default router;


