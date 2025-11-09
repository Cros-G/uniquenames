import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从上级目录加载 .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('=====================================');
console.log('简单测试 - OpenRouter API 调用');
console.log('=====================================\n');

// 1. 检查 API Key
const apiKey = process.env.OPENROUTER_API_KEY;
console.log('1️⃣ 检查 API Key...');
if (!apiKey) {
  console.error('❌ 错误: 未找到 OPENROUTER_API_KEY');
  process.exit(1);
}
console.log('✅ API Key 存在:', apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 4));

// 2. 创建客户端
console.log('\n2️⃣ 创建 OpenAI 客户端...');
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/test',
    'X-Title': 'Test',
  },
});
console.log('✅ 客户端创建成功');

// 3. 发起测试请求
console.log('\n3️⃣ 发起 API 请求...');
console.log('请稍候...\n');

try {
  const stream = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'user', content: '请简单回复：你好' }
    ],
    stream: true,
  });

  console.log('✅ 开始接收流式响应:\n');
  console.log('-----------------------------------');
  
  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      process.stdout.write(content);
      fullResponse += content;
    }
  }
  
  console.log('\n-----------------------------------');
  console.log('\n✅ 测试成功！');
  console.log('📊 总共接收:', fullResponse.length, '字符');
  console.log('\n🎉 OpenRouter API 工作正常！');
  
} catch (error) {
  console.error('\n❌ 测试失败！');
  console.error('错误信息:', error.message);
  if (error.response) {
    console.error('响应状态:', error.response.status);
    console.error('响应数据:', error.response.data);
  }
  process.exit(1);
}

