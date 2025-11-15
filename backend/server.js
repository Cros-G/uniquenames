import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenRouterClient } from './openrouter.js';
import { generatePrompt } from './prompts/generator.js';
import promptRoutes from './routes/prompts.js';
import auditRoutes from './routes/audit.js';
import narrowDownRoutes from './routes/narrowDown.js';
import settingsRoutes from './routes/settings.js';
import { getDatabase } from './db/init.js';
import { Prompt } from './models/Prompt.js';
import { AuditLog } from './models/AuditLog.js';
import { replacePromptVariables } from './utils/promptUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 注册管理后台路由
app.use('/api/admin', promptRoutes);
app.use('/api/admin', auditRoutes);
app.use('/api/admin', settingsRoutes);

// 注册 Narrow Down 路由
app.use('/api', narrowDownRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Naming Tool API is running' });
});

// 流式生成名字端点
app.post('/api/generate-names', async (req, res) => {
  const { context, model } = req.body;

  console.log('\n🎯 ===== 收到新的起名请求 =====');
  console.log('📝 用户输入:', context);
  console.log('🤖 使用模型:', model || 'anthropic/claude-3.5-sonnet (默认)');
  console.log('⏰ 请求时间:', new Date().toLocaleString('zh-CN'));

  // 验证输入
  if (!context || context.trim() === '') {
    console.log('❌ 错误: 用户输入为空');
    return res.status(400).json({ error: 'Context is required' });
  }

  // 记录开始时间
  const startTime = Date.now();
  let fullOutput = '';

  try {
    // 设置 SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log('✅ SSE 连接已建立');

    // 从数据库按名称精确查找提示词
    const db = getDatabase();
    const genPrompt = db.prepare(
      'SELECT * FROM prompts WHERE tag = ? AND name = ? ORDER BY id DESC LIMIT 1'
    ).get('generation', 'Name Generation Prompt');
    
    let prompt;
    let promptId = null;
    
    if (genPrompt) {
      console.log('📝 使用数据库提示词:', genPrompt.name, 'v' + genPrompt.version);
      // 使用工具函数替换变量
      prompt = replacePromptVariables(genPrompt.content, {
        requirement: context.trim()
      });
      promptId = genPrompt.id;
    } else {
      console.log('⚠️  未找到 Name Generation Prompt，使用文件提示词');
      prompt = generatePrompt(context);
    }
    
    console.log('📄 提示词长度:', prompt.length, '字符');

    // 确定实际使用的模型（优先级：提示词 > 用户选择 > 默认值）
    const actualModel = genPrompt?.default_model || model || 'anthropic/claude-3.5-sonnet';
    console.log('🤖 提示词默认模型:', genPrompt?.default_model || '未设置');
    console.log('🤖 用户选择模型:', model || '未选择');
    console.log('🎯 实际使用模型:', actualModel);

    // 创建 OpenRouter 客户端
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('❌ 错误: OPENROUTER_API_KEY 未配置');
      throw new Error('OPENROUTER_API_KEY not configured');
    }
    console.log('🔑 API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

    const client = new OpenRouterClient(apiKey, actualModel);
    console.log('🤖 OpenRouter 客户端已创建');
    console.log('🚀 开始调用 API，等待响应...\n');

    let chunkCount = 0;
    let totalLength = 0;
    let usageInfo = null;

    // 流式输出
    for await (const chunk of client.generateNames(prompt)) {
      // chunk 现在是 {content, usage} 格式
      if (chunk.content) {
        chunkCount++;
        totalLength += chunk.content.length;
        fullOutput += chunk.content; // 累积完整输出
        
        // 每50个chunk显示一次进度
        if (chunkCount % 50 === 0) {
          console.log(`📦 已接收 ${chunkCount} 个数据块，共 ${totalLength} 字符`);
        }
        
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
      
      // 捕获 usage 信息
      if (chunk.usage) {
        usageInfo = chunk.usage;
        console.log('💰 Token 使用情况:', usageInfo);
      }
    }

    console.log('\n✅ 流式输出完成！');
    console.log('📊 统计: 共接收', chunkCount, '个数据块，', totalLength, '字符');
    
    // 计算费用（如果有 usage 信息）
    let costUsd = null;
    if (usageInfo) {
      // OpenRouter 的计费模型（需要根据实际模型调整）
      // 这里使用近似值，实际应该从 OpenRouter 获取或维护价格表
      const promptCostPer1k = 0.003;  // $0.003 per 1K prompt tokens
      const completionCostPer1k = 0.015; // $0.015 per 1K completion tokens
      
      costUsd = (
        (usageInfo.prompt_tokens / 1000) * promptCostPer1k +
        (usageInfo.completion_tokens / 1000) * completionCostPer1k
      );
      
      console.log('💵 预估费用: $' + costUsd.toFixed(6));
    }
    
    // 记录审计日志到数据库
    const duration = Date.now() - startTime;
    const logId = AuditLog.create(db, {
      model: actualModel, // 记录实际使用的模型
      promptId: promptId,
      userInput: context,
      systemPrompt: prompt,
      rawOutput: fullOutput,
      tokensPrompt: usageInfo?.prompt_tokens || null,
      tokensCompletion: usageInfo?.completion_tokens || null,
      tokensTotal: usageInfo?.total_tokens || null,
      costUsd: costUsd,
      durationMs: duration,
      success: true,
    });
    console.log('📝 审计日志已记录到数据库, ID:', logId);

    // 发送完成信号
    res.write('data: [DONE]\n\n');
    res.end();
    
    console.log('🎉 请求处理完成');
    console.log('===== 结束 =====\n');
  } catch (error) {
    console.error('\n❌ ===== 发生错误 =====');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    console.error('完整堆栈:', error.stack);
    console.error('===== 错误结束 =====\n');
    
    // 记录失败的审计日志到数据库
    const duration = Date.now() - startTime;
    const db = getDatabase();
    AuditLog.create(db, {
      model: model || 'anthropic/claude-3.5-sonnet',
      promptId: null,
      userInput: context,
      systemPrompt: prompt || generatePrompt(context),
      rawOutput: fullOutput,
      durationMs: duration,
      success: false,
      error: error.message,
    });
    
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on:`);
    console.log(`   本地: http://localhost:${PORT}`);
    console.log(`   局域网: http://0.0.0.0:${PORT}`);
    console.log(`📊 管理后台: /platform`);
  });
}

export default app;

