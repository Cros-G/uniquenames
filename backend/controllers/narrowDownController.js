import { getDatabase } from '../db/init.js';
import { OpenRouterClient } from '../openrouter.js';
import { NarrowDownOrchestrator } from '../orchestrators/NarrowDownOrchestrator.js';

/**
 * Narrow Down 控制器
 */
export const narrowDownController = {
  /**
   * 处理 Narrow Down 流程（SSE流式输出）
   */
  async process(req, res) {
    const { user_input, model } = req.body;

    console.log('\n🎯 ===== Narrow Down 请求 =====');
    console.log('📝 用户输入:', user_input?.substring(0, 100) + '...');
    console.log('🤖 使用模型:', model || 'anthropic/claude-4.5-sonnet (默认)');

    // 验证输入
    if (!user_input || user_input.trim() === '') {
      return res.status(400).json({ error: 'user_input is required' });
    }

    try {
      // 设置 SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const db = getDatabase();
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }

      const client = new OpenRouterClient(apiKey, model);
      const orchestrator = new NarrowDownOrchestrator(
        db,
        client,
        user_input,
        model || 'anthropic/claude-4.5-sonnet'
      );

      // 定义进度回调
      const onProgress = (data) => {
        const eventName = data.step || 'progress';
        res.write(`event: ${eventName}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        // 步骤1: 提取名字
        const step1Result = await orchestrator.step1_listNames(onProgress);
        res.write(`event: tracking\n`);
        res.write(`data: ${JSON.stringify(step1Result)}\n\n`);

        // 步骤2: 分析上下文
        const step2Result = await orchestrator.step2_isolate(onProgress);
        res.write(`event: isolate_complete\n`);
        res.write(`data: ${JSON.stringify(step2Result)}\n\n`);

        // 步骤3: 获取名字信息（并发）
        // 修改 onProgress 以发送每个名字的进度
        const step3Progress = (data) => {
          if (data.numbering) {
            res.write(`event: information_progress\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } else {
            onProgress(data);
          }
        };
        
        const step3Result = await orchestrator.step3_information(step3Progress);
        
        // 发送每个名字的完整evaluation
        orchestrator.evaluations.forEach((evaluation, index) => {
          res.write(`event: information_complete\n`);
          res.write(`data: ${JSON.stringify({
            numbering: orchestrator.nameCandidates[index].numbering,
            name: orchestrator.nameCandidates[index].name,
            evaluation: evaluation.evaluation,
          })}\n\n`);
        });

        // 步骤4: 排名决策
        const step4Result = await orchestrator.step4_decide(onProgress);
        res.write(`event: decide_complete\n`);
        res.write(`data: ${JSON.stringify(step4Result)}\n\n`);

        // 步骤5: 生成故事（并发）
        const step5Progress = (data) => {
          if (data.numbering) {
            res.write(`event: story_progress\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } else {
            onProgress(data);
          }
        };
        
        const step5Result = await orchestrator.step5_story(step5Progress);
        
        // 发送每个名字的故事
        orchestrator.stories.forEach((story) => {
          res.write(`event: story_complete\n`);
          res.write(`data: ${JSON.stringify(story)}\n\n`);
        });

        // 发送完成信号
        res.write(`event: done\n`);
        res.write(`data: ${JSON.stringify({ message: '完成' })}\n\n`);
        res.end();

        console.log('✅ Narrow Down 流程完成');

      } catch (error) {
        // 名字超限等业务错误
        if (error.message.includes('名字数量超过限制')) {
          res.write(`event: tracking_error\n`);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        } else {
          throw error; // 其他错误抛给外层处理
        }
      }

    } catch (error) {
      console.error('❌ Narrow Down 错误:', error);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  },
};



