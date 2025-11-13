import express from 'express';
import { promptController } from '../controllers/promptController.js';

const router = express.Router();

// 提示词管理路由
router.get('/prompts', promptController.getAll);
router.get('/prompts/:id', promptController.getById);
router.get('/prompts/active/:tag', promptController.getActive);
router.post('/prompts', promptController.create);
router.put('/prompts/:id', promptController.update);
router.put('/prompts/:id/activate', promptController.activate);
router.delete('/prompts/:id', promptController.delete);

export default router;


