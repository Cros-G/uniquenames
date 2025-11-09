import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenRouterClient } from './openrouter.js';
import { generatePrompt } from './prompts/generator.js';
import { logAPICall, getAuditLogs, getAuditLog, clearAuditLogs, getAuditStats } from './auditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

    // 生成提示词
    const prompt = generatePrompt(context);
    console.log('📄 提示词长度:', prompt.length, '字符');

    // 创建 OpenRouter 客户端
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.log('❌ 错误: OPENROUTER_API_KEY 未配置');
      throw new Error('OPENROUTER_API_KEY not configured');
    }
    console.log('🔑 API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

    const client = new OpenRouterClient(apiKey, model);
    console.log('🤖 OpenRouter 客户端已创建');
    console.log('🚀 开始调用 API，等待响应...\n');

    let chunkCount = 0;
    let totalLength = 0;

    // 流式输出
    for await (const chunk of client.generateNames(prompt)) {
      chunkCount++;
      totalLength += chunk.length;
      fullOutput += chunk; // 累积完整输出
      
      // 每50个chunk显示一次进度
      if (chunkCount % 50 === 0) {
        console.log(`📦 已接收 ${chunkCount} 个数据块，共 ${totalLength} 字符`);
      }
      
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    console.log('\n✅ 流式输出完成！');
    console.log('📊 统计: 共接收', chunkCount, '个数据块，', totalLength, '字符');
    
    // 记录审计日志
    const duration = Date.now() - startTime;
    logAPICall({
      model: model || 'anthropic/claude-3.5-sonnet',
      userInput: context,
      systemPrompt: prompt, // 完整的系统提示词
      rawOutput: fullOutput,
      tokensUsed: null, // OpenRouter 不总是返回token数
      duration: duration,
      success: true,
    });
    console.log('📝 审计日志已记录');

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
    
    // 记录失败的审计日志
    const duration = Date.now() - startTime;
    logAPICall({
      model: model || 'anthropic/claude-3.5-sonnet',
      userInput: context,
      systemPrompt: generatePrompt(context), // 完整的系统提示词
      rawOutput: fullOutput,
      duration: duration,
      success: false,
      error: error.message,
    });
    
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 审计日志相关端点
app.get('/api/audit/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = getAuditLogs(limit);
  res.json({ logs });
});

app.get('/api/audit/logs/:id', (req, res) => {
  const log = getAuditLog(req.params.id);
  if (!log) {
    return res.status(404).json({ error: 'Log not found' });
  }
  res.json({ log });
});

app.get('/api/audit/stats', (req, res) => {
  const stats = getAuditStats();
  res.json({ stats });
});

app.delete('/api/audit/logs', (req, res) => {
  const count = clearAuditLogs();
  res.json({ message: 'Logs cleared', count });
});

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

export default app;

