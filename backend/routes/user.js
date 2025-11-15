import express from 'express';
import { initUser, getUserHistory, getUserStats, migrateAnonymousHistory } from '../controllers/userController.js';

const router = express.Router();

/**
 * POST /api/user/init
 * 初始化用户
 */
router.post('/init', initUser);

/**
 * GET /api/user/history
 * 获取用户历史
 */
router.get('/history', getUserHistory);

/**
 * GET /api/user/stats
 * 获取用户统计
 */
router.get('/stats', getUserStats);

/**
 * POST /api/user/migrate
 * 迁移匿名历史
 */
router.post('/migrate', migrateAnonymousHistory);

export default router;

